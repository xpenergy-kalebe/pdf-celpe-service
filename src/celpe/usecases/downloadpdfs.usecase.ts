import { Injectable } from '@nestjs/common';
import { ExternalApiService } from '../external-services/external-celpe.service';
import { ExecuteLoginUseCase } from './login.usecase';
import { PayloadHelper } from 'src/common/helpers/jwtHelper';
import { LoginRequest } from '../external-services/dto/login.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DownloadPdfsUseCase {
  constructor(
    private readonly externalApiService: ExternalApiService,
    private readonly login: ExecuteLoginUseCase,
  ) { }
  async execute(loginData: LoginRequest, months: number): Promise<void> {
    console.log('Iniciando execução do DownloadPdfsUseCase...');

    let token;
    try {
      token = await this.login.execute(loginData);
      if (!token) {
        throw new Error('Falha ao obter o token de autenticação');
      }
      console.log('Token obtido com sucesso.');
    } catch (error) {
      console.error('Erro ao obter o token:', error.message);
      return;
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
      return;
    }

    if (payload.sub) {
      try {
        console.log('Buscando UCS associadas ao usuário...');
        let ucs = await this.externalApiService.getUcs(
          payload.sub,
          token.token.ne,
        );

        // ucs.ucs = ucs.ucs.filter((uc) => {
        //   return uc.status === "LIGADA"
        // })
        
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
                      this.savePdf(
                        `${uc.uc} - ${uc.local?.endereco}`,
                        fatura.mesReferencia,
                        pdfResponse.fileData,
                      );
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
  }

  private savePdf(uc: string, fileName: string, fileData: string): void {
    console.log(`Salvando PDF para UC ${uc}: ${fileName}.pdf`);

    const directoryPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'downloaded_files',
      uc,
    );

    const safeFileName = fileName.replace(/\//g, '-');
    const filePath = path.join(directoryPath, `${safeFileName}.pdf`);

    try {
      if (!fs.existsSync(directoryPath)) {
        console.log(`Criando diretório: ${directoryPath}`);
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      const pdfBuffer = Buffer.from(fileData, 'base64');
      fs.writeFileSync(filePath, pdfBuffer);
      console.log(`Arquivo salvo com sucesso: ${filePath}`);
    } catch (error) {
      console.error(
        `Erro ao salvar o arquivo ${fileName}.pdf: ${error.message}`,
      );
    }
  }
}
