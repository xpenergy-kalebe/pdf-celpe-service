import { ForbiddenException, Injectable } from '@nestjs/common';
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import { simulateMouseMovement, typeWithDelay, randomDelay } from 'src/utils';
import { loginResponsePromise } from './middlewares/responseInterceptor';
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

    let browser;
    try {
      browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      console.log(`[LoginBot] Navegador iniciado`);
    } catch (error) {
      console.error(`[LoginBot] Erro ao iniciar o navegador: ${error.message}`);
      throw new Error('Falha ao iniciar o navegador.');
    }

    const page = await browser.newPage();


    try {
      console.log(`[LoginBot] Acessando a página de login...`);
      await page.goto('https://agenciavirtual.neoenergia.com/#/login', {
        waitUntil: 'networkidle2',
        timeout: 90000,
      });
      console.log(`[LoginBot] Página de login carregada`);

      console.log(`[LoginBot] Iniciando simulação de movimento do mouse...`);
      await simulateMouseMovement(page);
      console.log(`[LoginBot] Simulação de movimento concluída`);

      console.log(`[LoginBot] Clicando na posição (250, 250)`);
      await page.mouse.click(250, 250);
      console.log(`[LoginBot] Rolando a página...`);
      await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
      await randomDelay();

      console.log(`[LoginBot] Aguardando seletor do botão de login...`);
      await page.waitForSelector('.btn-login.mat-button', { timeout: 90000 });
      console.log(`[LoginBot] Clicando no botão de login...`);
      await page.click('.btn-login.mat-button');
      await randomDelay();

      console.log(`[LoginBot] Aguardando campo de CPF/CNPJ...`);
      await page.waitForSelector('input[data-placeholder="CPF/CNPJ"]', {
        timeout: 90000,
      });
      console.log(`[LoginBot] Digitando CPF/CNPJ...`);
      await typeWithDelay(
        page,
        'input[data-placeholder="CPF/CNPJ"]',
        username,
      );
      await randomDelay();

      console.log(`[LoginBot] Aguardando campo de Senha...`);
      await page.waitForSelector('input[data-placeholder="Senha"]', {
        timeout: 90000,
      });
      console.log(`[LoginBot] Digitando Senha...`);
      await typeWithDelay(
        page,
        'input[data-placeholder="Senha"]',
        password,
      );
      await randomDelay();

      console.log(`[LoginBot] Clicando no botão Entrar...`);
      await page.click('button[title="Entrar"]');
      await randomDelay();

      console.log(`[LoginBot] Aguardando resposta do login...`);
      const loginResponse = await Promise.race([
        loginResponsePromise(page),
        new Promise<LoginResponse>((_, reject) =>
          setTimeout(() => reject(), 5000)
        ),
      ]);
      console.log(`[LoginBot] Login realizado com sucesso`);

      await browser.close();
      console.log(`[LoginBot] Navegador fechado`);

      return loginResponse;
    } catch (error) {
      console.error(`[LoginBot] Erro no bot de login: ${error.message}`);
      await browser.close();
      throw new ForbiddenException('Usuário não reconhecido');
    }
  }

}
