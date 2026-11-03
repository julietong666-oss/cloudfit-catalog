import { demoCustomers, questions, createConversation, answerConversation } from './chat.mjs';
import { activeOrder, createDemoOffer, startDemoPayment, cancelDemoOrder, applyDemoReceipt } from './chat-order.mjs';

const opener = document.querySelector('#consult-open');
const dialog = document.querySelector('#consult-dialog');
const conversations = new Map();
let activeId = demoCustomers[0].id;
let renderedId;
let renderedMessages = 0;
const demoQrUrl = new URL('./demo-payment-qr.svg', import.meta.url).href;
let bankQrUrl = demoQrUrl;
let bankQrIsDemo = true;
const money = amount => new Intl.NumberFormat('vi-VN', {style:'currency', currency:'VND'}).format(amount);
const offerForm = dialog.querySelector('#offer-form');
const offerFeedback = dialog.querySelector('#offer-feedback');
const successPopup = document.querySelector('#payment-success');
const find = id => dialog.querySelector(`#${id}`);
const transcript = find('consult-messages');
const composer = find('consult-composer');
const input = find('consult-answer');
const feedback = find('consult-feedback');
const suggestions = find('consult-suggestions');
const customerList = find('consult-customers');
const context = find('consult-summary');
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function current() { return conversations.get(activeId); }
function renderDirectory() {
  customerList.replaceChildren();
  for (const customer of demoCustomers) {
    const row = element('tr');
    const name = element('td');
    const button = element('button', customer.company, 'cf-chat-customer');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(customer.id === activeId));
    button.addEventListener('click', () => {
      activeId = customer.id;
      if (!current()) conversations.set(activeId, createConversation(activeId));
      input.value = ''; feedback.textContent = ''; offerFeedback.textContent = '';
      offerForm.hidden = true; find('offer-toggle').setAttribute('aria-expanded', 'false');
      render(); if (!composer.hidden) input.focus(); else find('offer-toggle').focus();
    });
    name.append(button);
    row.append(name, element('td', customer.admin), element('td', `${conversations.get(customer.id)?.step ?? 0}/${questions.length} câu trả lời`));
    customerList.append(row);
  }
}
function renderSummary() {
  const conversation = current();
  const customer = demoCustomers.find(item => item.id === activeId);
  find('consult-company').textContent = customer.company;
  find('consult-owner').textContent = customer.admin;
  find('consult-admin').textContent = customer.admin;
  find('consult-avatar').textContent = customer.initials;
  find('consult-specialty').textContent = `${customer.specialty} · Admin mẫu`;
  find('consult-progress').textContent = `${conversation.step}/${questions.length} thông tin đã chia sẻ`;
  context.replaceChildren();
  for (const [label, value] of [
    ['Gói quan tâm', conversation.interest || 'Chưa chọn gói · cần tư vấn'],
    ...questions.map(q => [q.label, conversation.answers[q.key] || 'Chưa chia sẻ']),
  ]) context.append(element('dt', label), element('dd', value));
}
function render() {
  const conversation = current();
  if (renderedId !== activeId || conversation.messages.length < renderedMessages) {
    transcript.replaceChildren(); renderedMessages = 0;
  }
  renderedId = activeId;
  const admin = demoCustomers.find(item => item.id === activeId).admin;
  for (const message of conversation.messages.slice(renderedMessages)) {
    const item = element('div', undefined, `cf-chat-message cf-chat-message--${message.role}`);
    item.append(element('span', message.role === 'admin' ? `${admin} · kịch bản mẫu` : 'Khách hàng', 'cf-chat-sender'));
    if (message.type === 'offer') {
      const card = element('section', undefined, 'cf-order-card');
      card.dataset.orderId = message.orderId;
      item.append(card);
    } else item.append(element('p', message.text));
    transcript.append(item);
  }
  renderedMessages = conversation.messages.length;
  renderSummary(); renderDirectory(); renderOrders();
  suggestions.replaceChildren();
  const question = questions[conversation.step];
  composer.hidden = !question;
  find('consult-complete').hidden = Boolean(question);
  const order = activeOrder(conversation);
  find('consult-restart').disabled = Boolean(order && order.status !== 'cancelled');
  find('consult-admin-tools').hidden = Boolean(question);
  if (question) {
    find('consult-label').textContent = question.label;
    input.placeholder = 'Nhập câu trả lời của bạn…';
    for (const choice of question.choices) {
      const button = element('button', choice);
      button.type = 'button';
      button.addEventListener('click', () => send(choice));
      suggestions.append(button);
    }
  }
  requestAnimationFrame(() => {
    transcript.scrollTop = transcript.scrollHeight;
  });
}
function send(text) {
  try {
    conversations.set(activeId, answerConversation(current(), text));
    input.value = ''; feedback.textContent = ''; render();
    if (!composer.hidden) input.focus();
    else find('consult-restart').focus();
  } catch (error) {
    feedback.textContent = error.message;
    input.focus();
  }
}
composer.addEventListener('submit', event => { event.preventDefault(); send(input.value); });
find('consult-restart').addEventListener('click', () => {
  if (activeOrder(current()) && activeOrder(current()).status !== 'cancelled') return;
  conversations.set(activeId, createConversation(activeId, current().interest));
  offerForm.hidden = true; find('offer-toggle').setAttribute('aria-expanded', 'false');
  input.value = ''; feedback.textContent = ''; render(); input.focus();
});
opener.addEventListener('click', () => {
  // Capture an actually viewed package as context, never submit a purchase.
  const interest = location.hash.startsWith('#product/')
    ? document.querySelector('#catalog-detail .cf-detail-heading')?.textContent || '' : '';
  if (!current()) conversations.set(activeId, createConversation(activeId, interest));
  else if (interest && activeId === demoCustomers[0].id) current().interest = interest;
  render(); dialog.showModal();
  find('consult-close').focus();
});
find('consult-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => opener.focus());

function orderAction(label, handler, secondary = false) {
 const button = element('button', label, secondary ? 'cf-order-secondary' : 'cf-chat-send');
 button.type = 'button'; button.addEventListener('click', handler); return button;
}
function transition(action) {
 try {
  conversations.set(activeId, action(current())); offerFeedback.textContent = ''; render();
 } catch(error) { offerFeedback.textContent = error.message; }
}
function renderOrders() {
 const conversation = current();
 const latest = activeOrder(conversation);
 find('offer-toggle').disabled = Boolean(latest && latest.status !== 'cancelled');
 find('payment-simulator').hidden = !latest || !['awaiting_payment','cancelled','paid'].includes(latest.status);
 find('simulate-receipt').disabled = !latest || latest.status === 'paid';
 find('simulate-wrong-amount').disabled = !latest || latest.status === 'paid';
 transcript.classList.toggle('cf-chat-messages--order', Boolean(latest));
 for (const card of transcript.querySelectorAll('[data-order-id]')) {
  const order = conversation.orders.find(item => item.id === card.dataset.orderId);
  card.replaceChildren();
  card.setAttribute('aria-label', 'Phiếu xác nhận mua gói');
  const labels = { offered:'Chờ khách xác nhận', awaiting_payment:'Chờ hệ thống xác nhận nhận tiền', cancelled:'Đã huỷ · chưa đăng ký gói', paid:'Đã nhận tiền · đăng ký thành công (mẫu)' };
  card.append(element('span','PHIẾU XÁC NHẬN · DỮ LIỆU MẪU','cf-order-demo-label'), element('h3','Xác nhận mua gói dịch vụ'), element('div', labels[order.status], `cf-order-state cf-order-state--${order.status}`));
  const details = element('dl', undefined, 'cf-order-details');
  for (const [label,value] of [['Doanh nghiệp',order.company],['Gói dịch vụ',order.packageName],['Quy mô / thời hạn',`${order.users} người dùng / ${order.months} tháng`]]) details.append(element('dt',label),element('dd',value));
  const enterprise = element('details',undefined,'cf-order-enterprise');
  enterprise.append(element('summary','Xem thông tin doanh nghiệp'));
  const companyDetails = element('dl',undefined,'cf-order-details');
  for (const [label,value] of [['Mã số thuế',order.taxId],['Địa chỉ',order.address],['Người liên hệ',order.contact],['Điện thoại',order.phone],['Email',order.email]]) companyDetails.append(element('dt',label),element('dd',value));
  enterprise.append(companyDetails);
  card.append(details, enterprise, element('div', 'Tổng thanh toán (đã gồm thuế/phí)', 'cf-order-price-label'), element('strong', money(order.amount), 'cf-order-price'), element('div', `Mã phiếu / nội dung chuyển khoản: ${order.id}`, 'cf-order-reference'));
  if (order.status === 'offered') {
   card.append(element('div','Vui lòng kiểm tra thông tin doanh nghiệp, gói và tổng tiền trước khi thanh toán.','cf-order-hint'));
   const actions = element('div',undefined,'cf-offer-actions');
   actions.append(orderAction('Thanh toán',()=>transition(c=>startDemoPayment(c,order.id))), orderAction('Huỷ',()=>transition(c=>cancelDemoOrder(c,order.id)),true));
   card.append(actions);
  }
  if (order.status === 'awaiting_payment') {
   const payment = element('div',undefined,'cf-order-payment');
   payment.append(element('h4', bankQrIsDemo ? 'Thanh toán bằng QR giả lập' : 'Chuyển khoản qua QR doanh nghiệp'));
   if (bankQrUrl) {
    const qr = document.createElement('img'); qr.src = bankQrUrl; qr.alt = bankQrIsDemo ? 'QR giả lập CloudFit, không dùng để chuyển tiền thật' : 'Ảnh QR ngân hàng cố định của doanh nghiệp'; qr.className = 'cf-bank-qr'; payment.append(qr);
   } else payment.append(element('div','Chưa có ảnh QR. Chọn ảnh cố định của doanh nghiệp trong Góc admin · mô phỏng.','cf-bank-qr-placeholder'));
   if (bankQrIsDemo) payment.append(element('div','QR giả lập chỉ chứa văn bản demo, không chứa tài khoản ngân hàng. Quét mã không chuyển tiền thật. Để thử bước thành công, dùng “Mô phỏng nhận đủ tiền” trong Góc admin.','cf-order-demo-label'));
   payment.append(element('div', `Số tiền: ${money(order.amount)}`), element('div',`Nội dung chuyển khoản: ${order.id}`,'cf-order-reference'), element('div','QR dùng chung cho doanh nghiệp. Kiểm tra số tiền và nhập đúng nội dung chuyển khoản. Bản mẫu không xác minh giao dịch ngân hàng thật.','cf-order-hint'), element('div','Đang chờ thông báo nhận đủ tiền từ hệ thống thanh toán. Mở QR hoặc bấm thanh toán chưa phải là đăng ký thành công.','cf-order-hint'));
   card.append(payment,orderAction('Huỷ',()=>transition(c=>cancelDemoOrder(c,order.id)),true));
  }
 }
}
find('offer-toggle').addEventListener('click', () => {
 offerForm.hidden = !offerForm.hidden;
 find('offer-toggle').setAttribute('aria-expanded',String(!offerForm.hidden));
 if (!offerForm.hidden) {
  offerForm.reset();
  offerForm.elements.namedItem('packageName').value = current().interest || '';
  offerForm.elements.namedItem('company').focus();
 }
});
find('offer-fill-demo').addEventListener('click', () => {
 const sample = { company:'Công ty TNHH Doanh nghiệp Mẫu', taxId:'0000000000', address:'Địa chỉ giả lập · Việt Nam', contact:'Khách hàng Mẫu', phone:'0000000000', email:'khach@example.com', packageName:current().interest || 'Gói giải pháp mẫu', users:'30', months:'12', amount:'12000000' };
 for (const [key,value] of Object.entries(sample)) offerForm.elements.namedItem(key).value = value;
});
offerForm.addEventListener('submit', event => {
 event.preventDefault();
 try {
  if (!offerForm.reportValidity()) return;
  conversations.set(activeId, createDemoOffer(current(),Object.fromEntries(new FormData(offerForm))));
  offerFeedback.textContent = 'Đã gửi phiếu mẫu vào hội thoại; chưa thanh toán hoặc đăng ký gói.';
  offerForm.hidden = true; find('offer-toggle').setAttribute('aria-expanded','false'); render();
  const card = [...transcript.querySelectorAll('[data-order-id]')].at(-1);
  card.tabIndex = -1; card.focus({preventScroll:true});
  requestAnimationFrame(() => { dialog.scrollTop = 0; transcript.scrollTop = card.offsetTop - transcript.offsetTop; });
 } catch(error) { offerFeedback.textContent = error.message; }
});
find('bank-qr-image').addEventListener('change', async event => {
 const file = event.target.files[0]; if (!file) return;
 if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 5*1024*1024) {
  offerFeedback.textContent = 'Chọn ảnh PNG, JPG hoặc WebP tối đa 5 MB.'; event.target.value = ''; return;
 }
 const url = URL.createObjectURL(file);
 try {
  const picture = new Image(); picture.src = url; await picture.decode();
  if (bankQrUrl.startsWith('blob:')) URL.revokeObjectURL(bankQrUrl);
  bankQrUrl = url; bankQrIsDemo = false; renderOrders();
  offerFeedback.textContent = 'Đã chọn ảnh QR cố định dùng chung trong bản mẫu. Ảnh chưa được tải lên máy chủ.';
 } catch {
  URL.revokeObjectURL(url); event.target.value = ''; offerFeedback.textContent = 'Không đọc được ảnh QR. Vui lòng chọn ảnh khác.';
 }
});
function simulateReceipt(wrongAmount = false) {
 const previous = activeOrder(current()); if (!previous) return;
 try {
  const next = applyDemoReceipt(current(), { source:'demo-system', id:crypto.randomUUID(), orderId:previous.id, amount:previous.amount + (wrongAmount ? -1 : 0), currency:'VND', direction:'credit' });
  conversations.set(activeId,next); offerFeedback.textContent = ''; render();
  if (previous.status !== 'paid' && activeOrder(next).status === 'paid') {
   document.querySelector('#payment-success-copy').textContent = `Mô phỏng: đã nhận ${money(previous.amount)} cho ${previous.company}, gói ${previous.packageName}. Không phải xác nhận thanh toán hoặc kích hoạt dịch vụ thật.`;
   successPopup.showModal();
  }
 } catch(error) { offerFeedback.textContent = error.message; }
}
find('simulate-receipt').addEventListener('click',()=>simulateReceipt());
find('simulate-wrong-amount').addEventListener('click',()=>simulateReceipt(true));
document.querySelector('#payment-success-close').addEventListener('click',()=>successPopup.close());
successPopup.addEventListener('close',()=>find('consult-close').focus());

find('bank-qr-reset').addEventListener('click', () => {
 if (bankQrUrl.startsWith('blob:')) URL.revokeObjectURL(bankQrUrl);
 bankQrUrl = demoQrUrl; bankQrIsDemo = true; find('bank-qr-image').value = ''; renderOrders();
 offerFeedback.textContent = 'Đã dùng lại QR giả lập CloudFit. Không chuyển tiền thật.';
});
