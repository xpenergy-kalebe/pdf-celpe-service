import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { LoginRequest, LoginResponse } from '../dto/login.dto';

@Injectable()
export class LoginBot {
    async executeLogin(loginData: LoginRequest): Promise<LoginResponse> {
        const { usuario, senha } = loginData;

        const browser = await puppeteer.launch({ 
            headless: false, // Usar false para ver as ações na tela durante os testes
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: null,
        });

        const page = await browser.newPage();

        try {
            await page.goto('https://agenciavirtual.neoenergia.com/#/login', {
                waitUntil: 'networkidle2',
            });

            // 🎯 Simulação de comportamento humano:
            
            // 1. Movimentos aleatórios do mouse:
            await page.mouse.move(100, 100, { steps: 10 });
            await page.mouse.move(200, 200, { steps: 15 });
            await page.mouse.click(250, 250);

            // 2. Rolagem na página:
            await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));

            // 3. Atrasos aleatórios:
            
            await page.click('input:has-text("LOGIN")');

            // Preenchendo os campos do formulário com digitação simulada:
            await page.type('input[data-placeholder="CPF/CNPJ"]', usuario, { delay: 100 });
            await page.type('input[data-placeholder="Senha"]', senha, { delay: 100 });

            await page.setRequestInterception(true);

            // Submetendo o formulário:
            const [response] = await Promise.all([
                page.waitForResponse((res) =>
                    res.url().includes('https://avapineanl.neoenergia.com/areanaologada/2.0.0/autentica') && res.status() === 200
                ),
                page.click('button[title="Entrar"]'),
            ]);
            
            // Tipando a resposta para o tipo esperado:
            const responseData: LoginResponse = await response.json();
            console.log('Dados da resposta:', responseData);
            
            return responseData;

        } catch (error) {
            console.error('Erro no bot de login:', error.message);
            throw new Error('Falha ao realizar o login.');
        } finally {
            await browser.close();
        }
    }
}
