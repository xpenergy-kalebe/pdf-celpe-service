import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import cors from 'cors';
// Instância única do Express e do Nest
const expressApp = express();
let nestApp: any;
let isInitialized = false;

/**
 * Inicializa o Nest dentro do Express
 */
async function bootstrap() {
  if (isInitialized) return;

  console.log('🚀 Inicializando NestJS...');
  const adapter = new ExpressAdapter(expressApp);
  nestApp = await NestFactory.create(AppModule, adapter);

  expressApp.use(
    cors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: '*',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }),
  );
  await nestApp.init();
  isInitialized = true;

  console.log('✅ NestJS Initialized');
}

// Inicia o Nest logo no start
const ready = bootstrap();

/**
 * Exporta a função handler para Cloud Functions
 */
export async function main(req: Request, res: Response) {
  console.log('\n📥 Requisição recebida:');
  console.log('➡️  Método:', req.method);
  console.log('➡️  URL:', req.url);


  try {
    await ready;
    expressApp(req, res, () => {
      console.log('🔚 Express finalizou o request.');
      if (!res.headersSent) {
        res.status(404).send('Not Found');
      }
    });
  } catch (err) {
    console.error('❌ Erro ao processar requisição', err);
    if (!res.headersSent) {
      res.status(500).send('Internal server error');
    }
  }
}

/**
 * Loga todas as rotas registradas
 */
function printRoutes() {
  const router = expressApp._router;
  const routes: string[] = [];

  if (router && router.map) {
    for (const method in router.map) {
      router.map[method].forEach((route) => {
        routes.push(`${method.toUpperCase()} ${route.path}`);
      });
    }
  } else if (router && router.stack) {
    router.stack.forEach((middleware) => {
      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods)
          .filter((m) => middleware.route.methods[m])
          .join(', ')
          .toUpperCase();
        routes.push(`${methods} ${middleware.route.path}`);
      }
    });
  }

  console.log('\n📄 Rotas registradas pelo Nest/Express:\n');
  routes.forEach((route) => console.log(`➡️  ${route}`));
}
