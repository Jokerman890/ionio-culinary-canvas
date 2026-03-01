import { chromium, firefox, webkit, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:8080';
const REPORT_DIR = path.resolve('qa/reports');
fs.mkdirSync(REPORT_DIR, { recursive: true });

const targets = [
  { name: 'desktop-chromium', browser: 'chromium', context: { viewport: { width: 1440, height: 900 } } },
  { name: 'desktop-firefox', browser: 'firefox', context: { viewport: { width: 1440, height: 900 } } },
  { name: 'desktop-webkit', browser: 'webkit', context: { viewport: { width: 1440, height: 900 } } },
  { name: 'mobile-iphone12', browser: 'webkit', context: { ...devices['iPhone 12'] } },
  { name: 'mobile-pixel7', browser: 'chromium', context: { ...devices['Pixel 7'] } },
  { name: 'tablet-ipad', browser: 'webkit', context: { ...devices['iPad (gen 7)'] } },
];

const browserMap = { chromium, firefox, webkit };

async function runCase(target) {
  const out = { target: target.name, browser: target.browser, passed: true, steps: [], errors: [] };
  let browser;
  try {
    browser = await browserMap[target.browser].launch({ headless: true });
    const context = await browser.newContext(target.context);
    const page = await context.newPage();

    // 1) Home
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: path.join(REPORT_DIR, `${target.name}-home.png`), fullPage: true });
    out.steps.push('home-loaded');

    // 2) Menu anchor/section check
    const bodyText = await page.textContent('body');
    if (!bodyText || bodyText.length < 50) throw new Error('Home body content too small');
    out.steps.push('home-content-ok');

    // 3) Login page
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[type="email"]', { timeout: 8000 });
    await page.waitForSelector('input[type="password"]', { timeout: 8000 });
    await page.screenshot({ path: path.join(REPORT_DIR, `${target.name}-login.png`), fullPage: true });
    out.steps.push('login-rendered');

    // 4) Login attempt (test credentials)
    await page.fill('input[type="email"]', 'admin@test.local');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(REPORT_DIR, `${target.name}-after-login.png`), fullPage: true });
    out.steps.push('login-attempted');

    // 5) Protected page smoke
    await page.goto(`${BASE_URL}/admin/menu`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(REPORT_DIR, `${target.name}-admin-menu.png`), fullPage: true });
    out.steps.push('admin-menu-checked');

    await context.close();
  } catch (e) {
    out.passed = false;
    out.errors.push(String(e?.message || e));
  } finally {
    if (browser) await browser.close();
  }
  return out;
}

async function main() {
  const summary = {
    baseUrl: BASE_URL,
    startedAt: new Date().toISOString(),
    results: [],
  };

  for (const t of targets) {
    const r = await runCase(t);
    summary.results.push(r);
    console.log(`${r.passed ? '✅' : '❌'} ${r.target}`);
    if (!r.passed) console.log('   ', r.errors.join(' | '));
  }

  summary.finishedAt = new Date().toISOString();
  summary.passed = summary.results.filter(r => r.passed).length;
  summary.failed = summary.results.filter(r => !r.passed).length;

  const outPath = path.join(REPORT_DIR, 'qa-summary.json');
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
  console.log(`\nSummary: ${summary.passed} passed, ${summary.failed} failed`);
  console.log(`Report: ${outPath}`);

  process.exit(summary.failed > 0 ? 1 : 0);
}

main();
