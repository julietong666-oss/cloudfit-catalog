import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../supabase/functions/telegram-notify/handler.mjs';
const id = '10000000-0000-4000-8000-000000000001';
const token = 'a'.repeat(72);
const row = { id, product_id:'sample', product_name:'Gói thử', contact_name:'Khách giả', phone:'0000000000', created_at:'2026-10-30T10:00:00Z', is_test:true };
const env = { get: name => ({ SUPABASE_URL:'https://db.example', SUPABASE_SERVICE_ROLE_KEY:'test-server-key', TELEGRAM_BOT_TOKEN:'test-token', TELEGRAM_CHAT_ID:'test-chat' })[name] };
const request = () => new Request('https://function.example', { method:'POST', headers:{ 'x-delivery-token':token }, body:JSON.stringify({ request_id:id }) });
const reply = (data, status = 200) => Response.json(data, { status });

test('unauthenticated or malformed invocations never access DB or Telegram', async () => {
  let calls = 0;
  const handler = createHandler({ env, fetchImpl:async()=>{ calls++; throw Error(); } });
  assert.equal((await handler(new Request('https://function.example',{method:'POST'}))).status,401);
  assert.equal((await handler(new Request('https://function.example'))).status,405);
  assert.equal((await handler(new Request('https://function.example',{method:'POST',headers:{'x-delivery-token':token},body:'{}'}))).status,400);
  assert.equal(calls,0);
});

test('atomic delivery claim prevents concurrent and replayed notifications', async () => {
  let claimed = false, telegramCalls = 0;
  const handler = createHandler({ env, fetchImpl:async(url,init)=>{
    if(url.includes('telegram_deliveries') && url.includes('status=eq.pending')) {
      assert.match(url,/token_hash=eq\.[a-f0-9]{64}/);
      if(claimed) return reply([]);
      claimed = true; return reply([{request_id:id}]);
    }
    if(url.includes('purchase_requests')) return reply([row]);
    if(url.includes('api.telegram.org')) { telegramCalls++; return reply({ok:true,result:{message_id:1}}); }
    return reply([{request_id:id}]);
  } });
  const responses = await Promise.all([handler(request()),handler(request())]);
  assert.deepEqual(responses.map(x=>x.status).sort(),[200,409]);
  assert.equal((await handler(request())).status,409);
  assert.equal(telegramCalls,1);
});

test('DB failure prevents Telegram and cannot claim request was saved', async () => {
  let telegramCalls = 0;
  const handler = createHandler({env,fetchImpl:async(url)=>{
    if(url.includes('api.telegram.org')) telegramCalls++;
    return reply({error:'private DB information'},500);
  }});
  assert.equal((await handler(request())).status,503);
  assert.equal(telegramCalls,0);
});

test('Telegram rejection persists failed state without modifying or deleting the purchase', async () => {
  const calls=[];
  const handler=createHandler({env,fetchImpl:async(url,init)=>{
    calls.push([url,init.method,init.body]);
    if(url.includes('purchase_requests')) return reply([row]);
    if(url.includes('api.telegram.org')) return reply({ok:false,error_code:403},403);
    return reply([{request_id:id}]);
  }});
  assert.equal((await (await handler(request())).json()).status,'failed');
  assert.equal(JSON.parse(calls.at(-1)[2]).code,'telegram_403');
  assert.equal(calls.filter(([url,method])=>url.includes('purchase_requests')&&method!=='GET').length,0);
});

test('ambiguous network outcome is persisted as unknown without retry', async () => {
  let telegramCalls=0, last;
  const handler=createHandler({env,fetchImpl:async(url,init)=>{
    if(url.includes('purchase_requests')) return reply([row]);
    if(url.includes('api.telegram.org')) { telegramCalls++; throw Error('sensitive URL'); }
    last=JSON.parse(init.body); return reply([{request_id:id}]);
  }});
  assert.equal((await (await handler(request())).json()).status,'unknown');
  assert.equal(last.status,'unknown');
  assert.equal(telegramCalls,1);
});

test('failure to persist sent state requires reconciliation and never sends again',async()=>{
  let telegramCalls=0;
  const handler=createHandler({env,fetchImpl:async(url)=>{
    if(url.includes('status=eq.pending')) return reply([{request_id:id}]);
    if(url.includes('purchase_requests')) return reply([row]);
    if(url.includes('api.telegram.org')) { telegramCalls++; return reply({ok:true,result:{message_id:1}}); }
    return reply({},500);
  }});
  const response=await handler(request());
  assert.equal(response.status,503);
  assert.deepEqual(await response.json(),{error:'reconciliation_required'});
  assert.equal(telegramCalls,1);
});
