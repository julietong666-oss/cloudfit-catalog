import test from 'node:test';
import assert from 'node:assert/strict';
import { answerConversation, createConversation, demoCustomers, questions } from '../catalog/chat.mjs';

test('sample consultation keeps customer-to-admin ownership stable and conversations isolated', () => {
 const first = createConversation('your-company');
 const second = createConversation('mekong-demo');
 const replied = answerConversation(first, '30 nhân viên và 2.000 khách hàng');
 assert.equal(demoCustomers.find(c=>c.id===replied.customerId).admin,'Ngọc Anh');
 assert.equal(demoCustomers.find(c=>c.id===second.customerId).admin,'Minh Quân');
 assert.match(first.messages[0].text,/Ngọc Anh/);
 assert.match(second.messages[0].text,/Minh Quân/);
 assert.deepEqual(second.answers,{});
 assert.deepEqual(first.answers,{});
 assert.equal(replied.answers.users,'30 nhân viên và 2.000 khách hàng');
 assert.throws(()=>createConversation('unknown'),/không hợp lệ/);
});

test('complete consultation captures scope, company context, goals, budget and timing without buying a package', () => {
 let conversation = createConversation('your-company');
 const answers = ['30 nhân viên','Công ty phần mềm, đang mở rộng','Tích hợp và bảo mật','Chưa xác định ngân sách','Trong 1–3 tháng'];
 for(const answer of answers) conversation=answerConversation(conversation,answer);
 assert.equal(conversation.step,5);
 assert.deepEqual(Object.values(conversation.answers),answers);
 assert.equal(conversation.interest,'','no package is required for the local chat prototype');
 assert.match(conversation.messages.at(-1).text,/chưa phát sinh mua gói hoặc thanh toán/);
 assert.throws(()=>answerConversation(conversation,'gửi thêm'),/đã hoàn tất/);
 assert.equal(conversation.messages.length,12);
});

test('validation rejects blank and oversize messages without advancing or losing earlier answers', () => {
 const conversation=answerConversation(createConversation('your-company'),'Chưa xác định');
 for(const invalid of ['', '  ', undefined, 'a'.repeat(1001)]) assert.throws(()=>answerConversation(conversation,invalid));
 assert.equal(conversation.step,1);
 assert.equal(conversation.answers.users,'Chưa xác định');
 const next=answerConversation(conversation,'  <script>demo</script>  ');
 assert.equal(next.answers.context,'<script>demo</script>','UI must render messages as text, never markup');
 assert.equal(answerConversation(conversation,'a'.repeat(1000)).step,2);
});

test('restart creates a fresh survey while preserving actual package context explicitly supplied by the UI', () => {
 const previous=answerConversation(createConversation('your-company','Gói quan tâm'),'20 nhân viên');
 const fresh=createConversation(previous.customerId,previous.interest);
 assert.equal(fresh.interest,'Gói quan tâm');
 assert.equal(fresh.step,0);
 assert.deepEqual(fresh.answers,{});
 assert.equal(previous.step,1);
 assert.equal(questions.length,5);
});
