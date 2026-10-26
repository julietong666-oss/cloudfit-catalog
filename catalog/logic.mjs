export const NEEDS = ['Lưu trữ', 'Tích hợp', 'Cộng tác'];
export const ALL = 'Tất cả';

/** Reject incomplete/unreviewed tag mappings instead of silently guessing. */
export function validateCatalog(data) {
  if (!Array.isArray(data)) throw new Error('Danh mục phải là một danh sách.');
  const ids = new Set();
  for (const product of data) {
    if (!product || typeof product.id !== 'string' || !product.id.trim() || ids.has(product.id)) {
      throw new Error('Mã sản phẩm thiếu hoặc trùng lặp.');
    }
    ids.add(product.id);
    for (const field of ['name', 'shortDescription']) {
      if (typeof product[field] !== 'string' || !product[field].trim()) throw new Error('Thiếu tên hoặc mô tả sản phẩm.');
    }
    if (product.detailDescription !== undefined && typeof product.detailDescription !== 'string') throw new Error('Mô tả chi tiết không hợp lệ.');
    if (!Array.isArray(product.needTags) || !product.needTags.length || product.needTags.some(tag => !NEEDS.includes(tag))) {
      throw new Error('Nhãn nhu cầu còn thiếu hoặc chưa khớp bộ lọc. Cần chủ dự án duyệt nhãn.');
    }
  }
  return data;
}

export function searchProducts(products, query = '', need = ALL) {
  const keyword = query.trim().toLocaleLowerCase('vi');
  return products.filter(product =>
    (need === ALL || product.needTags.includes(need)) &&
    (!keyword || [product.name, product.shortDescription, product.detailDescription ?? '']
      .some(value => value.toLocaleLowerCase('vi').includes(keyword)))
  );
}

export function readState(storage) {
  try {
    const value = JSON.parse(storage.getItem('cloudfit.catalog') || '{}');
    return { query: typeof value.query === 'string' ? value.query : '', need: [ALL, ...NEEDS].includes(value.need) ? value.need : ALL };
  } catch { return { query: '', need: ALL }; }
}

export function saveState(storage, state) {
  try { storage.setItem('cloudfit.catalog', JSON.stringify(state)); } catch { /* In-memory state remains usable when storage is disabled. */ }
}
