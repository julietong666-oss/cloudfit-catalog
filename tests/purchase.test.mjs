import test from 'node:test';
import assert from 'node:assert/strict';
import { createIntakeHandler } from '../supabase/functions/purchase-request/handler.mjs';
import { submitPurchase } from '../catalog/purchase.mjs';
const id='20000000-0000-4000-8000-000000000001';
const input={request_id:id,product_id:'startup-foundation',contact_name:'Khách giả',phone:'0000000000',consent:true};
const env={get:n=>({SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'test-server'})[n]};
const request=data=>new Request('https://function.example',{method:'POST',headers:{Origin:'https://cloudfitk.vercel.app','Content-Type':'application/json'},body:JSON.stringify(data)});

test('intake validates consent and fields before any privileged DB request',async()=>{
 const h=createIntakeHandler({env,fetchImpl:()=>assert.fail('must not access DB')});
 for(const data of [{...input,consent:false},{...input,phone:'abc'},{...input,request_id:'bad'},{...input,contact_name:''},{...input,website:'spam'}])assert.equal((await h(request(data))).status,400);
});
test('intake only returns saved after DB confirms the same request ID; never trusts client package name',async()=>{
 const h=createIntakeHandler({env,fetchImpl:async(url,init)=>{
  const body=JSON.parse(init.body);assert.equal(body.p_id,id);assert.equal(body.p_phone,'0000000000');assert.equal(body.product_name,undefined);assert.equal(init.headers.apikey,'test-server');return Response.json(id);
 }});
 const r=await h(request({...input,product_name:'untrusted'}));assert.equal(r.status,201);assert.deepEqual(await r.json(),{saved:true,request_id:id});assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://cloudfitk.vercel.app');
});
test('intake rejects other origins and responds to CORS preflight without DB access',async()=>{
 const h=createIntakeHandler({env,fetchImpl:()=>assert.fail()});
 assert.equal((await h(new Request('https://function.example',{method:'OPTIONS',headers:{Origin:'https://cloudfitk.vercel.app'}}))).status,204);
 assert.equal((await h(new Request('https://function.example',{method:'POST',headers:{Origin:'https://other.example'}}))).status,403);
});
test('DB failure cannot return a saved message; errors and rate limits are redacted',async()=>{
 for(const [error,status] of [[{message:'private internal detail'},503],[{message:'rate_limited'},429],[{message:'request_conflict'},409]]){
  const h=createIntakeHandler({env,fetchImpl:async()=>Response.json(error,{status:400})});const r=await h(request(input));assert.equal(r.status,status);assert.equal((await r.json()).saved,undefined);
 }
});
test('frontend verifies saved response and retains the same ID for network retries',async()=>{
 const ids=[];
 const send=async(_url,init)=>{ids.push(JSON.parse(init.body).request_id);return Response.json({saved:true,request_id:id},{status:201});};
 assert.equal((await submitPurchase(input,send)).saved,true);assert.equal((await submitPurchase(input,send)).saved,true);assert.deepEqual(ids,[id,id]);
 await assert.rejects(submitPurchase(input,async()=>Response.json({saved:true,request_id:'wrong'})));
 await assert.rejects(submitPurchase(input,async()=>{throw new TypeError('private network');}),/Kiểm tra mạng/);
});

test('current intake requires a real package ID before accessing DB (general consultation remains blocked)',async()=>{
 const h=createIntakeHandler({env,fetchImpl:()=>assert.fail('must not access DB')});
 for(const product_id of [undefined,null,'']) {
  const response=await h(request({...input,product_id}));
  assert.equal(response.status,400);
  assert.deepEqual(await response.json(),{error:'invalid_request'});
 }
});

import {consultationReceipt,readConsultationReceipt} from '../catalog/purchase.mjs';
test('saved receipt retains only request/package metadata and rejects corrupt or cross-package sessions',()=>{
 const context={requestId:id,productId:'sample',productName:'Gói mẫu',contactName:'Tên riêng',phone:'0000000000',answers:{private:'không lưu'}};
 const receipt=consultationReceipt(context);
 assert.deepEqual(Object.keys(receipt).sort(),['productId','productName','requestId','state','version']);
 assert.equal(receipt.state,'saved');
 const product={id:'sample',name:'Gói mẫu'};
 assert.deepEqual(readConsultationReceipt(JSON.stringify(receipt),product),receipt);
 assert.equal(readConsultationReceipt(id,product).state,'pending');
 for(const raw of ['broken',JSON.stringify({...receipt,state:'invalid'}),JSON.stringify({...receipt,requestId:'bad'}),JSON.stringify({...receipt,productId:'other'})])assert.equal(readConsultationReceipt(raw,product),null);
 assert.equal(consultationReceipt({...context,requestId:'bad'}),null);
});
