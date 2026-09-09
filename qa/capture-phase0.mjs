// Phase 0 QA: load /gateway/?shots=1, drive window.__QA.shoot(), save PNGs.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.GW_URL || 'http://127.0.0.1:8873/gateway/';
const OUT = new URL('./shots/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));

await page.goto(BASE + '?shots=1', { waitUntil: 'networkidle' });
await page.waitForSelector('#q:not(:has-text("measuring"))', { timeout: 15000 }); // fps counted => loop alive
const hud = await page.textContent('#q');
const shots = await page.evaluate(() => window.__QA.shoot());
for (const s of shots) {
  fs.writeFileSync(`${OUT}phase0-${s.name}.png`, Buffer.from(s.url.split(',')[1], 'base64'));
  console.log('saved', s.name);
}
await page.screenshot({ path: OUT + 'phase0-live-view.png' });
console.log('HUD:', hud);
console.log('Console errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
