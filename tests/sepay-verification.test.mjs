import {sandboxReturnId} from '../catalog/sepay-sandbox.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createPaymentVerifier,matchProviderPayment,SANDBOX_API} from '../supabase/functions/_shared/sepay-verification.mjs';
import {createSandboxHandler} from '../supabase/functions/sepay-sandbox/handler.mjs';
import {createIpnHandler} from '../supabase/functions/sepay-sandbox-ipn/handler.mjs';
import {invoiceCode} from '../supabase/functions/_shared/sepay-sandbox.mjs';
const id='50000000-0000-4000-8000-000000000001',oid='70000000-0000-4000-8000-000000000001',tid='60000000-0000-4000-8000-000000000001';
const code=invoiceCode(id),token='a'.repeat(64),ipn='local-fixture-ipn-key-not-for-deployment';
const values={SEPAY_SANDBOX_MERCHANT_ID:'SP-TEST-CLOUDFIT',SEPAY_SANDBOX_SECRET_KEY:'spsk_test_'+ 'a'.repeat(32),SEPAY_SANDBOX_IPN_SECRET:ipn,SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'local-only-db-key'};
const env={get:k=>values[k]};
const invoice={id,invoice_number:code,amount:10000,status:'pending'};
const data=()=>({id:oid,order_id:'SEPAY-PUBLIC-REFERENCE',order_invoice_number:code,order_amount:'10000.00',order_currency:'VND',order_status:'CAPTURED',transactions:[{id:tid,transaction_amount:'10000',transaction_currency:'VND',transaction_type:'PAYMENT',transaction_status:'APPROVED',payment_method:'BANK_TRANSFER'}]});
const event=()=>({notification_type:'ORDER_PAID',order:data(),transaction:data().transactions[0]});
const req=(body,headers={})=>new Request('https://local.example',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const status=()=>req({action:'status',invoice_id:id,access_token:token,payment:'success',status:'paid',amount:1});
test('official sandbox order lookup uses invoice number and server-only Basic auth, with no redirects',async()=>{
 const verify=createPaymentVerifier({env,fetchImpl:async(url,init)=>{
  assert.equal(url,SANDBOX_API+code);assert.equal(init.method,'GET');assert.equal(init.redirect,'error');
  assert.equal(atob(init.headers.Authorization.slice(6)),values.SEPAY_SANDBOX_MERCHANT_ID+':'+values.SEPAY_SANDBOX_SECRET_KEY);
  return Response.json({data:data()});
 }});
 assert.deepEqual(await verify(invoice),{invoice_number:code,amount:10000,provider_order_id:oid,transaction_id:tid});
});
test('API validation rejects wrong invoice, amount, currency, IDs, method, failed or ambiguous payments',()=>{
 for(const mutate of [
  d=>d.order_invoice_number='OTHER',d=>d.order_amount='9999.00',d=>d.order_amount='10000.01',d=>d.order_currency='USD',d=>d.id='SEPAY-WRONG-ID',
  d=>d.transactions[0].transaction_amount='9999',d=>d.transactions[0].transaction_currency='USD',d=>d.transactions[0].id='invalid',
  d=>d.transactions[0].payment_method='CARD',d=>d.transactions[0].transaction_status='DECLINED',d=>d.transactions[0].transaction_type='REFUND',
  d=>d.transactions=[],d=>d.transactions.push({...d.transactions[0],id:'60000000-0000-4000-8000-000000000002'})
 ]){const d=data();mutate(d);assert.throws(()=>matchProviderPayment(d,invoice));}
 for(const state of ['CANCELLED','AUTHENTICATION_NOT_NEEDED','UNKNOWN']){const d=data();d.order_status=state;assert.equal(matchProviderPayment(d,invoice),null);}
 assert.throws(()=>matchProviderPayment(data(),invoice,{provider_order_id:oid,transaction_id:'60000000-0000-4000-8000-000000000002'}));
});
test('404 stays unconfirmed, while provider auth/rate/server/network errors are redacted and never accepted',async()=>{
 for(const httpStatus of [401,403,429,500,302]){
  const verify=createPaymentVerifier({env,fetchImpl:async()=>Response.json({secret:values.SEPAY_SANDBOX_SECRET_KEY},{status:httpStatus})});
  await assert.rejects(verify(invoice),error=>error.status===503&&!JSON.stringify(error).includes(values.SEPAY_SANDBOX_SECRET_KEY));
 }
 assert.equal(await createPaymentVerifier({env,fetchImpl:async()=>new Response(null,{status:404})})(invoice),null);
 for(const fetchImpl of [async()=>{throw new Error(values.SEPAY_SANDBOX_SECRET_KEY);},async()=>new Response('not json'),async()=>Response.json({data:[]})]){
  await assert.rejects(createPaymentVerifier({env,fetchImpl})(invoice),error=>!String(error).includes(values.SEPAY_SANDBOX_SECRET_KEY));
 }
});
test('API requests coalesce per invoice; cache expires and verification retries after failure',async()=>{
 let calls=0,time=0,fail=true;
 const verify=createPaymentVerifier({env,now:()=>time,fetchImpl:async()=>{calls++;if(fail)throw new Error('timeout');return Response.json({data:data()});}});
 await assert.rejects(verify(invoice));fail=false;
 await Promise.all([verify(invoice),verify(invoice)]);assert.equal(calls,2);
 time=5001;await verify(invoice);assert.equal(calls,3);
});
test('status recovers missed IPN via API, then rereads committed paid DB before returning verified=true',async()=>{
 let stored={...invoice},settlements=0,reads=0,apiCalls=0;
 const handler=createSandboxHandler({env,makeClient:()=>assert.fail(),fetchImpl:async(url,init)=>{
  if(url.startsWith(SANDBOX_API)){apiCalls++;return Response.json({data:data()});}
  const body=JSON.parse(init.body);
  if(url.endsWith('/read_sepay_sandbox_invoice')){reads++;return Response.json(stored);}
  assert.match(url,/settle_sepay_sandbox_invoice$/);assert.equal(body.p_amount,10000);stored={...stored,status:'paid'};settlements++;return Response.json({accepted:true});
 }});
 const response=await handler(status());assert.equal(response.status,200);const result=await response.json();
 assert.equal(result.status,'paid');assert.equal(result.payment_verified,true);assert.equal(settlements,1);assert.equal(reads,2);assert.equal(apiCalls,1);
 assert.ok(!JSON.stringify(result).includes(values.SEPAY_SANDBOX_SECRET_KEY));assert.equal(result.details,undefined);
});
test('provider success cannot show paid when DB settlement fails or committed row is not paid',async()=>{
 for(const accepted of [false,true]){
  const handler=createSandboxHandler({env,makeClient:()=>assert.fail(),fetchImpl:async(url)=>{
   if(url.startsWith(SANDBOX_API))return Response.json({data:data()});
   return Response.json(url.endsWith('/settle_sepay_sandbox_invoice')?{accepted}:invoice);
  }});
  const response=await handler(status());assert.equal(response.status,accepted?503:409);assert.notEqual((await response.json()).payment_verified,true);
 }
});
test('unknown capability never calls provider; legacy paid rows cannot bypass independent API confirmation',async()=>{
 let apiCalls=0;
 const missing=createSandboxHandler({env,makeClient:()=>assert.fail(),fetchImpl:async(url)=>{if(url.startsWith(SANDBOX_API))apiCalls++;return Response.json(null);}});
 assert.equal((await missing(status())).status,404);assert.equal(apiCalls,0);
 const legacy=createSandboxHandler({env,makeClient:()=>assert.fail(),fetchImpl:async(url)=>url.startsWith(SANDBOX_API)?new Response(null,{status:404}):Response.json({...invoice,status:'paid'})});
 assert.equal((await legacy(status())).status,503);
});
test('onboarding test without IPN key stays 401 and safe diagnostics distinguish missing versus wrong header',async()=>{
 const logs=[];let calls=0;
 const handler=createIpnHandler({env,report:e=>logs.push(e),fetchImpl:()=>{calls++;assert.fail();}});
 const body={...event(),notification_type:'PAYMENT_SUCCESS'};
 assert.equal((await handler(req(body))).status,401);
 assert.equal((await handler(req(body,{'X-Secret-Key':'wrong'}))).status,401);
 assert.equal(calls,0);assert.deepEqual(logs.map(e=>e.code),['ipn_secret_missing','ipn_secret_mismatch']);
 assert.ok(!JSON.stringify(logs).includes(ipn));
});
test('authenticated PAYMENT_SUCCESS is only accepted after independent API verification and DB settlement',async()=>{
 let calls=0;
 const handler=createIpnHandler({env,report:()=>{},fetchImpl:async(url)=>{
  calls++;return Response.json(url.startsWith(SANDBOX_API)?{data:data()}:{accepted:true});
 }});
 const body={...event(),notification_type:'PAYMENT_SUCCESS'};
 assert.equal((await handler(req(body,{'X-Secret-Key':ipn}))).status,200);assert.equal(calls,2);
 const rejected=createIpnHandler({env,report:()=>{},fetchImpl:async(url)=>{
  assert.ok(url.startsWith(SANDBOX_API));const d=data();d.transactions[0].id='60000000-0000-4000-8000-000000000002';return Response.json({data:d});
 }});
 assert.equal((await rejected(req(body,{'X-Secret-Key':ipn}))).status,409);
});

test('provider return accepts extra query fields solely as navigation and still requires backend verification',()=>{
 assert.equal(sandboxReturnId('#sepay-sandbox/'+id+'?result=success&order_id=untrusted&signature=untrusted'),id);
 assert.equal(sandboxReturnId('#sepay-sandbox/'+id+'?payment=success'),id);
 for(const hash of ['#catalog','#sepay-sandbox/../../secret','#sepay-sandbox/not-a-uuid?result=success'])assert.equal(sandboxReturnId(hash),null);
});
