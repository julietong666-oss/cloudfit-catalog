import { ALL, NEEDS, searchProducts, readState, saveState } from './logic.mjs';
import { loadProducts } from './data.mjs';

const root = document.querySelector('#catalog');
const input = root.querySelector('#searchInput');
const headerInput = document.querySelector('#headerSearch');
let storage;
try { storage = window.sessionStorage; } catch { /* Browser privacy settings may deny storage access. */ }
const state = readState(storage);
let products = [];
let status = 'loading';
let errorMessage = '';
const list = root.querySelector('#catalog-list');
const detail = root.querySelector('#catalog-detail');
const results = root.querySelector('#catalog-results');
const summary = root.querySelector('#catalog-count');
const filters = root.querySelector('#catalog-filters');

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function action(label, handler) {
  const button = element('button', label);
  button.type = 'button';
  button.addEventListener('click', handler);
  return button;
}
function reset() {
  state.query = ''; state.need = ALL;
  update(); input.focus();
}
function message(title, hint, button) {
  const box = element('div', undefined, 'cf-message');
  box.append(element('p', title));
  if (hint) box.append(element('p', hint));
  if (button) box.append(button);
  results.append(box);
}
for (const need of [ALL, ...NEEDS]) {
  const button = action(need, () => { state.need = need; update(); });
  button.dataset.need = need;
  filters.append(button);
}
function render() {
  const matches = searchProducts(products, state.query, state.need);
  input.value = state.query;
  if (headerInput) headerInput.value = state.query;
  root.querySelector('#clear-query').hidden = !state.query;
  for (const button of filters.children) button.setAttribute('aria-pressed', String(button.dataset.need === state.need));
  results.replaceChildren();
  summary.textContent = status === 'ready' ? `${matches.length} sản phẩm phù hợp` : status === 'loading' ? 'Đang tải danh mục…' : 'Không tải được danh mục.';
  results.setAttribute('aria-busy', String(status === 'loading'));
  if (status === 'loading') message('Đang tải danh mục…');
  else if (status === 'error') message('Không tải được dữ liệu sản phẩm.', errorMessage, action('Thử lại', loadCatalog));
  else if (!products.length) message('Danh mục chưa có dữ liệu.', 'Chưa có bộ sản phẩm và nhãn nhu cầu được duyệt. Vui lòng quay lại sau.');
  else if (!matches.length) message('Không tìm thấy sản phẩm phù hợp.', 'Hãy thử từ khóa khác hoặc xóa điều kiện tìm kiếm và lọc.', action('Xóa điều kiện', reset));
  else {
    const grid = element('div', undefined, 'cf-grid');
    for (const product of matches) {
      const card = element('article', undefined, 'cf-card');
      const tags = element('div');
      product.needTags.forEach(tag => tags.append(element('span', tag, 'cf-tag')));
      const link = element('a', 'Xem chi tiết', 'cf-link');
      link.href = `#product/${encodeURIComponent(product.id)}`;
      link.setAttribute('aria-label', `Xem chi tiết ${product.name}`);
      card.append(element('h3', product.name), element('p', product.shortDescription));
      if (product.sampleNotice) card.append(element('p', 'Gói mẫu • Nhãn nhu cầu minh họa', 'cf-sample'));
      if (product.displayPrice) card.append(element('p', `Giá trong bản mẫu: ${product.displayPrice} (chưa xác minh)`));
      card.append(tags, link);
      grid.append(card);
    }
    results.append(grid);
  }
  renderRoute();
}
function update() { saveState(storage, state); render(); }
function renderRoute(focus = false) {
  const isDetail = location.hash.startsWith('#product/');
  list.hidden = isDetail; detail.hidden = !isDetail;
  if (!isDetail) {
    if (focus) input.focus();
    return;
  }
  let id;
  try { id = decodeURIComponent(location.hash.slice(9)); } catch { id = ''; }
  const product = products.find(item => item.id === id);
  detail.replaceChildren();
  const back = element('a', '← Quay lại danh mục', 'cf-link');
  back.href = '#catalog'; detail.append(back);
  const heading = element('h2', status === 'loading' ? 'Đang tải sản phẩm…' : status === 'error' ? 'Không tải được dữ liệu sản phẩm.' : product?.name ?? 'Không tìm thấy sản phẩm.');
  heading.tabIndex = -1; detail.append(heading);
  if (product) {
    detail.append(element('p', product.detailDescription || 'Chưa có dữ liệu mô tả chi tiết.'));
    if (product.sampleNotice) detail.append(element('p', product.sampleNotice, 'cf-notice'));
    if (product.displayPrice) detail.append(element('p', `Giá trong bản mẫu: ${product.displayPrice} (chưa xác minh)`));
    const selection = element('p');
    selection.setAttribute('role', 'status');
    detail.append(action('Chọn gói này', () => {
      selection.textContent = `Đã chọn ${product.name} để xem xét. Chưa tạo đơn hàng hoặc thanh toán. Cần xác nhận cấu hình và giá trước khi mua.`;
    }), selection);
  }
  if (status === 'error') detail.append(action('Thử lại', loadCatalog));
  if (focus) heading.focus();
}
async function loadCatalog() {
  status = 'loading'; render();
  try {
    products = await loadProducts(); status = 'ready';
  } catch (error) {
    products = []; status = 'error';
    errorMessage = error instanceof Error ? error.message : 'Dữ liệu không hợp lệ.';
  }
  render();
}
input.addEventListener('input', () => { state.query = input.value; update(); });
headerInput?.addEventListener('input', () => {
  state.query = headerInput.value; update();
  if (list.hidden || location.hash === '#identity') location.hash = 'catalog';
});
root.querySelector('#clear-query').addEventListener('click', () => { state.query = ''; update(); input.focus(); });
root.querySelector('#reset-all').addEventListener('click', reset);
window.addEventListener('hashchange', () => renderRoute(location.hash === '#catalog' || location.hash.startsWith('#product/')));
loadCatalog();
