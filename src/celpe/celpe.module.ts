import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ExternalApiService } from './external-services/external-celpe.service';
import { ApiHelper } from 'src/common/helpers/apiHelper';
import { LoginBot } from './bot/loginbot';
import { CelpeController } from './celpe.controller';
import { PayloadHelper } from 'src/common/helpers/jwtHelper';
import { ExecuteLoginUseCase } from './usecases/login.usecase';
import { GetUcsUseCase } from './usecases/getUcs.usecase';
import { GetUcUseCase } from './usecases/getUc.usecase';
import { GetProtocolUseCase } from './usecases/getProtocol.usecase';
import { GetInvoicesUseCase } from './usecases/getInvoices.usecase';
import { DownloadPdfsUseCase } from './usecases/downloadpdfs.usecase';
import { GetUCPix } from './usecases/getUcPix.usecase';
@Module({
  imports: [HttpModule],
  providers: [
    ExternalApiService,
    ApiHelper,
    PayloadHelper,
    GetProtocolUseCase,
    ExecuteLoginUseCase,
    GetUcUseCase,
    GetUcsUseCase,
    GetInvoicesUseCase,
    DownloadPdfsUseCase,
    LoginBot,
    GetUCPix,
  ],
  exports: [ExternalApiService, ExecuteLoginUseCase],
  controllers: [CelpeController],
})
export class CelpeModule {}
