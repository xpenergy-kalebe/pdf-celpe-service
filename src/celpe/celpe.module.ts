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
import { GetAllPdfsUseCase } from './usecases/getAllPdfs.usecase';
import { GetUCPix } from './usecases/getUcPix.usecase';
import { GetAllPixUseCase } from './usecases/getAllPix.usecase';
import { DownloadPdfsUseCase } from './usecases/downloadPdfs.usecase';
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
    GetAllPixUseCase,
    GetAllPdfsUseCase
  ],
  exports: [ExternalApiService, ExecuteLoginUseCase],
  controllers: [CelpeController],
})
export class CelpeModule {}
