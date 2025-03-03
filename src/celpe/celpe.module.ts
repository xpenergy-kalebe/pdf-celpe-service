import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ExternalApiService } from './external-celpe.service';
import { ApiHelper } from 'src/common/helpers/apiHelper';
import { LoginBot } from './bot/loginbot';
import { ExecuteLoginUseCase } from './usecases/login.usecase';
import { CelpeController } from './celpe.controller';
import { PayloadHelper } from 'src/common/helpers/jwtHelper';
import { GetUcsUseCase } from './usecases/getUcs.usecase';

@Module({
    imports: [HttpModule],
    providers: [ExternalApiService, ApiHelper, PayloadHelper, ExecuteLoginUseCase, GetUcsUseCase,  LoginBot],
    exports: [ExternalApiService, ExecuteLoginUseCase],
    controllers: [CelpeController], 
  })
export class CelpeModule {}
