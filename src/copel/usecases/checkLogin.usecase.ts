import { Injectable, NotFoundException } from '@nestjs/common';
import { loginRequest } from '../dto/login';
import { CopelService } from '../copel.service';

@Injectable()
export class CheckLoginUseCase {
  constructor(private readonly copelService: CopelService) {}

  async execute(loginData: loginRequest): Promise<{ success: boolean }> {
    try {
      const loginResponse = await this.copelService.checkLogin(loginData);
      return loginResponse ? { success: true } : { success: false };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Erro no processo de login:', error.message);
      } else {
        console.error('Erro no processo de login:', String(error));
      }
      throw new NotFoundException(
        'Falha no login. Verifique suas credenciais.',
      );
    }
  }
}
