import test from 'node:test';
import assert from 'node:assert/strict';
import { createConversation, answerConversation, questions } from '../catalog/chat.mjs';
import { createDemoOffer, activeOrder, startDemoPayment, cancelDemoOrder, applyDemoReceipt } from '../catalog/chat-order.mjs';
const id='30000000-0000-4000-8000-000000000001';
const eventId='40000000-0000-4000-8000-000000000001';
const details={company:'Doanh nghiệp mẫu',taxId:'0000000000',address:'Địa chỉ giả lập',contact:'Khách mẫu',email:'khach@example.com',phone:'0000000000',packageName:'Gói mẫu',users:'30',months:'12',amount:'12000000'};
function surveyed(customer='your-company') {
 let state=createConversation(customer);
 for(const q of questions)state=answerConversation(state,q.choices[0]);
 return state;
}
const offered=()=>createDemoOffer(surveyed(),details,id);
const receipt=(patch={})=>({source:'demo-system',id:eventId,orderId:id,amount:12000000,currency:'VND',direction:'credit',...patch});

test('admin cannot send offer before survey or with invalid company/package/price fields',()=>{
 assert.throws(()=>createDemoOffer(createConversation('your-company'),details,id),/khảo sát/);
 for(const patch of [{company:''},{taxId:'abc'},{address:''},{contact:''},{email:'bad'},{phone:'bad'},{packageName:''},{users:0},{months:0},{amount:0},{amount:-1},{amount:'1.5'},{amount:Infinity}])assert.throws(()=>createDemoOffer(surveyed(),{...details,...patch},id));
});
test('admin offer freezes enterprise details and total; sending the offer never registers or pays',()=>{
 const raw={...details};const state=createDemoOffer(surveyed(),raw,id);raw.amount='1';
 assert.equal(activeOrder(state).amount,12000000);
 assert.equal(activeOrder(state).status,'offered');
 assert.equal(activeOrder(state).paymentEventId,null);
 assert.equal(state.messages.at(-1).type,'offer');
 assert.throws(()=>createDemoOffer(state,details),/trùng/);
});
test('payment action only opens awaiting state; success requires matching simulated system receipt',()=>{
 const offer=offered();
 assert.throws(()=>applyDemoReceipt(offer,receipt()),/không chờ/);
 const waiting=startDemoPayment(offer,id);
 assert.equal(activeOrder(waiting).status,'awaiting_payment');
 assert.equal(activeOrder(waiting).paymentEventId,null);
 assert.equal(activeOrder(offer).status,'offered');
 const paid=applyDemoReceipt(waiting,receipt());
 assert.equal(activeOrder(paid).status,'paid');
 assert.equal(activeOrder(paid).paymentEventId,eventId);
 assert.match(paid.messages.at(-1).text,/thành công trong bản mẫu/);
});
test('incorrect amount, order, direction, currency or untrusted demo event never confirms payment',()=>{
 const waiting=startDemoPayment(offered(),id);
 for(const patch of [{amount:11999999},{amount:12000001},{amount:'12000000'},{orderId:'another-order'},{currency:'USD'},{direction:'debit'},{source:'customer-click'},{id:'invalid'}])assert.throws(()=>applyDemoReceipt(waiting,receipt(patch)),/chưa xác nhận/);
 assert.equal(activeOrder(waiting).status,'awaiting_payment');
});
test('replayed receipt is idempotent; another receipt cannot register the same package twice',()=>{
 const paid=applyDemoReceipt(startDemoPayment(offered(),id),receipt());
 assert.equal(applyDemoReceipt(paid,receipt()),paid);
 assert.throws(()=>applyDemoReceipt(paid,receipt({id:'40000000-0000-4000-8000-000000000002'})),/không chờ/);
 assert.throws(()=>cancelDemoOrder(paid,id),/Không thể huỷ/);
});
test('cancelled offers and late receipts cannot cause registration; replacements keep prior history',()=>{
 for(const state of [offered(),startDemoPayment(offered(),id)]) {
  const cancelled=cancelDemoOrder(state,id);
  assert.equal(activeOrder(cancelled).status,'cancelled');
  assert.throws(()=>startDemoPayment(cancelled,id));
  assert.throws(()=>applyDemoReceipt(cancelled,receipt()));
  assert.throws(()=>createDemoOffer(cancelled,details,id),/đã tồn tại/);
  const replacement=createDemoOffer(cancelled,details,'30000000-0000-4000-8000-000000000002');
  assert.equal(replacement.orders.length,2);
  assert.equal(replacement.orders[0].status,'cancelled');
  assert.throws(()=>applyDemoReceipt(startDemoPayment(replacement,activeOrder(replacement).id),receipt()),/chưa xác nhận/);
 }
});
test('each customer retains independent offer and receipt states',()=>{
 const a=startDemoPayment(offered(),id);
 const b=surveyed('mekong-demo');
 assert.equal(activeOrder(b),undefined);
 assert.equal(activeOrder(a).status,'awaiting_payment');
 assert.throws(()=>applyDemoReceipt(b,receipt()));
});
