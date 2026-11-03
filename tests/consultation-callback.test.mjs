import test from 'node:test';
import assert from 'node:assert/strict';
import {issueConsultationReceipt,verifyConsultationReceipt,RECEIPT_LIFETIME} from '../supabase/functions/_shared/consultation-receipt.mjs';
import {createCallbackHandler} from '../supabase/functions/consultation-callback/handler.mjs';
import {createIntakeHandler} from '../supabase/functions/purchase-request/handler.mjs';
import {requestContactLater,consultationReceipt} from '../catalog/purchase.mjs';
const id='20000000-0000-4000-8000-000000000001',product='sample',now=Date.now();
const values={SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'local-only-root-key-not-for-deployment',TELEGRAM_BOT_TOKEN:'654321:local_payment_only_bot',TELEGRAM_CALLBACK_BOT_TOKEN:'123456:local_callback_only_bot',TELEGRAM_CHAT_ID:'-100100',TELEGRAM_CALLBACK_CHAT_ID:'-100200'};
const env={get:k=>values[k]};
const row={id,product_id:product,product_name:'Gói mẫu',contact_name:'Khách mẫu',phone:'0000000000',created_at:new Date(now).toISOString(),is_test:true};
const proof=()=>issueConsultationReceipt(env,id,product,now);
const req=(receipt,extra={},headers={})=>new Request('https://callback.example',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://cloudfitk.vercel.app',...headers},body:JSON.stringify({action:'contact_later',request_id:id,product_id:product,receipt,...extra})});
function fixture(options={}){
 let delivery=null,sends=0,lastMessage,lastDestination,claims=0;
 const fetchImpl=async(url,init)=>{
  if(url.endsWith('/getMe'))return Response.json({ok:true,result:{id:123456,is_bot:true}});
  if(url.endsWith('/getChat'))return Response.json({ok:true,result:{id:-100200,title:'Recall',type:'group'}});
  if(url.endsWith('/getChatMember'))return Response.json({ok:true,result:{status:'member'}});
  if(url.includes('api.telegram.org/')){assert.ok(url.includes(values.TELEGRAM_CALLBACK_BOT_TOKEN));
   sends++;const payload=JSON.parse(init.body);lastMessage=payload.text;lastDestination=payload.chat_id;
   if(options.networkFailure)throw new Error(values.TELEGRAM_CALLBACK_BOT_TOKEN+' private network');
   return Response.json(options.telegramReject?{ok:false,error_code:400,description:'chat not found'}:{ok:true,result:{message_id:42}},{status:options.telegramReject?400:200});
  }
  if(url.includes('/purchase_requests?'))return Response.json(options.missing?[]:[row]);
  if(init.method==='POST'){
   assert.equal(init.headers.Prefer,'resolution=ignore-duplicates,return=representation');
   if(delivery)return Response.json([]);
   delivery={...JSON.parse(init.body)};claims++;return Response.json([delivery]);
  }
  if(init.method==='PATCH'){
   if(url.includes('status=eq.failed')&&delivery?.status!=='failed')return Response.json([]);
   if(url.includes('status=eq.processing')&&delivery?.status!=='processing')return Response.json([]);
   if(options.failFinish&&JSON.parse(init.body).status!=='processing')return Response.json([]);
   Object.assign(delivery,JSON.parse(init.body));return Response.json([delivery]);
  }
  return Response.json(delivery?[delivery]:[]);
 };
 return {fetchImpl,state:()=>({delivery,sends,lastMessage,lastDestination,claims})};
}
test('receipt is bound to project, purpose, request, package and expiry without exposing root credentials',async()=>{
 const receipt=await proof();assert.match(receipt,/^v1\.\d{10}\.[a-f0-9]{64}$/);
 assert.equal(await verifyConsultationReceipt(env,id,product,receipt,now),true);
 for(const [requestId,packageId,value,clock] of [
  ['20000000-0000-4000-8000-000000000002',product,receipt,now],
  [id,'other',receipt,now],[id,product,receipt+'x',now],[id,product,receipt,now+(RECEIPT_LIFETIME+1)*1000],
 ])assert.equal(await verifyConsultationReceipt(env,requestId,packageId,value,clock),false);
 const other={get:k=>k==='SUPABASE_URL'?'https://other.example':values[k]};
 assert.equal(await verifyConsultationReceipt(other,id,product,receipt,now),false);
 assert.ok(!receipt.includes(values.SUPABASE_SERVICE_ROLE_KEY));
});
test('intake issues callback proof only after saved request matches and does not contact Telegram',async()=>{
 let called=false;
 const handler=createIntakeHandler({env,fetchImpl:async(url)=>{assert.ok(!url.includes('telegram'));called=true;return Response.json(id);}});
 const response=await handler(new Request('https://intake.example',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_id:id,product_id:product,contact_name:'Khách mẫu',phone:'0000000000',consent:true})}));
 const body=await response.json();assert.equal(response.status,201);assert.equal(called,true);
 assert.equal(await verifyConsultationReceipt(env,id,product,body.callback_receipt),true);
 const failure=createIntakeHandler({env,fetchImpl:async()=>Response.json('different')});
 assert.equal((await(await failure(new Request('https://intake.example',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_id:id,product_id:product,contact_name:'Khách mẫu',phone:'0000000000',consent:true})}))).json()).callback_receipt,undefined);
});
test('forged/expired receipt, wrong package, wrong origin and malformed body never access saved data',async()=>{
 const handler=createCallbackHandler({env,now:()=>now,fetchImpl:()=>assert.fail('must not access DB or Telegram')});
 assert.equal((await handler(req('bad'))).status,401);
 assert.equal((await handler(req(await proof(),{product_id:'other'}))).status,401);
 assert.equal((await handler(req(await proof(),{}, {Origin:'https://evil.example'}))).status,403);
 assert.equal((await handler(req(await proof(),{action:'register'}))).status,400);
});
test('missing/same/invalid callback destination never falls back to payment chat or touches DB',async()=>{
 for(const patch of [{TELEGRAM_CALLBACK_CHAT_ID:undefined},{TELEGRAM_CALLBACK_CHAT_ID:'-100100'},{TELEGRAM_CALLBACK_CHAT_ID:'@alias'},{TELEGRAM_CALLBACK_BOT_TOKEN:values.TELEGRAM_BOT_TOKEN},{TELEGRAM_CALLBACK_BOT_TOKEN:undefined},{TELEGRAM_CALLBACK_BOT_TOKEN:'invalid token'}]){
  const custom={get:k=>({...values,...patch})[k]};
  const handler=createCallbackHandler({env:custom,now:()=>now,fetchImpl:()=>assert.fail()});
  assert.equal((await handler(req(await proof()))).status,503);
 }
});
test('callback sends saved name/phone/package only to separate group, with atomic dedup for concurrent calls',async()=>{
 const f=fixture(),handler=createCallbackHandler({env,now:()=>now,fetchImpl:f.fetchImpl}),receipt=await proof();
 const results=await Promise.all([handler(req(receipt,{chat_id:values.TELEGRAM_CHAT_ID,phone:'attacker phone',contact_name:'attacker'})),handler(req(receipt))]);
 assert.ok(results.every(r=>[200,202].includes(r.status)));
 assert.equal((await(await handler(req(receipt))).json()).status,'sent');
 const state=f.state();assert.equal(state.sends,1);assert.equal(state.claims,1);assert.equal(state.lastDestination,'-100200');
 for(const text of ['CLOUDFIT – YÊU CẦU GỌI LẠI','Khách mẫu','0000000000','Gói mẫu','chưa phát sinh thanh toán'])assert.ok(state.lastMessage.includes(text));
 assert.ok(!state.lastMessage.includes('attacker'));
});
test('missing saved request cannot create delivery or send contact information',async()=>{
 const f=fixture({missing:true}),handler=createCallbackHandler({env,now:()=>now,fetchImpl:f.fetchImpl});
 assert.equal((await handler(req(await proof()))).status,404);assert.equal(f.state().sends,0);assert.equal(f.state().delivery,null);
});
test('ambiguous delivery or failed persistence never automatically sends again and leaks no secrets',async()=>{
 for(const option of [{networkFailure:true},{failFinish:true}]){
  const f=fixture(option),handler=createCallbackHandler({env,now:()=>now,fetchImpl:f.fetchImpl}),receipt=await proof();
  const first=await(await handler(req(receipt))).json();await handler(req(receipt));
  assert.equal(f.state().sends,1);
  assert.equal(first.phone,undefined);assert.equal(first.contact_name,undefined);
  for(const value of [values.TELEGRAM_BOT_TOKEN,values.TELEGRAM_CALLBACK_BOT_TOKEN,values.SUPABASE_SERVICE_ROLE_KEY])assert.ok(!JSON.stringify(first).includes(value));
 }
});
test('explicit Telegram rejection can retry only on another customer click',async()=>{
 let clock=now;const options={telegramReject:true},f=fixture(options),handler=createCallbackHandler({env,now:()=>clock,fetchImpl:f.fetchImpl}),receipt=await proof();
 assert.equal((await(await handler(req(receipt))).json()).status,'failed');assert.equal(f.state().sends,1);
 assert.equal((await handler(req(receipt))).status,429);assert.equal(f.state().sends,1);
 clock+=61000;options.telegramReject=false;
 assert.equal((await(await handler(req(receipt))).json()).status,'sent');assert.equal(f.state().sends,2);
 await handler(req(receipt));assert.equal(f.state().sends,2);
});
test('frontend callback request sends no name, phone or recipient and preserves signed proof in receipt metadata',async()=>{
 const receipt=await proof();const data={requestId:id,productId:product,productName:'Gói mẫu',callbackReceipt:receipt,phone:row.phone};
 const result=await requestContactLater(data,async(_url,init)=>{const body=JSON.parse(init.body);assert.equal(body.receipt,receipt);assert.equal(body.phone,undefined);assert.equal(body.chat_id,undefined);return Response.json({request_id:id,status:'sent'});});
 assert.equal(result.status,'sent');assert.equal(consultationReceipt(data).callbackReceipt,receipt);assert.equal(consultationReceipt(data).phone,undefined);
 await assert.rejects(requestContactLater(data,async()=>Response.json({request_id:'wrong',status:'sent'})));
});

test('status check never sends/retries a message, even after explicit Telegram failure',async()=>{
 const f=fixture({telegramReject:true}),handler=createCallbackHandler({env,now:()=>now,fetchImpl:f.fetchImpl}),receipt=await proof();
 assert.equal((await(await handler(req(receipt,{action:'status'}))).json()).status,'not_requested');assert.equal(f.state().claims,0);
 await handler(req(receipt));assert.equal(f.state().sends,1);
 assert.equal((await(await handler(req(receipt,{action:'status'}))).json()).status,'failed');assert.equal(f.state().sends,1);
});

// Health verification is read-only and returns no destination or credentials.
test('destination health verifies dedicated bot, exact group and membership, caches concurrent checks',async()=>{
 const calls=[];
 const handler=createCallbackHandler({env,fetchImpl:async(url,init)=>{
  calls.push(url.split('/').at(-1));assert.ok(url.includes(values.TELEGRAM_CALLBACK_BOT_TOKEN));
  return fixture().fetchImpl(url,init);
 }});
 const responses=await Promise.all([handler(new Request('https://callback.example')),handler(new Request('https://callback.example'))]);
 for(const response of responses){assert.equal(response.status,200);assert.deepEqual(await response.json(),{status:'ready',callback_bot_verified:true,callback_group_verified:true});}
 assert.deepEqual(calls,['getMe','getChat','getChatMember']);
});
test('destination health rejects wrong group, blocked bot and API failure without sending or leaking secrets',async()=>{
 for(const [method,result,code] of [
  ['getMe',{ok:false},'callback_bot_rejected'],
  ['getChat',{ok:true,result:{id:-100200,type:'group',title:'wrong old group'}},'callback_group_name_mismatch'],
  ['getChatMember',{ok:true,result:{status:'left'}},'callback_bot_not_in_group'],
  ['getChatMember',{ok:true,result:{status:'restricted',is_member:true,can_send_messages:false}},'callback_send_permission_missing'],
 ]){
  const calls=[];const handler=createCallbackHandler({env,fetchImpl:async(url,init)=>{
   calls.push(url.split('/').at(-1));return url.endsWith('/'+method)?Response.json(result):fixture().fetchImpl(url,init);
  }});
  const response=await handler(new Request('https://callback.example'));assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:code});assert.ok(!calls.includes('sendMessage'));
 }
});

test('read-only verification network diagnostics identify stage without exposing errors or credentials',async()=>{
 for(const [error,code] of [[new DOMException('private message','TimeoutError'),'callback_bot_rejected_timeout'],[new TypeError(values.TELEGRAM_CALLBACK_BOT_TOKEN),'callback_bot_rejected_network']]){
  const handler=createCallbackHandler({env,fetchImpl:async()=>{throw error;}});
  const response=await handler(new Request('https://callback.example'));assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:code});
 }
});
