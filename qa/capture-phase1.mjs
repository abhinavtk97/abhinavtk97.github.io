// Phase 1 QA: walk shots along the scroll path + a rack close-up.
// Headless swiftshader is ~0.3fps with bloom, so we wait on window.__QA
// (defined at module init) + a fixed settle, NOT the fps counter.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.GW_URL || 'http://127.0.0.1:8873/gateway/';
const OUT = new URL('./shots/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));

await page.goto(BASE + '?shots=1', { waitUntil: 'networkidle' });
await page.waitForFunction(() => typeof window.__QA === 'object' && typeof window.__QA.shoot === 'function', null, { timeout: 20000 });
console.log('QA hook ready; settling for shader compile + first frames…');
await page.waitForTimeout(25000); // swiftshader: first composer frames are very slow
const hud = await page.textContent('#q');
const shots = await page.evaluate(() => window.__QA.shoot());
for (const s of shots) {
  fs.writeFileSync(`${OUT}phase1-${s.name}.png`, Buffer.from(s.url.split(',')[1], 'base64'));
  console.log('saved', s.name, `${Math.round(s.url.length / 1371)}px-ish`);
}
await page.screenshot({ path: OUT + 'phase1-live-view.png' });
console.log('HUD:', hud);
console.log('Console errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
