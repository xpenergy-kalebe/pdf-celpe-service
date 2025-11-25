// src/utils/human.ts
import { Page } from 'puppeteer';

function rand(min = 300, max = 700) {
  return Math.trunc(Math.random() * (max - min + 1) + min);
}
async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function simulateMouseMovement(page: Page) {
  const moves = [
    { x: 100, y: 100, steps: 5 },
    { x: 200, y: 200, steps: 7 },
    { x: 300, y: 300, steps: 10 },
    { x: 500, y: 500, steps: 12 },
  ];

  for (const m of moves) {
    console.log(`[Human] Mouse → (${m.x}, ${m.y}) em ${m.steps} passos`);
    await page.mouse.move(m.x, m.y, { steps: m.steps });
    await sleep(rand(200, 400));
  }
}

export async function typeWithDelay(
  page: Page,
  selector: string,
  text: string,
) {
  console.log(`[Human] Focando ${selector}`);
  await page.focus(selector);

  for (const ch of text) {
    await page.type(selector, ch, { delay: rand(50, 100) });
  }
}
export async function randomDelay(
  min: number = 300,
  max: number = 700,
): Promise<void> {
  const delay = getRandomDelay(min, max);
  console.log(`[LoginBot] Aguardando por ${delay}ms`);
  await new Promise((resolve) => setTimeout(resolve, delay));
}
