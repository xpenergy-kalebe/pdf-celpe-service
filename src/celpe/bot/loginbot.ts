import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { LoginRequest, LoginResponse } from '../dto/login.dto';

@Injectable()
export class LoginBot {
    async executeLogin(loginData: LoginRequest): Promise<LoginResponse> {
        const { usuario, senha } = loginData;

        const browser = await puppeteer.launch({
            headless: false, 
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: null,
        });

        const page = await browser.newPage();
        
        const loginResponsePromise = new Promise<LoginResponse>((resolve, reject) => {
            page.on('response', async (response) => {
                const url = response.url();
                const method = response.request().method();
            
                if (url.includes('autentica') && response.status() !== 204 && response.status() !== 304 && method !== 'OPTIONS') {
                    try {
                        const responseBody: LoginResponse = await response.json();
                        console.log('Resposta da requisição autentica:', responseBody);
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
            await this.typeWithDelay(page, 'input[data-placeholder="CPF/CNPJ"]', usuario);
            await this.randomDelay();

            await page.waitForSelector('input[data-placeholder="Senha"]');
            await this.typeWithDelay(page, 'input[data-placeholder="Senha"]', senha);
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

    private async simulateMouseMovement(page: puppeteer.Page): Promise<void> {
        const movements = [
            { x: 100, y: 100, steps: 10 },
            { x: 200, y: 200, steps: 15 },
            { x: 300, y: 300, steps: 20 },
            { x: 500, y: 500, steps: 25 }
        ];

        for (const move of movements) {
            await page.mouse.move(move.x, move.y, { steps: move.steps });
            await this.randomDelay();
        }
    }

    private async typeWithDelay(page: puppeteer.Page, selector: string, text: string): Promise<void> {
        await page.focus(selector); 
        for (let i = 0; i < text.length; i++) {
            await page.type(selector, text[i], { delay: this.getRandomDelay(70, 150) }); 
            await this.randomDelay();
        }
    }

    private async randomDelay(): Promise<void> {
        const delay = this.getRandomDelay(500, 1500); 
        await new Promise(resolve => setTimeout(resolve, delay));  
    }

    private getRandomDelay(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
