import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizePurchase } from '../supabase/functions/_shared/gemini.mjs';
import { createHandler } from '../supabase/functions/telegram-notify/handler.mjs';
const productName = 'Gói thử';
const good = { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ summary: 'Có yêu cầu đăng ký mua Gói thử.' }) }] } }] };

test('Gemini receives only product metadata and a header key, never customer information', async () => {
  const result = await summarizePurchase({ productName, apiKey:'test-only', contact_name:'private', phone:'private', fetchImpl:async(url,init)=>{
    assert.ok(!url.includes('test-only'));
    assert.equal(init.headers['x-goog-api-key'],'test-only');
    const body=JSON.parse(init.body);
    assert.deepEqual(JSON.parse(body.contents[0].parts[0].text),{product_name:productName});
    assert.ok(!init.body.includes('private'));
    assert.equal(init.signal instanceof AbortSignal,true);
    return Response.json(good);
  }});
  assert.equal(result.status,'generated');
});

test('missing key falls back without a network request',async()=>{
  assert.equal((await summarizePurchase({productName,fetchImpl:()=>assert.fail('must not fetch')})).code,'missing_configuration');
});

test('Gemini failure, malformed output, safety block and unsafe summaries fall back',async()=>{
  for(const response of [
    new Response('private remote error',{status:429}),
    new Response('not JSON'),
    Response.json({candidates:[{finishReason:'SAFETY'}]}),
    ...['Đã thanh toán Gói thử.','Đăng ký Gói thử https://example.com','Đăng ký Gói khác','Gói thử 0901234567'].map(summary=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({summary})}]}}]})),
  ]) {
    const result=await summarizePurchase({productName,apiKey:'test-only',fetchImpl:async()=>response});
    assert.equal(result.status,'fallback'); assert.equal(result.text,null);
  }
  assert.equal((await summarizePurchase({productName,apiKey:'test-only',fetchImpl:async()=>{throw new Error('private key');}})).status,'fallback');
});

test('a provider timeout cannot block fallback',async()=>{
  const result=await summarizePurchase({productName,apiKey:'test-only',timeoutMs:5,fetchImpl:async(_url,{signal})=>{
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(resolve,100);
      signal.addEventListener('abort',()=>{clearTimeout(timer);reject(signal.reason);},{once:true});
    });
    assert.fail('must abort');
  }});
  assert.equal(result.status,'fallback');
});

test('handler sends exactly one Telegram with AI text or the original fallback',async()=>{
  for(const aiOk of [true,false]) {
    let telegramCount=0,aiCount=0;
    const env={get:name=>({SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'server-test',GEMINI_API_KEY:'gemini-test',TELEGRAM_BOT_TOKEN:'bot-test',TELEGRAM_CHAT_ID:'chat-test'})[name]};
    const handler=createHandler({env,fetchImpl:async(url,init)=>{
      if(url.includes('generativelanguage.googleapis.com')) {aiCount++;return aiOk?Response.json(good):new Response('',{status:503});}
      if(url.includes('api.telegram.org')) {
        telegramCount++;
        const payload=JSON.parse(init.body);
        assert.equal(payload.text.includes('Tóm tắt AI (tham khảo)'),aiOk);
        assert.ok(payload.text.includes('0000000000'));
        return Response.json({ok:true,result:{message_id:1}});
      }
      if(url.includes('purchase_requests'))return Response.json([{id:'10000000-0000-4000-8000-000000000001',product_id:'sample',product_name:productName,contact_name:'Khách giả',phone:'0000000000',created_at:'2026-10-30T10:00:00Z',is_test:true}]);
      return Response.json([{request_id:'10000000-0000-4000-8000-000000000001'}]);
    }});
    const response=await handler(new Request('https://function.example',{method:'POST',headers:{'x-delivery-token':'a'.repeat(72)},body:JSON.stringify({request_id:'10000000-0000-4000-8000-000000000001'})}));
    const result=await response.json();
    assert.equal(result.status,'sent');
    assert.equal(result.summary_status,aiOk?'generated':'fallback');
    assert.equal(aiCount,1);assert.equal(telegramCount,1);
  }
});
