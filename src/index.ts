import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import express, { Express, Request, Response } from "express";
import { ExpressAdapter } from "@nestjs/platform-express";

const server: Express = express();
let isInitialized = false;

async function createNestServer(expressInstance: Express) {
  const adapter = new ExpressAdapter(expressInstance);
  const app = await NestFactory.create(AppModule, adapter);
  app.enableCors({
    origin: "*",
  });
  await app.init();
  isInitialized = true;
}

const bootstrapPromise = createNestServer(server);

// Exporta uma função handler que garante que o Nest já foi inicializado
export async function main(req: Request, res: Response) {
  if (!isInitialized) {
    await bootstrapPromise;
  }
  return server(req, res);
}
