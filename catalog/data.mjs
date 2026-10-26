import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.mjs';
import { validateCatalog } from './logic.mjs';

export async function loadProducts({ fetcher = fetch, accessToken, signal } = {}) {
  const url = new URL('/rest/v1/products', SUPABASE_URL);
  url.searchParams.set('select', 'id,name,short_description,detail_description,need_tags,sample_notice,display_price');
  url.searchParams.set('order', 'created_at.asc,id.asc');
  url.searchParams.set('is_demo', 'eq.true');
  const headers = { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let response;
  try {
    response = await fetcher(url, { headers, signal: signal ?? AbortSignal.timeout(15000) });
  } catch {
    throw new Error('Không kết nối được Supabase. Kiểm tra mạng và thử lại.');
  }
  if (!response.ok) {
    if ([401, 403].includes(response.status)) throw new Error('Chưa có quyền đọc danh mục Supabase. Vui lòng đăng nhập bằng tài khoản được cấp quyền.');
    throw new Error('Supabase chưa trả được danh mục. Vui lòng thử lại.');
  }
  let rows;
  try { rows = await response.json(); } catch { throw new Error('Supabase trả về dữ liệu không hợp lệ.'); }
  if (!Array.isArray(rows)) throw new Error('Supabase trả về dữ liệu không hợp lệ.');
  return validateCatalog(rows.map(row => ({
    id: row.id,
    name: row.name,
    shortDescription: row.short_description,
    detailDescription: row.detail_description ?? '',
    needTags: row.need_tags,
    sampleNotice: row.sample_notice,
    displayPrice: row.display_price,
  })));
}

export async function loadDemoCustomers({ fetcher = fetch } = {}) {
  const url = new URL('/rest/v1/demo_customers', SUPABASE_URL);
  url.searchParams.set('select', 'id,company_name,contact_name,email,product_id,stage');
  url.searchParams.set('order', 'id.asc');
  let response;
  try {
    response = await fetcher(url, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  } catch { throw new Error('Không kết nối được Supabase. Kiểm tra mạng và thử lại.'); }
  if (!response.ok) throw new Error('Không tải được khách hàng demo từ Supabase. Vui lòng thử lại.');
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.some(row => !row || ['id', 'company_name', 'contact_name', 'email', 'product_id', 'stage'].some(key => typeof row[key] !== 'string'))) {
    throw new Error('Dữ liệu khách hàng demo không hợp lệ.');
  }
  return rows;
}
