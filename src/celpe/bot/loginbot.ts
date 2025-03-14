import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chrome from 'chrome-aws-lambda';
import { Page } from 'puppeteer';

import {
  LoginRequest,
  LoginResponse,
} from '../external-services/dto/login.dto';

puppeteer.use(StealthPlugin());

@Injectable()
export class LoginBot {
  async executeLogin(loginData: LoginRequest): Promise<LoginResponse> {
    const { username, password } = loginData;
    console.log(`[LoginBot] Iniciando o login para o usuário: ${username}`);

    const isServerless = process.env.VERCEL_ENV !== undefined;

    // Inicia o navegador com as configurações do chrome-aws-lambda se estiver em ambiente serverless
    let browser;
    try {
      browser = await puppeteer.launch({
        args: isServerless ? chrome.args : ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: isServerless ? await chrome.executablePath : undefined,
        headless: isServerless ? chrome.headless : true,
        defaultViewport: isServerless ? chrome.defaultViewport : null,
      });
      console.log(`[LoginBot] Navegador iniciado`);
    } catch (error) {
      console.error(`[LoginBot] Erro ao iniciar o navegador: ${error.message}`);
      throw new Error('Falha ao iniciar o navegador.');
    }

    const page = await browser.newPage();

    // Promessa para capturar a resposta de login
    const loginResponsePromise = new Promise<LoginResponse>((resolve, reject) => {
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
            console.error(`[LoginBot] Erro ao processar a resposta: ${error.message}`);
            reject(new Error('Erro ao processar a resposta: ' + error.message));
          }
        }
      });
    });

    try {
      console.log(`[LoginBot] Acessando a página de login...`);
      await page.goto('https://agenciavirtual.neoenergia.com/#/login', {
        waitUntil: 'networkidle2',
        timeout: 90000,
      });
      console.log(`[LoginBot] Página de login carregada`);

      console.log(`[LoginBot] Iniciando simulação de movimento do mouse...`);
      await this.simulateMouseMovement(page);
      console.log(`[LoginBot] Simulação de movimento concluída`);

      console.log(`[LoginBot] Clicando na posição (250, 250)`);
      await page.mouse.click(250, 250);
      console.log(`[LoginBot] Rolando a página...`);
      await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
      await this.randomDelay();

      console.log(`[LoginBot] Aguardando seletor do botão de login...`);
      await page.waitForSelector('.btn-login.mat-button', { timeout: 90000 });
      console.log(`[LoginBot] Clicando no botão de login...`);
      await page.click('.btn-login.mat-button');
      await this.randomDelay();

      console.log(`[LoginBot] Aguardando campo de CPF/CNPJ...`);
      await page.waitForSelector('input[data-placeholder="CPF/CNPJ"]', { timeout: 90000 });
      console.log(`[LoginBot] Digitando CPF/CNPJ...`);
      await this.typeWithDelay(page, 'input[data-placeholder="CPF/CNPJ"]', username);
      await this.randomDelay();

      console.log(`[LoginBot] Aguardando campo de Senha...`);
      await page.waitForSelector('input[data-placeholder="Senha"]', { timeout: 90000 });
      console.log(`[LoginBot] Digitando Senha...`);
      await this.typeWithDelay(page, 'input[data-placeholder="Senha"]', password);
      await this.randomDelay();

      console.log(`[LoginBot] Clicando no botão Entrar...`);
      await page.click('button[title="Entrar"]');
      await this.randomDelay();

      console.log(`[LoginBot] Aguardando resposta do login...`);
      const loginResponse = await loginResponsePromise;
      console.log(`[LoginBot] Login realizado com sucesso`);

      await browser.close();
      console.log(`[LoginBot] Navegador fechado`);

      return loginResponse;
    } catch (error) {
      console.error(`[LoginBot] Erro no bot de login: ${error.message}`);
      await browser.close();
      throw new Error('Falha ao realizar o login.');
    }
  }

  private async simulateMouseMovement(page: Page): Promise<void> {
    const movements = [
      { x: 100, y: 100, steps: 5 },
      { x: 200, y: 200, steps: 7 },
      { x: 300, y: 300, steps: 10 },
      { x: 500, y: 500, steps: 12 },
    ];

    for (const move of movements) {
      console.log(`[LoginBot] Movendo o mouse para (${move.x}, ${move.y}) em ${move.steps} passos`);
      await page.mouse.move(move.x, move.y, { steps: move.steps });
      await this.randomDelay(200, 400);
    }
  }

  private async typeWithDelay(page: Page, selector: string, text: string): Promise<void> {
    console.log(`[LoginBot] Focando no seletor ${selector}`);
    await page.focus(selector);
    for (let i = 0; i < text.length; i++) {
      console.log(`[LoginBot] Digitando "${text[i]}" no seletor ${selector}`);
      await page.type(selector, text[i], { delay: this.getRandomDelay(50, 100) });
    }
  }

  private async randomDelay(min: number = 300, max: number = 700): Promise<void> {
    const delay = this.getRandomDelay(min, max);
    console.log(`[LoginBot] Aguardando por ${delay}ms`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
