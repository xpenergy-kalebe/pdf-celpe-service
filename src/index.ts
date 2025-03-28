import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express, { Express, Request, Response } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

const server: Express = express();
let isInitialized = false;

async function createNestServer(expressInstance: Express) {
  const adapter = new ExpressAdapter(expressInstance);
  const app = await NestFactory.create(AppModule, adapter);
  
  await app.init();
  isInitialized = true;
  console.log('NestJS application initialized with AppModule');
}

const bootstrapPromise =  createNestServer(server);

export async function main(req: Request, res: Response) {
  await bootstrapPromise;
  if (!isInitialized) {
    throw new Error('NestJS application is not initialized yet.');
  }
  // Encaminha a requisição para o Express, que está integrado com o NestJS
  return server(req, res);
}
