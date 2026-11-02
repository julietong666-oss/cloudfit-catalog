import { createPurchaseForm } from './purchase.mjs';
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
      const card = element('article', undefined, 'cf-card solution-card');
      card.dataset.productId = product.id;
      const top = element('div', undefined, 'cf-solution-top');
      const titles = element('div');
      titles.append(element('span', 'Giải pháp mẫu', 'cf-solution-badge'), element('h3', product.name), element('p', product.shortDescription, 'cf-card-description'));
      const icon = element('span', { 'startup-foundation': 'rocket_launch', 'modern-ai-saas': 'neurology', 'smart-workspace': 'workspaces' }[product.id] || 'cloud', 'material-symbols-outlined cf-solution-icon');
      icon.setAttribute('aria-hidden', 'true');
      top.append(titles, icon);
      card.append(top);
      const price = element('div', undefined, 'cf-solution-price');
      price.append(element('span', 'Chi phí tham khảo trong bản mẫu', 'cf-eyebrow'), element('strong', product.displayPrice || 'Chưa có dữ liệu'), element('span', 'Chưa xác minh · cần xác nhận trước khi mua', 'cf-price-note'));
      card.append(price);
      const tags = element('div', undefined, 'cf-card-tags');
      product.needTags.forEach(tag => tags.append(element('span', tag, 'cf-tag')));
      const information = element('div', undefined, 'cf-solution-information');
      information.append(element('h4', 'Thông tin giải pháp'), element('p', product.detailDescription || 'Chưa có dữ liệu mô tả chi tiết.'), tags);
      card.append(information);
      if (product.sampleNotice) card.append(element('p', product.sampleNotice, 'cf-sample'));
      const footer = element('div', undefined, 'cf-solution-actions');
      const link = element('a', 'Chi tiết gói →', 'cf-link');
      link.href = `#product/${encodeURIComponent(product.id)}`;
      link.setAttribute('aria-label', `Xem chi tiết ${product.name}`);
      const compare = element('button', 'So sánh · Sắp có');
      compare.type = 'button'; compare.disabled = true;
      compare.setAttribute('aria-disabled', 'true');
      footer.append(link, compare);
      card.append(footer);
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
    heading.className = 'cf-detail-heading';
    const layout = element('div', undefined, 'cf-detail-layout');
    const overview = element('section', undefined, 'cf-detail-overview');
    const tags = element('div', undefined, 'cf-card-tags');
    product.needTags.forEach(tag => tags.append(element('span', tag, 'cf-tag')));
    overview.append(tags, element('h3', 'Thông tin giải pháp'), element('p', product.detailDescription || 'Chưa có dữ liệu mô tả chi tiết.'));
    if (product.sampleNotice) overview.append(element('p', product.sampleNotice, 'cf-notice'));
    const registration = element('aside', undefined, 'cf-registration-panel');
    const introduction = element('div', undefined, 'cf-registration-intro');
    introduction.append(element('span', 'BƯỚC TIẾP THEO', 'cf-eyebrow'), element('h3', 'Trao đổi về gói dịch vụ'), element('p', 'Để lại thông tin để được liên hệ xác nhận cấu hình và giá phù hợp.'));
    if (product.displayPrice) introduction.append(element('p', `Giá trong bản mẫu: ${product.displayPrice} (chưa xác minh)`, 'cf-detail-price'));
    const purchase = createPurchaseForm(product);
    purchase.hidden = true;
    const choose = action('Đăng ký gói này', () => {
      purchase.hidden = false;
      introduction.hidden = true;
      choose.hidden = true;
      purchase.querySelector('input').focus();
    });
    choose.className = 'cf-primary';
    registration.append(introduction, choose, purchase);
    layout.append(overview, registration);
    detail.append(layout);
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
