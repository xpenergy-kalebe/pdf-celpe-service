import { Injectable } from '@nestjs/common';
import { ExternalApiService } from '../external-services/external-celpe.service';
import { ExecuteLoginUseCase } from './login.usecase';
import { PayloadHelper } from 'src/common/helpers/jwtHelper';
import { LoginRequest, LoginResponse } from '../external-services/dto/login.dto';
import { UcInvoice, Invoice } from '../dto/invoice.dto';


@Injectable()
export class GetAllPdfsUseCase {
  constructor(
    private readonly externalApiService: ExternalApiService,
    private readonly login: ExecuteLoginUseCase,
  ) {}

  async execute(loginData: LoginRequest, months: number): Promise<UcInvoice[]> {
    console.log('Iniciando execução de faturas...');

    let token: LoginResponse;
    try {
      token = await this.login.execute(loginData);
      if (!token) {
        throw new Error('Falha ao obter o token de autenticação');
      }
      console.log('Token obtido com sucesso.');
    } catch (error) {
      console.error('Erro ao obter o token:', error.message);
       return [];
    }

    let payload;
    try {
      payload = PayloadHelper.decode(token.token.ne);
      if (!payload) {
        throw new Error('Falha ao processar o payload do token');
      }
      console.log(`Payload decodificado: ${JSON.stringify(payload)}`);
    } catch (error) {
      console.error('Erro ao decodificar o payload:', error.message);
    }
    let response: UcInvoice[]=[]
    if (payload.sub) {
      try {
        console.log('Buscando UCS associadas ao usuário...');
        const ucs = await this.externalApiService.getUcs(
          payload.sub,
          token.token.ne,
        );

        if (ucs.ucs) {
          console.log(`Total de UCS encontradas: ${ucs.ucs.length}`);
          for (const uc of ucs.ucs) {
            if (uc.uc && payload.sub) {
              try {
                console.log(`Processando UC: ${uc.uc}`);

                const protocol = await this.externalApiService.getUcProtocol(
                  uc.uc,
                  token.token.ne,
                  payload.sub,
                );
                console.log(
                  `Protocolo obtido para UC ${uc.uc}: ${protocol.protocoloSalesforce}`,
                );

                const invoices = await this.externalApiService.getInvoices(
                  uc.uc,
                  token.token.ne,
                  payload.sub,
                  String(protocol.protocoloSalesforce),
                );
                console.log(
                  `Faturas encontradas para UC ${uc.uc}: ${invoices.faturas.length}`,
                );

                invoices.faturas.sort((a, b) =>
                  b.mesReferencia.localeCompare(a.mesReferencia),
                );
                let InvoicesData: Invoice[] =[]
                for (const fatura of invoices.faturas.slice(0, months)) {
                  try {
                    console.log(
                      `Baixando fatura: ${fatura.numeroFatura} - ${fatura.mesReferencia}`,
                    );

                    const pdfResponse =
                      await this.externalApiService.downloadPDFS(
                        uc.uc,
                        token.token.ne,
                        payload.sub,
                        String(protocol.protocoloSalesforce),
                        fatura.numeroFatura,
                      );

                    if (pdfResponse.fileData) {
                      console.log(
                        `Fatura ${fatura.numeroFatura} baixada com sucesso.`,
                      );
                      InvoicesData.push({fileData: pdfResponse.fileData, fileExtension: pdfResponse.fileExtension, fileName: pdfResponse.fileName, fileSize: Number(pdfResponse.fileSize), month: fatura.mesReferencia})
                    } else {
                      console.log(
                        `Falha ao baixar fatura ${fatura.numeroFatura}: PDF não encontrado.`,
                      );
                    }
                  } catch (pdfError) {
                    console.error(
                      `Erro ao tentar baixar o PDF da fatura ${fatura.numeroFatura}: ${pdfError.message}`,
                    );
                  }
                }
                response.push({uc: Number(uc.contrato), invoices: InvoicesData})
              } catch (protocolError) {
                console.error(
                  `Erro ao obter o protocolo para UC ${uc.uc}: ${protocolError.message}`,
                );
              }
            }
          }
        } else {
          console.log('Nenhuma UC encontrada.');
        }

      } catch (error) {
        console.error('Erro ao obter dados das UCS:', error.message);
      }
    } else {
      console.error('Payload do token não contém o sub');
    }
    return response
  }

}
