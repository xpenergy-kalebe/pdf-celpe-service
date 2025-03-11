import { Injectable } from '@nestjs/common';
import { ExternalApiService } from '../external-services/external-celpe.service';
import { ExecuteLoginUseCase } from './login.usecase';
import { PayloadHelper } from 'src/common/helpers/jwtHelper';
import { LoginRequest } from '../external-services/dto/login.dto';
import { PixRequest } from '../external-services/dto/pix.dto';
import { PixList } from '../dto/pix.dto';

@Injectable()
export class GetAllPixUseCase {
    constructor(
        private readonly externalApiService: ExternalApiService,
        private readonly login: ExecuteLoginUseCase,
    ) { }

    async execute(loginData: LoginRequest): Promise<PixList[]> {
        const token = await this.login.execute(loginData);
        if (!token) {
            throw new Error('Falha ao obter o token de autenticação');
        }

        const payload = PayloadHelper.decode(token.token.ne);

        if (!payload) {
            throw new Error('Falha ao processar o payload do token');
        }

        if (payload.sub) {
            try {
                const ucs = await this.externalApiService.getUcs(payload.sub, token.token.ne);
                const ucsFiltered = ucs.ucs.filter((uc) => {
                    return uc.status === "LIGADA"
                })
                let response: PixList[] = [];
                for (const uc of ucsFiltered){
                    try {

                        let protocol;
                        try {
                            protocol = await this.externalApiService.getUcProtocol(
                                uc.uc,
                                token.token.ne,
                                payload.sub,
                            );
                        } catch (error) {
                            console.log(`Erro ao buscar protocolo para UC ${uc.uc}:`, error);
                        }

                        let invoice;
                        try {
                            invoice = await this.externalApiService.getInvoices(
                                uc.uc,
                                token.token.ne,
                                payload.sub,
                                String(protocol.protocoloSalesforce),
                            );
                        } catch (error) {
                            console.log(`Erro ao buscar fatura para UC ${uc.uc}:`, error);
                        }

                        const data: PixRequest = {
                            canalSolicitante: 'AGP',
                            codigo: uc.uc,
                            distribuidora: 'CELPE',
                            documentoSolicitante: payload.sub,
                            documento: payload.sub,
                            numeroFatura: invoice.faturas[0].numeroFatura,
                            protocolo: String(protocol.protocoloSalesforce),
                            usuario: 'WSO2_CONEXAO',
                            tipoPerfil: 1,
                            tamanhoQrCode: '350',
                            geraSsOs: 'N',
                        };

                        try {
                            const pix = await this.externalApiService.getPix(
                                token.token.ne,
                                data,
                            );
                            response.push({
                                pix: {
                                    month: invoice.faturas[0].mesReferencia,
                                    copyAndPaste: pix.dadosFatura.copiaColaPix,
                                },
                                uc: Number(uc.uc),
                            });
                            console.log(JSON.stringify(response))
                        } catch (error) {
                            console.log(`Erro ao buscar PIX para UC ${uc.uc}:`, error);
                        }
                    } catch (error) {
                        console.log(`Erro inesperado na UC ${uc.uc}:`, error);
                    }
                };


                return response


            } catch (error) {
                throw new Error('Falha');
            }
        } else {
            throw new Error('Payload do token não contém o sub');
        }
    }
}
