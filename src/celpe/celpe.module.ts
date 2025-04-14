import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ExternalApiService } from './external-services/external-celpe.service';
import { ApiHelper } from 'src/common/helpers/apiHelper';
import { LoginBot } from './bot/loginbot';
import { CelpeController } from './celpe.controller';
import { PayloadHelper } from 'src/common/helpers/jwtHelper';
import { ExecuteLoginUseCase, GetUcsUseCase, GetUcUseCase, GetProtocolUseCase, GetInvoicesUseCase, GetAllPdfsUseCase, GetUCPix, GetAllPixUseCase } from './usecases';
// import { DownloadPdfsUseCase } from './usecases/downloadPdfs.usecase';
@Module({
  imports: [HttpModule],
  providers: [
    LoginBot,
    ExternalApiService,
    ApiHelper,
    PayloadHelper,
    GetProtocolUseCase,
    ExecuteLoginUseCase,
    GetUcUseCase,
    GetUcsUseCase,
    GetInvoicesUseCase,
    // DownloadPdfsUseCase,
    LoginBot,
    GetUCPix,
    GetAllPixUseCase,
    GetAllPdfsUseCase,
  ],
  exports: [ExternalApiService, ExecuteLoginUseCase],
  controllers: [CelpeController],
})
export class CelpeModule {}
