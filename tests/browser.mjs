// Run with PLAYWRIGHT_MODULE pointing to an existing Playwright installation.
import assert from 'node:assert/strict';
import { products } from './fixtures.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
let data = products;
let fail = false;
await page.route('**/catalog/products.json', route => route.fulfill({ status: fail ? 500 : 200, contentType: 'application/json', body: JSON.stringify(data) }));
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const expectText = async (selector, value) => { await page.waitForFunction(([s, v]) => document.querySelector(s)?.textContent.includes(v), [selector, value]); };
const count = async n => { await expectText('#catalog-count', `${n} sản phẩm phù hợp`); assert.equal(await page.locator('.cf-card').count(), n); };
const filter = need => page.locator('#catalog-filters button').filter({ hasText: need }).click();
try {
  await page.goto('http://127.0.0.1:4173');
  await count(3);
  const input = page.locator('#searchInput');
  await input.fill('  FIXTURE A  '); await count(1);
  await input.fill('dữ liệu'); await count(1);
  await input.fill('chi tiết'); await count(1);
  await input.fill('notfound'); await count(0);
  await expectText('#catalog-results', 'Không tìm thấy sản phẩm phù hợp.');
  await page.getByRole('button', { name: 'Xóa điều kiện', exact: true }).click(); await count(3);
  for (const [need, n] of [['Lưu trữ', 1], ['Tích hợp', 2], ['Cộng tác', 1]]) { await filter(need); await count(n); }
  await input.fill('Fixture A'); await count(0);
  await filter('Lưu trữ'); await count(1); assert.equal(await input.inputValue(), 'Fixture A');
  await page.getByRole('button', { name: 'Xóa từ khóa', exact: true }).click(); await count(1);
  assert.equal(await page.getByRole('button', { name: 'Lưu trữ', exact: true }).getAttribute('aria-pressed'), 'true');
  await input.fill('dữ liệu');
  await page.getByRole('link', { name: 'Xem chi tiết Fixture A', exact: true }).click();
  await expectText('#catalog-detail', 'Fixture A');
  await page.goBack(); await count(1); assert.equal(await input.inputValue(), 'dữ liệu');
  await page.reload(); await count(1); assert.equal(await input.inputValue(), 'dữ liệu');
  await filter('Tất cả'); await count(1); assert.equal(await input.inputValue(), 'dữ liệu');
  await page.getByRole('button', { name: 'Đặt lại tất cả', exact: true }).click(); await count(3);
  await filter('Cộng tác'); await page.keyboard.press('Space'); await count(1);
  await page.getByRole('button', { name: 'Đặt lại tất cả', exact: true }).focus(); await page.keyboard.press('Enter'); await count(3);
  console.log('PASS: search, all filters, AND, multi-tag, clear, reset, keyboard, details/back/session');
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
    await input.fill('Fixture C'); await count(1);
    await page.getByRole('link', { name: 'Xem chi tiết Fixture C', exact: true }).click();
    await expectText('#catalog-detail', 'Fixture C');
    await page.getByRole('link', { name: 'Quay lại danh mục', exact: false }).click();
    await input.fill(''); await count(3);
    await page.screenshot({ path: `/tmp/cloudfit-${width}.png`, fullPage: true });
  }
  console.log('PASS: mobile 375px and desktop 1440px, no horizontal overflow and usable details');
  data = []; await page.reload(); await expectText('#catalog-results', 'Danh mục chưa có dữ liệu.');
  await input.fill('missing'); await expectText('#catalog-results', 'Danh mục chưa có dữ liệu.');
  data = [{ ...products[0], needTags: [] }]; await page.reload(); await expectText('#catalog-results', 'Nhãn nhu cầu còn thiếu');
  fail = true; await page.reload(); await expectText('#catalog-results', 'Không tải được dữ liệu sản phẩm.');
  fail = false; data = products;
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click(); await count(0);
  await page.getByRole('button', { name: 'Xóa điều kiện', exact: true }).click(); await count(3);
  await page.evaluate(() => { location.hash = 'product/missing'; });
  await expectText('#catalog-detail', 'Không tìm thấy sản phẩm.');
  assert.deepEqual(errors, []);
  console.log('PASS: empty versus no matches, invalid tags, HTTP error, retry, missing detail, no JS errors');
} finally { await browser.close(); }
