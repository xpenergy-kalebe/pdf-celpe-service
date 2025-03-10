import { Injectable } from '@nestjs/common';
import { ExternalApiService } from '../external-services/external-celpe.service';
import { ExecuteLoginUseCase } from './login.usecase';
import { PayloadHelper } from 'src/common/helpers/jwtHelper';
import { LoginRequest } from '../external-services/dto/login.dto';
import { PixRequest, PixResponse } from '../external-services/dto/pix.dto';
import { Pix } from '../dto/pix.dto';

@Injectable()
export class GetUCPix {
  constructor(
    private readonly externalApiService: ExternalApiService,
    private readonly login: ExecuteLoginUseCase,
  ) {}

  async execute(loginData: LoginRequest, ucId: string): Promise<Pix> {
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
        const uc = await this.externalApiService.getUc(ucId, token.token.ne);

        const protocol = await this.externalApiService.getUcProtocol(
          ucId,
          token.token.ne,
          payload.sub,
        );

        const invoice = await this.externalApiService.getInvoices(
          ucId,
          token.token.ne,
          payload.sub,
          String(protocol.protocoloSalesforce),
        );

        const data: PixRequest = {
          canalSolicitante: 'AGP',
          codigo: uc.codigo,
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

        const getPix = await this.externalApiService.getPix(
          token.token.ne,
          data,
        );

        // console.log(`pix ${JSON.stringify(getPix)} from unity: ${uc.codigo}`);

        const { copiaColaPix } = getPix.dadosFatura;

        const response: Pix = {
          copyAndPaste: copiaColaPix,
          month: invoice.faturas[0].mesReferencia,
        };

        return response;
      } catch (error) {
        throw new Error('Falha');
      }
    } else {
      throw new Error('Payload do token não contém o sub');
    }
  }
}
