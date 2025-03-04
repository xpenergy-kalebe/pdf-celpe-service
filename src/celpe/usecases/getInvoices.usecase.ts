import { Injectable } from '@nestjs/common';
import { invoicesResponse } from '../dto/fatura.dto';
import { ExternalApiService } from '../external-celpe.service';
import { ExecuteLoginUseCase } from './login.usecase';
import { PayloadHelper } from 'src/common/helpers/jwtHelper';
import { LoginRequest } from '../dto/login.dto';
@Injectable()
export class GetInvoicesUseCase {
  constructor(
    private readonly externalApiService: ExternalApiService,
    private readonly login: ExecuteLoginUseCase,
  ) {}

  async execute(
    loginData: LoginRequest,
    uc: string,
  ): Promise<invoicesResponse | undefined> {
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
        const protocol = await this.externalApiService.getUcProtocol(
          uc,
          token.token.ne,
          payload.sub,
        );
        if (protocol.protocoloSalesforce) {
          return await this.externalApiService.getInvoices(
            uc,
            token.token.ne,
            payload.sub,
            String(protocol.protocoloSalesforce),
          );
        }
      } catch (error) {
        throw new Error(`Falha ao obter os dados da UCS: ${error.message}`);
      }
    } else {
      throw new Error('Payload do token não contém o sub');
    }
  }
}
