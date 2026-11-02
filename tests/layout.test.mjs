import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
test('preview has a single live catalog, visible original sections and no duplicate static package list', async () => {
 const html = await readFile(new URL('code.html',root),'utf8');
 assert.doesNotMatch(html,/<details\b|<summary\b|Bản mẫu giao diện gốc/);
 for (const id of ['catalog','catalog-list','catalog-results','catalog-detail','searchInput','catalog-filters']) {
  assert.equal((html.match(new RegExp(`id="${id}"`,'g'))||[]).length,1,id);
 }
 assert.doesNotMatch(html,/class="solution-card/);
 for(const content of ['Trợ lý cấu hình nhanh','data-goal="web-app"','data-budget="starter"','Cloud Credits','chưa được xác minh'])assert.ok(html.includes(content),content);
 assert.match(html,/<button[^>]*class="currency-toggle[^>]*disabled/);
 assert.match(html,/Kiểm tra điều kiện nhận Credits · Sắp có/);
});
test('production purchase, API and connection contracts remain byte-identical',async()=>{
 const baseline=JSON.parse(await readFile(new URL('Docs/unified-preview-baseline.json',root),'utf8'));
 for(const [path,sha] of Object.entries(baseline.protected)) {
  const content=await readFile(new URL(path,root));assert.equal(createHash('sha256').update(content).digest('hex'),sha,path);
 }
});
