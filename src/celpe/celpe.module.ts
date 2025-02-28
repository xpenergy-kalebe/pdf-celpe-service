import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ExternalApiService } from './external-celpe.service';
import { ApiHelper } from 'src/common/helpers/apiHelper';
import { LoginBot } from './bot/loginbot';

@Module({
    imports: [HttpModule],
    providers: [ExternalApiService, ApiHelper, LoginBot],
    exports: [ExternalApiService], 
  })
export class CelpeModule {}
