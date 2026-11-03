import test from 'node:test';
import assert from 'node:assert/strict';
import {createSandboxHandler as makeSandboxHandler} from '../supabase/functions/sepay-sandbox/handler.mjs';
import {createIpnHandler as makeIpnHandler} from '../supabase/functions/sepay-sandbox-ipn/handler.mjs';
import {sendSandboxPayment,createPaymentNotifier} from '../supabase/functions/sandbox-payment-notify/handler.mjs';
import {parsePaidIpn,invoiceCode,sandboxConfig,sandboxIpnSecret} from '../supabase/functions/_shared/sepay-sandbox.mjs';
import {validateSandboxCheckout} from '../catalog/sepay-sandbox.mjs';
const id='50000000-0000-4000-8000-000000000001',transaction='60000000-0000-4000-8000-000000000001',provider='70000000-0000-4000-8000-000000000001';
const token='a'.repeat(64),secret='test-ipn-secret-'.repeat(3);
const values={SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'fake-server-only',SEPAY_SANDBOX_MERCHANT_ID:'SP-TEST-CLOUDFIT',SEPAY_SANDBOX_SECRET_KEY:'spsk_test_'+ 'a'.repeat(32),SEPAY_SANDBOX_IPN_SECRET:secret,TELEGRAM_BOT_TOKEN:'fake-bot',TELEGRAM_CHAT_ID:'fake-chat'};
const env={get:key=>values[key]};
const invoice={company:'Công ty giả lập',taxId:'0000000000',address:'Địa chỉ mẫu',contact:'Khách mẫu',phone:'0000000000',email:'khach@example.com',packageName:'Gói thử',users:10,months:1,amount:10000};
const request=(body,headers={})=>new Request('https://function.example',{method:'POST',headers:{Origin:'https://cloudfitk.vercel.app','Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const event=()=>({notification_type:'ORDER_PAID',order:{id:provider,order_invoice_number:invoiceCode(id),order_status:'CAPTURED',order_currency:'VND',order_amount:'10000.00'},transaction:{id:transaction,payment_method:'BANK_TRANSFER',transaction_status:'APPROVED',transaction_type:'PAYMENT',transaction_currency:'VND',transaction_amount:'10000'}});
// Official API replies are local fixtures. Existing settlement tests still exercise the
// real verifier; dedicated verification tests cover malformed and rejected API replies.
const providerReply=(paid=true)=>({data:{...event().order,order_status:paid?'CAPTURED':'AUTHENTICATION_NOT_NEEDED',transactions:paid?[event().transaction]:[]}});
const createIpnHandler=options=>makeIpnHandler({...options,fetchImpl:async(url,init)=>url.startsWith('https://pgapi-sandbox.sepay.vn/')?Response.json(providerReply()):options.fetchImpl(url,init)});
const createSandboxHandler=options=>makeSandboxHandler({...options,fetchImpl:async(url,init)=>url.startsWith('https://pgapi-sandbox.sepay.vn/')?Response.json(providerReply(false)):options.fetchImpl(url,init)});
test('missing/production/placeholder credentials fail closed without touching DB or signing checkout',async()=>{
 for(const patch of [{SEPAY_SANDBOX_MERCHANT_ID:undefined},{SEPAY_SANDBOX_MERCHANT_ID:'SP-PRODUCTION'},{SEPAY_SANDBOX_SECRET_KEY:'spsk_live_secret'},{SEPAY_SANDBOX_MERCHANT_ID:'SP-TEST-XXXXXXXX'}]) {
  const h=createSandboxHandler({env:{get:k=>({...values,...patch})[k]},makeClient:()=>assert.fail(),fetchImpl:()=>assert.fail()});
  assert.equal((await h(request({action:'checkout',invoice_id:id,access_token:token,acknowledge_sandbox:true,invoice}))).status,503);
 }
});
test('checkout works without IPN configuration and saves immutable invoice before signing',async()=>{
 let saved=false;
 const h=createSandboxHandler({env:{get:k=>k==='SEPAY_SANDBOX_IPN_SECRET'?undefined:values[k]},fetchImpl:async(url,init)=>{assert.match(url,/create_sepay_sandbox_invoice$/);const data=JSON.parse(init.body);assert.equal(data.p_amount,10000);assert.notEqual(data.p_token_hash,token);saved=true;return Response.json({id,invoice_number:invoiceCode(id),amount:10000,status:'pending'});},makeClient:config=>{assert.equal(config.env,'sandbox');return {checkout:{initCheckoutUrl:()=> 'https://pay-sandbox.sepay.vn/v1/checkout/init',initOneTimePaymentFields:fields=>{assert.equal(saved,true);assert.equal(fields.order_amount,10000);assert.ok(!JSON.stringify(fields).includes(token));return {...fields,merchant:config.merchant_id,signature:'fake-signature'};}}};}});
 const response=await h(request({action:'checkout',invoice_id:id,access_token:token,acknowledge_sandbox:true,invoice}));
 assert.equal(response.status,200);const result=await response.json();validateSandboxCheckout(result,id);assert.ok(!JSON.stringify(result).includes(values.SEPAY_SANDBOX_SECRET_KEY));
 assert.throws(()=>validateSandboxCheckout({...result,action:'https://pay.sepay.vn/v1/checkout/init'},id));
});
test('public endpoint validates consent to sandbox, invoice, origin and bearer capability before DB access',async()=>{
 const h=createSandboxHandler({env,makeClient:()=>assert.fail(),fetchImpl:()=>assert.fail()});
 for(const body of [{action:'status',invoice_id:id,access_token:'wrong'},{action:'checkout',invoice_id:id,access_token:token,invoice},{action:'checkout',invoice_id:id,access_token:token,acknowledge_sandbox:true,invoice:{...invoice,amount:-1}}])assert.equal((await h(request(body))).status,400);
 assert.equal((await h(request({}, {Origin:'https://evil.example'}))).status,403);
});
test('IPN requires configured header secret, ignores non-paid events, and rejects malformed paid state',async()=>{
 const h=createIpnHandler({env,fetchImpl:()=>assert.fail('no database or Telegram')});
 assert.equal((await h(request(event()))).status,401);
 assert.equal((await h(request(event(),{'X-Secret-Key':'wrong'}))).status,401);
 assert.deepEqual(await (await h(request({notification_type:'TRANSACTION_VOID'},{'X-Secret-Key':secret}))).json(),{success:true,ignored:true});
 for(const key of ['order','transaction']) {
  const data=event();if(key==='order')data.order.order_currency='USD';else data.transaction.transaction_amount='9999';
  assert.equal((await h(request(data,{'X-Secret-Key':secret}))).status,400);
 }
 const bad=event();bad.transaction.transaction_type='REFUND';assert.throws(()=>parsePaidIpn(bad));
});
test('valid IPN calls atomic settlement once and returns 200 only after DB accepts it',async()=>{
 for(const accepted of [true,false]) {
  let calls=0;
  const h=createIpnHandler({env,fetchImpl:async(url,init)=>{calls++;assert.match(url,/settle_sepay_sandbox_invoice$/);assert.deepEqual(JSON.parse(init.body),{p_invoice_number:invoiceCode(id),p_amount:10000,p_transaction_id:transaction,p_provider_order_id:provider});return Response.json({accepted});}});
  assert.equal((await h(request(event(),{'X-Secret-Key':secret}))).status,accepted?200:409);assert.equal(calls,1);
 }
});
test('status returns only backend confirmation, never browser success flags or contact details',async()=>{
 const h=createSandboxHandler({env,makeClient:()=>assert.fail(),fetchImpl:async()=>Response.json({id,invoice_number:invoiceCode(id),amount:10000,status:'pending'})});
 const response=await h(request({action:'status',invoice_id:id,access_token:token,payment:'success',status:'paid'}));
 const result=await response.json();assert.equal(result.status,'pending');assert.equal(result.details,undefined);
});
test('Telegram sandbox transport marks every message as TEST and never retries ambiguous delivery',async()=>{
 let calls=0;
 const row={invoice_number:invoiceCode(id),amount:10000,details:invoice};
 const result=await sendSandboxPayment(row,env,async(_url,init)=>{calls++;const payload=JSON.parse(init.body);assert.match(payload.text,/THỬ NGHIỆM — SEPAY SANDBOX/);assert.match(payload.text,/Không phát sinh tiền thật/);return Response.json({ok:true,result:{message_id:7}});});
 assert.deepEqual(result,{status:'sent',messageId:7});assert.equal(calls,1);
 const unknown=await sendSandboxPayment(row,env,async()=>{throw new Error('private-token-url');});assert.equal(unknown.status,'unknown');assert.ok(!JSON.stringify(unknown).includes('private'));
});
test('payment notifier requires atomic claim and a paid sandbox invoice before contacting Telegram',async()=>{
 let calls=0;
 const h=createPaymentNotifier({env,fetchImpl:async()=>{calls++;return Response.json([]);}});
 assert.equal((await h(request({invoice_id:id}))).status,401);assert.equal(calls,0);
 const response=await h(request({invoice_id:id},{'x-delivery-token':'a'.repeat(72)}));assert.equal(response.status,409);assert.equal(calls,1);
});

test('missing IPN key reproduces diagnosed configuration failure with safe diagnostics before DB',async()=>{
 const entries=[];let dbCalls=0;
 const h=createIpnHandler({env:{get:k=>k==='SEPAY_SANDBOX_IPN_SECRET'?undefined:values[k]},report:entry=>entries.push(entry),fetchImpl:()=>{dbCalls++;assert.fail();}});
 const response=await h(request(event()));
 assert.equal(response.status,503);
 assert.deepEqual(await response.json(),{error:'ipn_not_configured',configuration:['SEPAY_SANDBOX_IPN_SECRET']});
 assert.equal(dbCalls,0);
 assert.deepEqual(entries,[{component:'sepay-sandbox-ipn',code:'ipn_not_configured',stage:'configuration'}]);
 assert.ok(!JSON.stringify(entries).includes(values.SEPAY_SANDBOX_SECRET_KEY));
});
test('IPN key remains separate; authenticated IPN still requires merchant credentials for API verification',async()=>{
 let calls=0;
 const ipnOnly={get:k=>k.startsWith('SEPAY_')&&k!=='SEPAY_SANDBOX_IPN_SECRET'?undefined:values[k]};
 const h=createIpnHandler({env:ipnOnly,fetchImpl:async()=>{calls++;return Response.json({accepted:true});}});
 assert.equal((await h(request(event(),{'X-Secret-Key':secret}))).status,503);
 assert.equal(calls,0);
 assert.equal((await h(request(event(),{'x-secret-key':values.SEPAY_SANDBOX_SECRET_KEY}))).status,401);
 assert.equal(calls,0);
 assert.throws(()=>sandboxConfig(ipnOnly),/sandbox_not_configured/);
});

test('IPN accepts only an explicitly configured key and does not impose the checkout key prefix or invented length',async()=>{
 const independent='configured-ipn-key';
 const custom={get:k=>k==='SEPAY_SANDBOX_IPN_SECRET'?independent:values[k]};
 assert.equal(sandboxIpnSecret(custom),independent);
 const h=createIpnHandler({env:custom,fetchImpl:async()=>Response.json({accepted:true})});
 assert.equal((await h(request(event(),{'X-Secret-Key':independent}))).status,200);
 assert.equal((await h(request(event()))).status,401);
 assert.equal((await h(request(event(),{'X-Secret-Key':'wrong'}))).status,401);
 assert.throws(()=>sandboxIpnSecret({get:()=> '  '+independent}),/ipn_invalid_configuration/);
});
test('cancel needs only backend capability; status requires merchant credentials for independent verification',async()=>{
 const backendOnly={get:k=>k.startsWith('SEPAY_')?undefined:values[k]};
 const h=createSandboxHandler({env:backendOnly,makeClient:()=>assert.fail(),fetchImpl:async(_url,init)=>{
  const data=JSON.parse(init.body);return Response.json({id,invoice_number:invoiceCode(id),amount:10000,status:data.p_cancel?'cancelled':'pending'});
 }});
 assert.equal((await h(request({action:'cancel',invoice_id:id,access_token:token}))).status,200);
 assert.equal((await h(request({action:'status',invoice_id:id,access_token:token}))).status,503);
});
test('failed or voided transactions never settle; valid foreign invoice code reaches matching without auto-payment',async()=>{
 let calls=0;
 const h=createIpnHandler({env,fetchImpl:async()=>{calls++;return Response.json({accepted:false});}});
 const failure=event();failure.transaction.transaction_status='DECLINED';
 assert.equal((await h(request(failure,{'x-secret-key':secret}))).status,400);
 assert.equal((await h(request({notification_type:'TRANSACTION_VOID'},{'x-secret-key':secret}))).status,200);
 assert.equal(calls,0);
 const foreign=event();foreign.order.order_invoice_number='SUB_202509_001';
 assert.equal((await h(request(foreign,{'x-secret-key':secret}))).status,409);
 assert.equal(calls,0);
 assert.equal((await h(request({}, {'x-secret-key':secret}))).status,400);
});
test('database errors and unknown exceptions stay retryable without leaking secrets, URLs or request bodies',async()=>{
 const entries=[];
 const h=createIpnHandler({env,report:e=>entries.push(e),fetchImpl:async()=>{throw new Error('private '+secret+' '+values.SUPABASE_SERVICE_ROLE_KEY);}});
 const response=await h(request(event(),{'x-secret-key':secret}));assert.equal(response.status,503);
 const output=JSON.stringify({body:await response.json(),entries});
 for(const value of [secret,values.SUPABASE_SERVICE_ROLE_KEY])assert.ok(!output.includes(value));
 assert.equal(entries[0].stage,'settlement');
 const dbFailure=createIpnHandler({env,report:e=>entries.push(e),fetchImpl:async()=>Response.json({message:secret},{status:500})});
 assert.deepEqual(await(await dbFailure(request(event(),{'x-secret-key':secret}))).json(),{error:'database_error'});
 const noDb=createIpnHandler({env:{get:k=>k.startsWith('SUPABASE_')?undefined:values[k]},report:e=>entries.push(e),fetchImpl:()=>assert.fail()});
 assert.deepEqual(await(await noDb(request(event(),{'x-secret-key':secret}))).json(),{error:'backend_configuration'});
});
test('IPN never acknowledges a truthy non-boolean settlement result as a valid payment',async()=>{
 for(const accepted of ['true',1,null]) {
  const h=createIpnHandler({env,fetchImpl:async()=>Response.json({accepted})});
  assert.equal((await h(request(event(),{'x-secret-key':secret}))).status,409);
 }
});

test('notifier cannot send Telegram when claimed invoice is absent or not paid',async()=>{
 let reads=0,finishes=0;
 const h=createPaymentNotifier({env,fetchImpl:async(url,init)=>{
  if(url.includes('api.telegram.org'))assert.fail('unpaid/missing invoice must never notify');
  if(url.includes('token_hash='))return Response.json([{invoice_id:id}]);
  if(url.includes('/sepay_sandbox_invoices?')){reads++;assert.match(url,/status=eq.paid&environment=eq.sandbox/);return Response.json([]);}
  finishes++;assert.equal(JSON.parse(init.body).status,'failed');return Response.json([{invoice_id:id}]);
 }});
 const r=await h(request({invoice_id:id},{'x-delivery-token':'a'.repeat(72)}));
 assert.equal(r.status,200);assert.deepEqual(await r.json(),{invoice_id:id,status:'failed'});assert.equal(reads,1);assert.equal(finishes,1);
});
test('notifier claims once before paid-invoice notification and replay cannot send again',async()=>{
 let claimed=false,sends=0,finished=false;
 const h=createPaymentNotifier({env,fetchImpl:async(url,init)=>{
  if(url.includes('token_hash=')){if(claimed)return Response.json([]);claimed=true;return Response.json([{invoice_id:id}]);}
  if(url.includes('/sepay_sandbox_invoices?'))return Response.json([{invoice_number:invoiceCode(id),amount:10000,details:invoice}]);
  if(url.includes('api.telegram.org')){assert.equal(claimed,true);sends++;assert.match(JSON.parse(init.body).text,/THỬ NGHIỆM/);return Response.json({ok:true,result:{message_id:17}});}
  finished=true;assert.equal(JSON.parse(init.body).status,'sent');return Response.json([{invoice_id:id}]);
 }});
 const send=()=>h(request({invoice_id:id},{'x-delivery-token':'a'.repeat(72)}));
 assert.equal((await send()).status,200);assert.equal((await send()).status,409);assert.equal(sends,1);assert.equal(finished,true);
});
