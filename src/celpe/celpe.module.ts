import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ExternalApiService } from './external-celpe.service';
import { ApiHelper } from 'src/common/helpers/apiHelper';

@Module({
    imports: [HttpModule],
    providers: [ExternalApiService, ApiHelper],
    exports: [ExternalApiService], 
  })
export class CelpeModule {}
