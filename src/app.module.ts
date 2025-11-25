import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CelpeModule } from './celpe/celpe.module';
import { CopelModule } from './copel/copel.module';

@Module({
  imports: [CelpeModule, CopelModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {}
}
