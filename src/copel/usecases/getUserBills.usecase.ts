import { Injectable, NotFoundException } from '@nestjs/common';
import { loginRequest } from '../dto/login';
import { CopelService } from '../copel.service';
import { UcInvoice } from '../dto/invoice.dto';

@Injectable()
export class GetUserBillsUseCase {
  constructor(private readonly copelService: CopelService) {}

  async execute(loginData: loginRequest, months: number): Promise<UcInvoice[]> {
    try {
      return await this.copelService.getAllBills(loginData, months);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : JSON.stringify(error);
      console.error('Erro no processo de login:', errorMessage);
      throw new NotFoundException(
        'Falha no login. Verifique suas credenciais.',
      );
    }
  }
}
