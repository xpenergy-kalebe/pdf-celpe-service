import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CelpeModule } from './celpe/celpe.module';

@Module({
  imports: [CelpeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
