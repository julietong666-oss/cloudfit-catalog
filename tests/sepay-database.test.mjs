// Local Postgres WASM only. Never connect this suite to the real Supabase DB.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {createIpnHandler} from '../supabase/functions/sepay-sandbox-ipn/handler.mjs';
import {createSandboxHandler} from '../supabase/functions/sepay-sandbox/handler.mjs';
import {hashToken} from '../supabase/functions/_shared/sepay-sandbox.mjs';
const {PGlite}=await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const db=new PGlite();
try {
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema telegram_private;grant usage on schema telegram_private to service_role;
 create schema net;create table public.fake_dispatches(id serial);
 create function net.http_post(url text,headers jsonb,body jsonb,timeout_milliseconds integer) returns bigint language plpgsql as $$begin insert into public.fake_dispatches default values;return 1;end$$;
 create table public.purchase_requests(id uuid primary key);`);
 await db.exec(await readFile(new URL('../supabase/sepay-sandbox.sql',import.meta.url),'utf8'));
 const id='50000000-0000-4000-8000-000000000001',code='CFSBX'+id.replaceAll('-','').toUpperCase(),hash='a'.repeat(64),details=JSON.stringify({phone:'0000000000',company:'Mẫu'});
 const create=()=>db.query('select public.create_sepay_sandbox_invoice($1,$2,$3,$4,$5) as invoice',[id,hash,code,10000,details]);
 await create();await create();assert.equal((await db.query('select count(*)::int as count from public.sepay_sandbox_invoices')).rows[0].count,1);
 await assert.rejects(db.query('select public.create_sepay_sandbox_invoice($1,$2,$3,$4,$5)',[id,hash,code,1,details]));
 const inaccessible=await db.query('select public.read_sepay_sandbox_invoice($1,$2,false) as invoice',[id,'b'.repeat(64)]);assert.equal(inaccessible.rows[0].invoice,null);
 assert.equal((await db.query('select count(*)::int as count from public.fake_dispatches')).rows[0].count,0);
 const tx='60000000-0000-4000-8000-000000000001',provider='70000000-0000-4000-8000-000000000001';
 const settle=amount=>db.query('select public.settle_sepay_sandbox_invoice($1,$2,$3,$4) as result',[code,amount,tx,provider]);
 assert.equal((await settle(9999)).rows[0].result.accepted,false);
 assert.equal((await settle(10000)).rows[0].result.accepted,true);
 assert.equal((await settle(10000)).rows[0].result.accepted,true);
 assert.equal((await db.query('select count(*)::int as count from public.sandbox_payment_deliveries')).rows[0].count,1);
 assert.equal((await db.query('select count(*)::int as count from public.fake_dispatches')).rows[0].count,1);
 await db.query('select public.read_sepay_sandbox_invoice($1,$2,true)',[id,hash]);
 assert.equal((await db.query('select status from public.sepay_sandbox_invoices')).rows[0].status,'paid');
 await db.exec('set role anon');
 await assert.rejects(db.exec('select * from public.sepay_sandbox_invoices'));
 await assert.rejects(db.exec(`select public.read_sepay_sandbox_invoice('${id}','${hash}',false)`));
 await db.exec('reset role');
 const other='50000000-0000-4000-8000-000000000002',otherCode='CFSBX'+other.replaceAll('-','').toUpperCase();
 await db.query('select public.create_sepay_sandbox_invoice($1,$2,$3,$4,$5)',[other,hash,otherCode,10000,details]);
 await db.query('select public.read_sepay_sandbox_invoice($1,$2,true)',[other,hash]);
 const rejected=await db.query('select public.settle_sepay_sandbox_invoice($1,$2,$3,$4) as result',[otherCode,10000,'60000000-0000-4000-8000-000000000002',provider]);
 assert.equal(rejected.rows[0].result.accepted,false);
 assert.equal((await db.query('select count(*)::int as count from public.fake_dispatches')).rows[0].count,1);
 // Exercise the actual IPN HTTP handler against local Postgres settlement,
 // including safe rejection of provider test payloads that have no CloudFit invoice.
 const third='50000000-0000-4000-8000-000000000003',thirdCode='CFSBX'+third.replaceAll('-','').toUpperCase();
 const thirdTx='60000000-0000-4000-8000-000000000003';
 await db.query('select public.create_sepay_sandbox_invoice($1,$2,$3,$4,$5)',[third,hash,thirdCode,10000,details]);
 const ipnSecret='local-configured-ipn-key-for-tests';let settlements=0;
 const handler=createIpnHandler({env:{get:k=>({SEPAY_SANDBOX_MERCHANT_ID:'SP-TEST-LOCAL',SEPAY_SANDBOX_SECRET_KEY:'spsk_test_'+ 'a'.repeat(32),SEPAY_SANDBOX_IPN_SECRET:ipnSecret,SUPABASE_URL:'https://local-db.example',SUPABASE_SERVICE_ROLE_KEY:'local-server-key'})[k]},report:()=>{},fetchImpl:async(url,init)=>{
  if(url.startsWith('https://pgapi-sandbox.sepay.vn/'))return Response.json({data:{id:provider,order_invoice_number:thirdCode,order_status:'CAPTURED',order_currency:'VND',order_amount:'10000.00',transactions:[{id:thirdTx,payment_method:'BANK_TRANSFER',transaction_type:'PAYMENT',transaction_status:'APPROVED',transaction_currency:'VND',transaction_amount:10000}]}});
  assert.equal(url,'https://local-db.example/rest/v1/rpc/settle_sepay_sandbox_invoice');settlements++;
  const p=JSON.parse(init.body);
  try {
   const result=await db.query('select public.settle_sepay_sandbox_invoice($1,$2,$3,$4) as result',[p.p_invoice_number,p.p_amount,p.p_transaction_id,p.p_provider_order_id]);
   return Response.json(result.rows[0].result);
  }catch{return Response.json({error:'database_failure'},{status:500});}
 }});
 const paidEvent=(number=thirdCode,amount='10000.00')=>({notification_type:'ORDER_PAID',order:{id:provider,order_invoice_number:number,order_status:'CAPTURED',order_currency:'VND',order_amount:amount},transaction:{id:thirdTx,payment_method:'BANK_TRANSFER',transaction_type:'PAYMENT',transaction_status:'APPROVED',transaction_currency:'VND',transaction_amount:amount}});
 const send=(body,key=ipnSecret)=>handler(new Request('https://local.example/ipn',{method:'POST',headers:{'Content-Type':'application/json','X-Secret-Key':key},body:JSON.stringify(body)}));
 assert.equal((await send(paidEvent(),'wrong-key')).status,401);assert.equal(settlements,0);
 const declined=paidEvent();declined.transaction.transaction_status='DECLINED';
 assert.equal((await send(declined)).status,400);assert.equal(settlements,0);
 assert.equal((await send(paidEvent('PROVIDER_TEST_INVOICE'))).status,409);
 assert.equal((await send(paidEvent(thirdCode,'9999.00'))).status,409);
 assert.equal((await db.query('select status from public.sepay_sandbox_invoices where id=$1',[third])).rows[0].status,'pending');
 assert.equal((await db.query('select count(*)::int as count from public.fake_dispatches')).rows[0].count,1);
 const responses=await Promise.all([send(paidEvent()),send(paidEvent())]);
 assert.deepEqual(responses.map(r=>r.status),[200,200]);
 assert.equal((await db.query('select status from public.sepay_sandbox_invoices where id=$1',[third])).rows[0].status,'paid');
 assert.equal((await db.query('select count(*)::int as count from public.fake_dispatches')).rows[0].count,2);
 assert.equal((await db.query('select count(*)::int as count from public.sandbox_payment_deliveries')).rows[0].count,2);
 const changed=paidEvent();changed.transaction.id='60000000-0000-4000-8000-000000000004';
 assert.equal((await send(changed)).status,409);
 assert.equal((await db.query('select count(*)::int as count from public.fake_dispatches')).rows[0].count,2);
 // No-IPN recovery and simultaneous API/IPN confirmation share the same atomic SQL.
 const fourth='50000000-0000-4000-8000-000000000004',fourthCode='CFSBX'+fourth.replaceAll('-','').toUpperCase(),fourthTx='60000000-0000-4000-8000-000000000004',capability='c'.repeat(64);
 await db.query('select public.create_sepay_sandbox_invoice($1,$2,$3,$4,$5)',[fourth,await hashToken(capability),fourthCode,10000,JSON.stringify({phone:'0000000001',company:'Mẫu khôi phục API'})]);
 const localEnv={get:k=>({SEPAY_SANDBOX_MERCHANT_ID:'SP-TEST-LOCAL',SEPAY_SANDBOX_SECRET_KEY:'spsk_test_'+ 'a'.repeat(32),SEPAY_SANDBOX_IPN_SECRET:ipnSecret,SUPABASE_URL:'https://local-db.example',SUPABASE_SERVICE_ROLE_KEY:'local-server-key'})[k]};
 let providerPaid=false;
 const localFetch=async(url,init)=>{
  if(url.startsWith('https://pgapi-sandbox.sepay.vn/')){
   assert.equal(url,'https://pgapi-sandbox.sepay.vn/v1/order/detail/'+fourthCode);
   if(!providerPaid)return new Response(null,{status:404});
   return Response.json({data:{id:provider,order_invoice_number:fourthCode,order_status:'CAPTURED',order_currency:'VND',order_amount:'10000.00',transactions:[{id:fourthTx,payment_method:'BANK_TRANSFER',transaction_type:'PAYMENT',transaction_status:'APPROVED',transaction_currency:'VND',transaction_amount:10000}]}});
  }
  const p=JSON.parse(init.body);
  if(url.endsWith('/read_sepay_sandbox_invoice')){
   const r=await db.query('select public.read_sepay_sandbox_invoice($1,$2,$3) as result',[p.p_id,p.p_token_hash,p.p_cancel]);return Response.json(r.rows[0].result);
  }
  assert.ok(url.endsWith('/settle_sepay_sandbox_invoice'));
  const r=await db.query('select public.settle_sepay_sandbox_invoice($1,$2,$3,$4) as result',[p.p_invoice_number,p.p_amount,p.p_transaction_id,p.p_provider_order_id]);return Response.json(r.rows[0].result);
 };
 const makeStatus=()=>createSandboxHandler({env:localEnv,fetchImpl:localFetch,makeClient:()=>assert.fail()});
 const statusRequest=()=>new Request('https://local.example',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'status',invoice_id:fourth,access_token:capability,payment:'success',status:'paid'})});
 assert.equal((await(await makeStatus()(statusRequest())).json()).status,'pending');
 providerPaid=true;
 const statusHandler=makeStatus();
 const success=await statusHandler(statusRequest());assert.equal(success.status,200);assert.equal((await success.json()).payment_verified,true);
 assert.equal((await db.query('select count(*)::int as count from public.fake_dispatches')).rows[0].count,3);
 const fourthEvent=paidEvent(fourthCode);fourthEvent.transaction.id=fourthTx;
 const lateIpn=createIpnHandler({env:localEnv,fetchImpl:localFetch,report:()=>{}});
 const concurrent=await Promise.all([lateIpn(new Request('https://local.example/ipn',{method:'POST',headers:{'Content-Type':'application/json','X-Secret-Key':ipnSecret},body:JSON.stringify(fourthEvent)})),statusHandler(statusRequest())]);
 assert.deepEqual(concurrent.map(r=>r.status),[200,200]);
 assert.equal((await db.query('select count(*)::int as count from public.fake_dispatches')).rows[0].count,3);
 assert.equal((await db.query('select count(*)::int as count from public.sandbox_payment_deliveries')).rows[0].count,3);
 console.log('PASS API recovery without IPN + committed paid status + late/concurrent API/IPN do not duplicate notifications');
 console.log('PASS local PostgreSQL + actual IPN handler: success, declined payment, wrong key, wrong amount, duplicate callback, unknown invoice, capability checks, cancellation and anon permissions');
}finally{await db.close();}
