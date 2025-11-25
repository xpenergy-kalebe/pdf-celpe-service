import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
import { Page, Browser } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { loginRequest } from '../dto/login';
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

  async executeLogin(loginData: loginRequest): Promise<boolean> {
    const { username, password } = loginData;
    console.log(`[LoginBot] Iniciando login para ${username} na copel`);

    const viewport = {
      width: this.randInt(1200, 1440),
      height: this.randInt(700, 900),
      deviceScaleFactor: 1,
    };
    const userAgent =
      this.userAgents[this.randInt(0, this.userAgents.length - 1)];

    let browser: Browser | null = null;
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        // '--proxy-server=142.111.48.253:7030',
        '--disable-setuid-sandbox',
        `--window-size=${viewport.width},${viewport.height}`,
      ],
    });
    const [page] = await browser.pages();

    await page.setViewport(viewport);
    await page.setUserAgent(userAgent);

    await page.goto('https://www.copel.com/avaweb/paginaLogin/login.jsf', {
      waitUntil: 'networkidle2',
      timeout: 90000,
    });
    await this.typeHuman(page, 'input[name="formulario:numDoc"]', username);
    await this.typeHuman(page, 'input[name="formulario:pass"]', password);
    const enterBtnSel = 'span[class="ui-button-text ui-c"]';
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
    const hasError = await page
      .waitForSelector('div.ui-messages-error.ui-corner-all', { timeout: 3000 })
      .then(() => true)
      .catch(() => false);

    if (hasError) return false;

    const isLogged = await page
      .waitForSelector('h1.subTitulo', { timeout: 3000 })
      .then(() => true)
      .catch(() => false);

    return isLogged;
  }
}
