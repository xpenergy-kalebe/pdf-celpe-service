import { Body, Controller, HttpException, Param, Post } from '@nestjs/common';
import { CheckLoginUseCase } from './usecases/checkLogin.usecase';
import { GetUserBillsUseCase } from './usecases/getUserBills.usecase';
import { loginRequest } from './dto/login';
import { UcInvoice } from './dto/invoice.dto';
@Controller('copel')
export class CopelController {
  constructor(
    private checkLoginUseCase: CheckLoginUseCase,
    private getUserBillsUseCase: GetUserBillsUseCase,
  ) {}

  @Post('login')
  async login(@Body() loginData: loginRequest): Promise<{ success: boolean }> {
    try {
      const response = await this.checkLoginUseCase.execute(loginData);
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const status = error instanceof HttpException ? error.getStatus() : 500;
      throw new HttpException(message, status);
    }
  }
  async getPdfs(
    @Param('months') months: number,
    @Body() loginData: loginRequest,
  ): Promise<UcInvoice[]> {
    try {
      const response = await this.getUserBillsUseCase.execute(
        loginData,
        months,
      );
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const status = error instanceof HttpException ? error.getStatus() : 500;
      throw new HttpException(message, status);
    }
  }
}
