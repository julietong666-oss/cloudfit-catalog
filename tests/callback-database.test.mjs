// Local PostgreSQL WASM only; no Supabase/Telegram calls are forwarded.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createCallbackHandler} from '../supabase/functions/consultation-callback/handler.mjs';
import {issueConsultationReceipt} from '../supabase/functions/_shared/consultation-receipt.mjs';
const {PGlite}=await import(process.env.PGLITE_MODULE||'@electric-sql/pglite');
const db=new PGlite();
try{
 await db.exec('create role anon;create role authenticated;create role service_role bypassrls;create table public.products(id text primary key);');
 const schema=await readFile(new URL('../supabase/telegram-schema.sql',import.meta.url),'utf8');
 await db.exec(schema.slice(schema.indexOf('create table public.purchase_requests'),schema.indexOf('create function telegram_private.dispatch')));
 const id='20000000-0000-4000-8000-000000000001',product='sample';
 await db.query('insert into public.products(id) values($1)',[product]);
 await db.query('insert into public.purchase_requests(id,product_id,product_name,contact_name,phone,is_test) values($1,$2,$3,$4,$5,true)',[id,product,'Gói mẫu','Khách giả lập','0000000000']);
 await db.exec('set role anon');await assert.rejects(db.exec('select * from public.purchase_requests'));await assert.rejects(db.exec('select * from public.telegram_deliveries'));await db.exec('reset role');
 await db.exec('set role service_role');
 const env={get:k=>({SUPABASE_URL:'https://local-db.example',SUPABASE_SERVICE_ROLE_KEY:'local-only-service-key',TELEGRAM_BOT_TOKEN:'654321:local_payment_only_bot',TELEGRAM_CALLBACK_BOT_TOKEN:'123456:local_callback_only_bot',TELEGRAM_CHAT_ID:'-10001',TELEGRAM_CALLBACK_CHAT_ID:'-10002'})[k]};
 let sends=0;
 const fetchImpl=async(url,init)=>{
  if(url.endsWith('/getMe'))return Response.json({ok:true,result:{id:123456,is_bot:true}});
  if(url.endsWith('/getChat'))return Response.json({ok:true,result:{id:-10002,title:'Recall',type:'group'}});
  if(url.endsWith('/getChatMember'))return Response.json({ok:true,result:{status:'member'}});
  if(url.startsWith('https://api.telegram.org/')){sends++;const payload=JSON.parse(init.body);assert.equal(payload.chat_id,'-10002');assert.match(payload.text,/Khách giả lập/);return Response.json({ok:true,result:{message_id:9}});}
  const parsed=new URL(url),p=init.body?JSON.parse(init.body):null;
  if(parsed.pathname.endsWith('/purchase_requests')){
   const r=await db.query('select id,product_id,product_name,contact_name,phone,created_at,is_test from public.purchase_requests where id=$1 and product_id=$2',[id,product]);return Response.json(r.rows);
  }
  assert.ok(parsed.pathname.endsWith('/telegram_deliveries'));
  if(init.method==='POST'){
   assert.equal(init.headers.Prefer,'resolution=ignore-duplicates,return=representation');
   const r=await db.query('insert into public.telegram_deliveries(request_id,token_hash,status,updated_at) values($1,$2,$3,$4) on conflict(request_id) do nothing returning request_id,status',[p.request_id,p.token_hash,p.status,p.updated_at]);return Response.json(r.rows);
  }
  if(init.method==='PATCH'){
   const r=await db.query('update public.telegram_deliveries set status=$1,code=$2,message_id=$3,updated_at=$4 where request_id=$5 and status=$6 returning request_id,status',[p.status,p.code,p.message_id,p.updated_at,id,parsed.searchParams.get('status').slice(3)]);return Response.json(r.rows);
  }
  const r=await db.query('select status,code,updated_at from public.telegram_deliveries where request_id=$1',[id]);return Response.json(r.rows);
 };
 const handler=createCallbackHandler({env,fetchImpl}),receipt=await issueConsultationReceipt(env,id,product);
 const request=()=>new Request('https://callback.example',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'contact_later',request_id:id,product_id:product,receipt})});
 const responses=await Promise.all([handler(request()),handler(request()),handler(request())]);
 assert.ok(responses.every(r=>[200,202].includes(r.status)));assert.equal(sends,1);
 assert.equal((await(await handler(request())).json()).status,'sent');assert.equal(sends,1);
 assert.equal((await db.query('select count(*)::int as count from public.telegram_deliveries')).rows[0].count,1);
 assert.equal((await db.query('select count(*)::int as count from public.purchase_requests')).rows[0].count,1);
 console.log('PASS local PostgreSQL: saved request retained, concurrent callback CAS sends once, replay sends zero, anon cannot read private data');
}finally{await db.close();}
