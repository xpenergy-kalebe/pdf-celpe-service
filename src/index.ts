import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express, { Express, Request, Response } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';

const server: Express = express();
let isInitialized = false;

async function createNestServer(expressInstance: Express) {
  const adapter: ExpressAdapter = new ExpressAdapter(expressInstance);
  const app: INestApplication = await NestFactory.create(AppModule, adapter);
  await app.init();
  isInitialized = true;

  // Add app.listen(3000) here
  app.listen(3000, () => {
    console.log('Application is running on http://localhost:3000');
  });
}

const bootstrapPromise = createNestServer(server);

export async function main(req: Request, res: Response) {
  server.use(async (_req: Request, _res: Response, next) => {
    if (!isInitialized) {
      await bootstrapPromise;
    }
    next();
  });
  return server(req, res);
}
