import { Injectable } from '@nestjs/common';
import { chromium, Page, Browser, ElementHandle } from 'playwright';
import { loginRequest } from '../dto/login';
import path from 'path';
import { Invoice, UcInvoice } from '../dto/invoice.dto';

@Injectable()
export class getAllBillsBot {
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
      state: 'visible',
      timeout: 60000,
    });
    if (!el) throw new Error(`Elemento não encontrado: ${selector}`);
    const box = await el.boundingBox();
    if (!box) throw new Error(`Elemento não encontrado: ${selector}`);
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await this.moveMouseHuman(page, cx, cy);
    await page.click(selector);
    for (const char of text) {
      await page.keyboard.type(char);
      await this.humanDelay(100, 300);
    }
  }

  private async scrollHuman(page: Page) {
    const distance = this.randInt(100, 300);
    await page.evaluate((d) => window.scrollBy(0, d), distance);
    await this.humanDelay(200, 500);
  }

  async getAllBills(
    loginData: loginRequest,
    months: number,
  ): Promise<UcInvoice[]> {
    const { username, password } = loginData;
    console.log(`[LoginBot] Iniciando login para ${username} na copel`);

    const viewport = {
      width: this.randInt(1200, 1440),
      height: this.randInt(700, 900),
    };
    const userAgent =
      this.userAgents[this.randInt(0, this.userAgents.length - 1)];

    const browser: Browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport,
      userAgent,
      acceptDownloads: true,
    });
    const page: Page = await context.newPage();

    await page.goto('https://www.copel.com/avaweb/paginaLogin/login.jsf', {
      waitUntil: 'networkidle',
    });

    await this.typeHuman(page, 'input[name="formulario:numDoc"]', username);
    await this.typeHuman(page, 'input[name="formulario:pass"]', password);

    const enterBtnSel = 'span[class="ui-button-text ui-c"]';
    const enterBtn = await page.waitForSelector(enterBtnSel, {
      state: 'visible',
      timeout: 60000,
    });
    if (!enterBtn) throw new Error('Enter button not found');

    const enterBox = await enterBtn.boundingBox();
    if (enterBox) {
      await this.moveMouseHuman(
        page,
        enterBox.x + enterBox.width / 2,
        enterBox.y + enterBox.height / 2,
      );
      await page.click(enterBtnSel);
    }

    const hasError = await page.$('div.ui-messages-error.ui-corner-all');
    if (hasError) {
      await browser.close();
      console.log('usuário inválido');
      throw new Error('Credenciais inválidas');
    }

    await page.waitForSelector('.ui-commandlink.ui-widget', { timeout: 60000 });
    const buttons = await page.$$('.ui-commandlink.ui-widget');
    console.log('total de unidades encontradas:', buttons.length);
    const bills: UcInvoice[] = [];
    for (let i = 0; i < buttons.length; i++) {
      const ucBills = await this.getUnitBills(i, page, months);
      if (ucBills) bills.push(ucBills);
      await page.goto('https://www.copel.com/avaweb/paginas/listarUcsDoc.jsf', {
        waitUntil: 'networkidle',
      });
    }
    console.log('Faturas baixadas:', bills);
    return bills;
  }

  private async getUnitBills(order: number, page: Page, numberOfBills: number) {
    console.log(`Acessando unidade de ordem ${order}`);
    const unitBills: Invoice[] = [];
    await page.waitForSelector('.ui-commandlink.ui-widget', { timeout: 60000 });

    const buttons = await page.$$('.ui-commandlink.ui-widget');
    const filtered: ElementHandle<SVGElement | HTMLElement>[] = [];
    for (const btn of buttons) {
      const text =
        (await btn.getAttribute('aria-label')) || (await btn.textContent());
      if (text?.trim() === 'Selecionar') {
        filtered.push(btn);
      }
    }
    console.log(filtered.length);
    await filtered[order].click();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('img[src="../img/icones/2VIA.png"]', {
      timeout: 60000,
    });
    const secondViaButton = await page.$('img[src="../img/icones/2VIA.png"]');
    if (!secondViaButton) return;
    await secondViaButton.click();
    await page.waitForLoadState('networkidle');

    const months = await page.$$eval('td[role="gridcell"]', (cells) => {
      const values: string[] = [];

      for (const cell of cells) {
        const span = cell.querySelector('span.ui-column-title');
        if (span && span.textContent?.includes('Mês Ref.')) {
          const fullText = cell.textContent?.trim() || '';
          const cleaned = fullText.replace('Mês Ref.', '').trim();
          if (/^\d{2}\/\d{4}$/.test(cleaned)) {
            const [month, year] = cleaned.split('/');
            values.push(`${year}/${month}`); // inverter
          }
        }
      }

      return values;
    });

    console.log(months); // Ex: ["2025/11", "2025/10", ...]

    console.log('Lista de meses encontrados:', months);

    const unidade = await page.textContent(
      'label.ui-outputlabel.ui-widget.Fs16.FontBold.orange.MarRight10',
    );

    console.log('Unidade:', unidade?.trim());
    const numberofCycles = Math.min(numberOfBills, months.length);
    for (let i = 0; i < numberofCycles; i++) {
      await page.waitForSelector('span.ui-column-title', { timeout: 60000 });
      console.log('baixando fatura do mês de', months[i]);
      const allButtons = await page.$$('a.ui-commandlink.ui-widget');
      const segundaViaButtons: ElementHandle<Element>[] = [];
      for (const button of allButtons) {
        const text = (await button.textContent())?.trim();
        if (text === '2 via') segundaViaButtons.push(button);
      }
      const box = await segundaViaButtons[i].boundingBox();
      if (box)
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

      await page.waitForSelector('h1.subTitulo', { timeout: 60000 });
      await page.waitForSelector('.ui-outputlabel.ui-widget.hardblue.mr-1', {
        timeout: 60000,
      });

      const allSpans = await page.$$('span.ui-button-text.ui-c');
      const downloadButtons: ElementHandle<Element>[] = [];
      for (const span of allSpans) {
        const text = (await span.textContent())?.trim();
        if (text === 'Fazer download da 2ª via') downloadButtons.push(span);
      }

      if (downloadButtons[0]) {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          downloadButtons[0].click(),
        ]);

        const fileName = download.suggestedFilename();
        const fileExtension = path.extname(fileName);
        const buffer = await download.createReadStream().then(
          (stream) =>
            new Promise<Buffer>((resolve, reject) => {
              const chunks: Buffer[] = [];
              stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
              stream.on('end', () => resolve(Buffer.concat(chunks)));
              stream.on('error', reject);
            }),
        );
        const fileData = buffer.toString('base64');
        unitBills.push({
          fileName,
          fileSize: buffer.length,
          fileData,
          fileExtension,
          month: months[i],
        });
      }
      await page.goto(
        'https://www.copel.com/avaweb/paginas/segundaViaFatura.jsf',
      );
      await page.waitForLoadState('networkidle');
    }
    return {
      invoices: unitBills,
      uc: unidade ? parseInt(unidade.trim()) : 0,
      instalation: unidade ? parseInt(unidade.trim()) : 0,
    } as UcInvoice;
  }
}
