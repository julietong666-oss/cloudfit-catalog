// Local design prototype only. These transitions do not create real orders,
// verify a bank transaction or grant access to a service.
import { questions } from './chat.mjs';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function text(value, label, limit = 200) {
 const result = typeof value === 'string' ? value.trim() : '';
 if (!result || result.length > limit) throw new Error(`Vui lòng kiểm tra ${label}.`);
 return result;
}
function integer(value, label, max) {
 if (!/^[0-9]+$/.test(String(value))) throw new Error(`Vui lòng kiểm tra ${label}.`);
 const result = Number(value);
 if (!Number.isSafeInteger(result) || result < 1 || result > max) throw new Error(`Vui lòng kiểm tra ${label}.`);
 return result;
}
export function activeOrder(conversation) { return conversation.orders?.at(-1); }
export function createDemoOffer(conversation, data, id = crypto.randomUUID()) {
 if (conversation.source==='consultation') throw new Error('Không dùng công cụ mô phỏng để thanh toán cho yêu cầu tư vấn thật.');
 if (conversation.step !== questions.length) throw new Error('Cần hoàn tất khảo sát trước khi gửi phiếu.');
 if (activeOrder(conversation) && activeOrder(conversation).status !== 'cancelled') throw new Error('Phiếu hiện tại chưa huỷ hoặc đã thanh toán; không tạo phiếu trùng.');
 if (!uuid.test(id) || conversation.orders?.some(order => order.id === id)) throw new Error('Mã phiếu không hợp lệ hoặc đã tồn tại.');
 const company = text(data.company, 'tên doanh nghiệp');
 const taxId = text(data.taxId, 'mã số thuế', 14);
 if (!/^\d{10}(?:-?\d{3})?$/.test(taxId)) throw new Error('Mã số thuế gồm 10 hoặc 13 chữ số (có thể có dấu gạch nối chi nhánh).');
 const address = text(data.address, 'địa chỉ doanh nghiệp', 500);
 const contact = text(data.contact, 'người đại diện / liên hệ', 120);
 const email = text(data.email, 'email nhận xác nhận', 254);
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email nhận xác nhận không hợp lệ.');
 const phone = text(data.phone, 'số điện thoại', 24).replace(/[ ()-]/g, '');
 if (!/^\+?\d{8,15}$/.test(phone)) throw new Error('Số điện thoại không hợp lệ.');
 const order = {
  id, company, taxId, address, contact, email, phone,
  packageName: text(data.packageName, 'gói dịch vụ'),
  users: integer(data.users, 'số người dùng', 100000000),
  months: integer(data.months, 'thời hạn dịch vụ', 120),
  amount: integer(data.amount, 'tổng thanh toán bằng VND', 1000000000000),
  currency: 'VND', status: 'offered', paymentEventId: null,
 };
 return { ...conversation, orders: [...(conversation.orders || []), order], messages: [...conversation.messages, { role: 'admin', type: 'offer', orderId: id }] };
}
function updateOrder(conversation, order) {
 return { ...conversation, orders: conversation.orders.map(item => item.id === order.id ? order : item) };
}
export function startDemoPayment(conversation, id) {
 const order = activeOrder(conversation);
 if (!order || order.id !== id || order.status !== 'offered') throw new Error('Phiếu không còn ở trạng thái chờ xác nhận mua.');
 return updateOrder(conversation, { ...order, status: 'awaiting_payment' });
}
export function cancelDemoOrder(conversation, id) {
 const order = activeOrder(conversation);
 if (!order || order.id !== id || !['offered', 'awaiting_payment'].includes(order.status)) throw new Error('Không thể huỷ phiếu này.');
 const updated = updateOrder(conversation, { ...order, status: 'cancelled' });
 return { ...updated, messages: [...updated.messages, { role: 'customer', text: 'Đã huỷ phiếu xác nhận mua. Chưa đăng ký hoặc kích hoạt gói.' }] };
}
// A separately labelled demo-system control supplies events for this prototype.
// Real payment MUST use a server-verified provider webhook and atomic DB update;
// calling this client function is never proof that a real bank received money.
export function applyDemoReceipt(conversation, event) {
 const order = activeOrder(conversation);
 if (!order || event?.source !== 'demo-system' || !uuid.test(event?.id || '')
  || event.orderId !== order.id || event.amount !== order.amount || event.currency !== 'VND' || event.direction !== 'credit') {
  throw new Error('Thông báo chưa khớp mã phiếu, số tiền hoặc loại giao dịch; chưa xác nhận thanh toán.');
 }
 if (order.status === 'paid' && order.paymentEventId === event.id) return conversation;
 if (order.status !== 'awaiting_payment') throw new Error('Phiếu không chờ nhận tiền; không xác nhận lại hoặc xác nhận phiếu đã huỷ.');
 const updated = updateOrder(conversation, { ...order, status: 'paid', paymentEventId: event.id });
 return { ...updated, messages: [...updated.messages, { role: 'admin', text: `Mô phỏng: hệ thống thanh toán đã xác nhận nhận đủ tiền cho phiếu ${order.id}. Đã đăng ký gói ${order.packageName} thành công trong bản mẫu. Cảm ơn doanh nghiệp đã tin tưởng CloudFit!` }] };
}
