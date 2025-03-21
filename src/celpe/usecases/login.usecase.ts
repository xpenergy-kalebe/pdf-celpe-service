import { Injectable } from '@nestjs/common';
import {
  LoginRequest,
  LoginResponse,
} from '../external-services/dto/login.dto';
import { ExternalApiService } from '../external-services/external-celpe.service';

@Injectable()
export class ExecuteLoginUseCase {
  constructor(private readonly externalApiService: ExternalApiService) {}

  async execute(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const loginResponse = await this.externalApiService.Login(loginData);
      return loginResponse;
    } catch (error) {
      console.error('Erro no processo de login:', error.message);
      throw new Error('Falha ao executar o processo de login.');
    }
  }
}
