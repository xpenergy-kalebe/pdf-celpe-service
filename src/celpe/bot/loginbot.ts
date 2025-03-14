import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
const chromium = require("@sparticuz/chromium");
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

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

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

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
          try {
            const responseBody: LoginResponse = await response.json();
            resolve(responseBody);
          } catch (error) {
            reject(new Error('Erro ao processar a resposta: ' + error.message));
          }
        }
      });
    });

    try {
      await page.goto('https://agenciavirtual.neoenergia.com/#/login', {
        waitUntil: 'networkidle2',
      });

      await this.simulateMouseMovement(page);

      await page.mouse.click(250, 250);
      await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
      await this.randomDelay();

      await page.waitForSelector('.btn-login.mat-button');
      await page.click('.btn-login.mat-button');
      await this.randomDelay();

      await page.waitForSelector('input[data-placeholder="CPF/CNPJ"]');
      await this.typeWithDelay(page, 'input[data-placeholder="CPF/CNPJ"]', username);
      await this.randomDelay();

      await page.waitForSelector('input[data-placeholder="Senha"]');
      await this.typeWithDelay(page, 'input[data-placeholder="Senha"]', password);
      await this.randomDelay();

      await page.click('button[title="Entrar"]');
      await this.randomDelay();

      const loginResponse = await loginResponsePromise;
      await browser.close();

      return loginResponse;
    } catch (error) {
      console.error('Erro no bot de login:', error.message);
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
      await page.mouse.move(move.x, move.y, { steps: move.steps });
      await this.randomDelay(200, 400);
    }
  }

  private async typeWithDelay(
    page: Page,
    selector: string,
    text: string,
  ): Promise<void> {
    await page.focus(selector);
    for (let i = 0; i < text.length; i++) {
      await page.type(selector, text[i], {
        delay: this.getRandomDelay(50, 100),
      });
    }
  }

  private async randomDelay(min: number = 300, max: number = 700): Promise<void> {
    const delay = this.getRandomDelay(min, max);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
