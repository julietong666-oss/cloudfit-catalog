import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from './fixtures.mjs';
import { ALL, NEEDS, searchProducts, validateCatalog, readState, saveState } from '../catalog/logic.mjs';
const ids = (q, need) => searchProducts(products, q, need).map(p => p.id);
test('name search, case insensitive, trims edges', () => {
  assert.deepEqual(ids('  FIXTURE a  '), ['a']);
});
test('short and detailed descriptions, only approved fields', () => {
  assert.deepEqual(ids('dữ liệu'), ['a']);
  assert.deepEqual(ids('chi tiết'), ['a']);
  assert.deepEqual(ids('Tích hợp'), []);
});
test('unknown keyword and default catalog', () => {
  assert.deepEqual(ids('notfound'), []);
  assert.deepEqual(ids('   '), ['a', 'b', 'c']);
});
for (const [need, expected] of [[NEEDS[0], ['a']], [NEEDS[1], ['a', 'b']], [NEEDS[2], ['c']]]) {
  test(`single need and multi-tag membership: ${need}`, () => assert.deepEqual(ids('', need), expected));
}
test('search AND filter; switching need and clearing query', () => {
  assert.deepEqual(ids('Fixture A', 'Cộng tác'), []);
  assert.deepEqual(ids('Fixture A', 'Lưu trữ'), ['a']);
  assert.deepEqual(ids('', 'Tích hợp'), ['a', 'b']);
  assert.deepEqual(ids('Fixture A', ALL), ['a']);
});
test('valid empty catalog, invalid schema, duplicate IDs, missing/unknown tags', () => {
  assert.deepEqual(validateCatalog([]), []);
  assert.equal(validateCatalog(products), products);
  for (const value of [null, {}, [null], [products[0], products[0]], [{...products[0], needTags: []}], [{...products[0], needTags: ['AI']}], [{...products[0], shortDescription: ''}]]) assert.throws(() => validateCatalog(value));
});
test('session restores query and need, safely handles unavailable/corrupt storage', () => {
  const storage = { value: null, getItem() { return this.value; }, setItem(k, v) { this.value = v; } };
  const state = { query: 'dữ liệu', need: 'Lưu trữ' };
  saveState(storage, state);
  assert.deepEqual(readState(storage), state);
  storage.value = 'bad json';
  assert.deepEqual(readState(storage), { query: '', need: ALL });
  assert.doesNotThrow(() => saveState(undefined, state));
  assert.deepEqual(readState(undefined), { query: '', need: ALL });
});

test('requested sample packages: shared source, searchable services, explicit sample notices', async () => {
  const { readFile } = await import('node:fs/promises');
  const catalog = validateCatalog(JSON.parse(await readFile(new URL('../catalog/products.json', import.meta.url), 'utf8')));
  assert.equal(catalog.length, 3);
  for (const product of catalog) {
    assert.ok(product.sampleNotice.includes('chưa được xác minh'));
    assert.deepEqual(searchProducts(catalog, product.name).map(p => p.id), [product.id]);
  }
  assert.equal(searchProducts(catalog, 'Cloud SQL')[0].id, 'startup-foundation');
  assert.equal(searchProducts(catalog, 'Vertex AI')[0].id, 'modern-ai-saas');
  assert.equal(searchProducts(catalog, 'Gmail', 'Cộng tác')[0].id, 'smart-workspace');
});
