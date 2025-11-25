import { LoginResponse } from 'src/celpe/external-services/dto';
import { Page } from 'puppeteer';
export const loginResponsePromise = (page: Page) =>
  new Promise<LoginResponse>((resolve, reject) => {
    page.on('response', async (response) => {
      const url = response.url();
      const method = response.request().method();

      if (
        url.includes('autentica') &&
        response.status() !== 204 &&
        response.status() !== 304 &&
        method !== 'OPTIONS'
      ) {
        console.log(`[LoginBot] Resposta recebida da URL: ${url}`);
        try {
          const responseBody: LoginResponse = await response.json();
          console.log(`[LoginBot] Resposta processada com sucesso`);
          resolve(responseBody);
        } catch (error) {
          console.error(
            `[LoginBot] Erro ao processar a resposta: ${error.message}`,
          );
          reject(new Error('Erro ao processar a resposta: ' + error.message));
        }
      }
    });
  });
