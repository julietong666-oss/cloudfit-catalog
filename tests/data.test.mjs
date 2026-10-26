import test from 'node:test';
import assert from 'node:assert/strict';
import { loadProducts, loadDemoCustomers } from '../catalog/data.mjs';

const row = { id: 'demo', name: 'Demo', short_description: 'Mẫu', detail_description: null, need_tags: ['Lưu trữ'], sample_notice: 'Chưa xác minh', display_price: '~$6' };
test('loads Supabase REST data and maps database fields for existing search/detail UI', async () => {
  const result = await loadProducts({ fetcher: async (url, options) => {
    assert.equal(url.origin, 'https://qibpsehkmzjwusllorbf.supabase.co');
    assert.equal(url.pathname, '/rest/v1/products');
    assert.equal(url.searchParams.get('is_demo'), 'eq.true');
    assert.match(options.headers.apikey, /^sb_publishable_/);
    assert.equal(options.headers.Authorization, undefined);
    return Response.json([row]);
  }});
  assert.equal(result[0].shortDescription, 'Mẫu');
  assert.equal(result[0].detailDescription, '');
  assert.deepEqual(result[0].needTags, ['Lưu trữ']);
  assert.equal(result[0].sampleNotice, 'Chưa xác minh');
});
test('customer demo data loads from its isolated table and rejects invalid records or API errors', async () => {
  const customer = {id:'demo-001', company_name:'Công ty Demo 01',contact_name:'Khách mẫu 01', email:'demo01@example.com',product_id:'demo',stage:'Đang tìm hiểu'};
  assert.deepEqual(await loadDemoCustomers({fetcher:async (url) => {
    assert.equal(url.pathname, '/rest/v1/demo_customers');
    return Response.json([customer]);
  }}), [customer]);
  await assert.rejects(loadDemoCustomers({fetcher:async () => Response.json([{}])}));
  await assert.rejects(loadDemoCustomers({fetcher:async () => new Response('',{status:403})}));
});
test('does not substitute local samples for permission, network or invalid-data failures', async () => {
  for (const status of [401, 403, 500]) {
    await assert.rejects(loadProducts({ fetcher: async () => new Response('', { status }) }));
  }
  await assert.rejects(loadProducts({ fetcher: async () => { throw new Error('offline'); } }), /Kiểm tra mạng/);
  await assert.rejects(loadProducts({ fetcher: async () => Response.json({ message: 'bad' }) }));
  await assert.rejects(loadProducts({ fetcher: async () => Response.json([{ ...row, need_tags: [] }]) }));
  assert.deepEqual(await loadProducts({ fetcher: async () => Response.json([]) }), []);
});
