import { Module } from '@nestjs/common';
import { CopelController } from './copel.controller';
import { LoginBot } from './bot/loginbot';
import { CopelService } from './copel.service';
import { CheckLoginUseCase } from './usecases/checkLogin.usecase';
import { GetUserBillsUseCase } from './usecases/getUserBills.usecase';
import { getAllBillsBot } from './bot/getAllBillsbot';
@Module({
  providers: [
    LoginBot,
    CopelService,
    CheckLoginUseCase,
    getAllBillsBot,
    GetUserBillsUseCase,
  ],
  controllers: [CopelController],
})
export class CopelModule {}
