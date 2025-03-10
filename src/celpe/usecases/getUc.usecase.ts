import { Injectable } from '@nestjs/common';
import { LoginRequest } from '../external-services/dto/login.dto';
import { ExternalApiService } from '../external-services/external-celpe.service';
import { UcResponse } from '../external-services/dto/ucs.dto';
import { ExecuteLoginUseCase } from './login.usecase';
import { PayloadHelper } from 'src/common/helpers/jwtHelper';

@Injectable()
export class GetUcUseCase {
  constructor(
    private readonly externalApiService: ExternalApiService,
    private readonly login: ExecuteLoginUseCase,
  ) {}

  async execute(
    loginData: LoginRequest,
    uc: string,
  ): Promise<UcResponse | null> {
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
        return await this.externalApiService.getUc(uc, token.token.ne);
      } catch (error) {
        throw new Error(`Falha ao obter os dados da uc: ${error.message}`);
      }
    } else {
      throw new Error('Payload do token não contém o sub');
    }
  }
}
