import { ForbiddenException, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
import { Page, Browser } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { loginResponsePromise } from './middlewares/responseInterceptor';
import { LoginRequest, LoginResponse } from '../external-services/dto';
import { storePrint } from 'src/services/firestore';
puppeteer.use(StealthPlugin());

@Injectable()
export class LoginBot {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15',
  ];

  private randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async humanDelay(min = 300, max = 1200) {
    const ms = this.randInt(min, max);
    await new Promise((r) => setTimeout(r, ms));
  }

  private async moveMouseHuman(page: Page, x: number, y: number) {
    const steps = this.randInt(15, 40);
    await page.mouse.move(x, y, { steps });
    await this.humanDelay(50, 150);
  }

  private async typeHuman(page: Page, selector: string, text: string) {
    const el = await page.waitForSelector(selector, {
      visible: true,
      timeout: 60000,
    });
    if (!el) {
      throw new Error(`Elemento não encontrado: ${selector}`);
    }
    const box = await el.boundingBox();
    if (box) {
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      await this.moveMouseHuman(page, cx, cy);
      await page.click(selector);
      for (const char of text) {
        await page.keyboard.type(char);
        await this.humanDelay(100, 300);
      }
    } else {
      throw new Error(`Elemento não encontrado: ${selector}`);
    }
  }

  private async scrollHuman(page: Page) {
    const distance = this.randInt(100, 300);
    await page.evaluate((d) => window.scrollBy(0, d), distance);
    await this.humanDelay(200, 500);
  }

  async executeLogin(loginData: LoginRequest): Promise<LoginResponse> {
    const { username, password } = loginData;
    console.log(`[LoginBot] Iniciando login para ${username}`);

    const viewport = {
      width: this.randInt(1200, 1440),
      height: this.randInt(700, 900),
      deviceScaleFactor: 1,
    };
    const userAgent =
      this.userAgents[this.randInt(0, this.userAgents.length - 1)];

    let browser: Browser | null = null;
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--proxy-server=23.95.150.145:6114',
        '--disable-setuid-sandbox',
        `--window-size=${viewport.width},${viewport.height}`,
      ],
    });

    const [page] = await browser.pages();
    await page.authenticate({
      username: 'bixnmzqq',
      password: '2rndb7684pdq',
    });
    try {
      await page.setViewport(viewport);
      await page.setUserAgent(userAgent);
      console.log(`[LoginBot] Navegador pronto (UA: ${userAgent})`);

      await this.humanDelay(800, 1500);
      await page.goto('https://agenciavirtual.neoenergia.com/#/login', {
        waitUntil: 'networkidle2',
        timeout: 90000,
      });
      console.log('[LoginBot] Página de login carregada');

      // Simula movimentos leves de mouse em torno da tela
      for (let i = 0; i < this.randInt(2, 4); i++) {
        const x = this.randInt(100, viewport.width - 100);
        const y = this.randInt(100, viewport.height - 100);
        await this.moveMouseHuman(page, x, y);
      }

      // Clica no botão inicial de login
      async function clickWithRetry(page: Page, selector: string, retries = 3) {
        for (let i = 0; i < retries; i++) {
          try {
            const loginBtn = await page.waitForSelector(selector, {
              timeout: 45000,
              visible: true,
            });
            if (!loginBtn) throw new Error('Botão não encontrado no DOM');

            const btnBox = await loginBtn.boundingBox();
            if (!btnBox) throw new Error('BoundingBox inválido');

            await this.moveMouseHuman(
              page,
              btnBox.x + btnBox.width / 2,
              btnBox.y + btnBox.height / 2,
            );
            await loginBtn.click({ delay: 100 });
            await this.humanDelay();
            return;
          } catch (err) {
            console.warn(`Tentativa ${i + 1} falhou:`, err);
            if (i === retries - 1) throw err;
            await page.waitForTimeout(2000);
          }
        }
      }
      await clickWithRetry.call(
        this,
        page,
        '.mat-focus-indicator.mat-flat-button.mat-button-base.mat-primary',
      );

      // CPF/CNPJ
      await this.typeHuman(
        page,
        'input[data-placeholder="CPF/CNPJ"]',
        username,
      );
      await this.scrollHuman(page);

      // Senha
      await this.typeHuman(page, 'input[data-placeholder="Senha"]', password);
      await this.humanDelay(500, 1000);

      // Botão Entrar
      const enterBtnSel = 'button[title="Entrar"]';
      const enterBtn = await page.waitForSelector(enterBtnSel, {
        timeout: 60000,
      });
      if (!enterBtn) {
        throw new Error('Enter button not found');
      }
      const enterBox = await enterBtn.boundingBox();
      if (enterBox) {
        await this.moveMouseHuman(
          page,
          enterBox.x + enterBox.width / 2,
          enterBox.y + enterBox.height / 2,
        );
        await page.click(enterBtnSel);
      }

      console.log('[LoginBot] Aguardando resposta...');
      const loginResponse = await Promise.race([
        loginResponsePromise(page),
        new Promise<LoginResponse>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 16000),
        ),
      ]);

      console.log('[LoginBot] Login bem-sucedido!');
      await browser.close();
      return loginResponse;
    } catch (err) {
      console.error(`[LoginBot] Falha no login: ${err.message}`);
      if (browser) {
        try {
          const screenshot = await page.screenshot();
          await storePrint(screenshot);
          console.log('[LoginBot] Print armazenado com sucesso');
        } catch (screenshotError) {
          console.error(
            `[LoginBot] Erro ao armazenar print: ${screenshotError.message}`,
          );
        }
      }
      if (browser) await browser.close();
      throw new ForbiddenException('Usuário não reconhecido');
    }
  }
}
