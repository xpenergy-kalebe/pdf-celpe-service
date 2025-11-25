import { Injectable } from '@nestjs/common';
import { LoginBot } from './bot/loginbot';
import { loginRequest } from './dto/login';
import { getAllBillsBot } from './bot/getAllBillsbot';
import { UcInvoice } from './dto/invoice.dto';
@Injectable()
export class CopelService {
  constructor(
    private readonly loginBot: LoginBot,
    private readonly getAllBillsBot: getAllBillsBot,
  ) {}
  async checkLogin(loginData: loginRequest): Promise<boolean> {
    return await this.loginBot.executeLogin(loginData);
  }

  async getAllBills(
    loginData: loginRequest,
    months: number,
  ): Promise<UcInvoice[]> {
    return await this.getAllBillsBot.getAllBills(loginData, months);
  }
}
