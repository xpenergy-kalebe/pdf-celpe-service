import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ExternalApiService } from '../external-services/external-celpe.service';
import { ExecuteLoginUseCase } from './';
import { PayloadHelper } from 'src/common/helpers/jwtHelper';
import { LoginRequest, LoginResponse } from '../external-services/dto';
import { UcInvoice, Invoice } from '../dto';

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
      throw new HttpException(error.message, error.getStatus());
    }
    let payload;
    try {
      if (token.token.ne === undefined) {
        throw new ForbiddenException('Token inválido ou não encontrado');
      }
      payload = PayloadHelper.decode(token.token.ne);
      if (!payload) {
        throw new Error('Falha ao processar o payload do token');
      }
      console.log(`Payload decodificado: ${JSON.stringify(payload)}`);
    } catch (error) {
      console.error('Erro ao decodificar o payload:', error.message);
    }
    const response: UcInvoice[] = [];
    if (payload.sub) {
      try {
        console.log('Buscando UCS associadas ao usuário...');
        const ucs = await this.externalApiService.getUcs(
          payload.sub,
          token.token.ne,
        );
        ucs.ucs = ucs.ucs.filter((uc) => {
          return uc.status === 'LIGADA';
        });
        if (ucs.ucs) {
          console.log(`Total de UCS encontradas: ${ucs.ucs.length}`);
          for (const uc of ucs.ucs) {
            if (uc.uc && payload.sub) {
              try {
                console.log(`Processando UC: ${uc.uc}`);

                // 1) pega protocolo e invoices UMA única vez
                let protocol = await this.externalApiService.getUcProtocol(
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

                // 2) para CADA fatura, isolamos o retry
                const invoicesData: Invoice[] = [];
                const maxAttempts = 3;

                for (const fatura of invoices.faturas.slice(0, months)) {
                  let attempts = 0;

                  while (attempts < maxAttempts) {
                    try {
                      console.log(
                        `Baixando fatura ${fatura.numeroFatura}` +
                          ` (tentativa ${attempts + 1}/${maxAttempts})`,
                      );

                      const pdfResponse =
                        await this.externalApiService.downloadPDFS(
                          uc.uc,
                          token.token.ne,
                          payload.sub,
                          String(protocol.protocoloSalesforce),
                          fatura.numeroFatura,
                        );

                      if (!pdfResponse.fileData) {
                        throw new Error('PDF não retornado pela API');
                      }

                      console.log(
                        `Fatura ${fatura.numeroFatura} baixada com sucesso.`,
                      );
                      invoicesData.push({
                        fileData: pdfResponse.fileData,
                        fileExtension: pdfResponse.fileExtension,
                        fileName: pdfResponse.fileName,
                        fileSize: Number(pdfResponse.fileSize),
                        month: fatura.mesReferencia,
                      });

                      break;
                    } catch (err) {
                      protocol = await this.externalApiService.getUcProtocol(
                        uc.uc,
                        token.token.ne,
                        payload.sub,
                      );
                      attempts++;
                      console.error(
                        `Erro ao baixar ${fatura.numeroFatura}` +
                          ` (tentativa ${attempts}/${maxAttempts}): ${err.message}`,
                      );
                      if (attempts === maxAttempts) {
                        console.error(
                          `Não foi possível baixar ${fatura.numeroFatura}` +
                            ` após ${maxAttempts} tentativas. Pulando.`,
                        );
                      }
                    }
                  }
                }

                response.push({
                  uc: Number(uc.uc),
                  instalation: Number(uc.contrato),
                  invoices: invoicesData,
                });
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
        if (error instanceof HttpException) {
          throw new HttpException(error.message, error.getStatus());
        }

        throw new HttpException(
          error.message || 'Erro inesperado ao buscar faturas.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else {
      console.error('Payload do token não contém o sub');
    }
    return response;
  }
}
