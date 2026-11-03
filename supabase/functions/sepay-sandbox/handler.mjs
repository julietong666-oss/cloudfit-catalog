import {createPaymentVerifier,settleVerifiedPayment,PaymentVerificationError} from '../_shared/sepay-verification.mjs';
import { UUID,TOKEN,hashToken,sandboxConfig,SandboxConfigError,invoiceCode,normalizeInvoice,signedCheckout,createDb } from '../_shared/sepay-sandbox.mjs';
const origins=new Set(['https://cloudfitk.vercel.app','http://127.0.0.1:4173','http://localhost:4173']);
export function createSandboxHandler({env,makeClient,fetchImpl=fetch}) {
 const verify=createPaymentVerifier({env,fetchImpl});
 return async req=>{
  const origin=req.headers.get('origin');const headers={'Content-Type':'application/json','Cache-Control':'no-store',Vary:'Origin'};
  if(origins.has(origin))headers['Access-Control-Allow-Origin']=origin;
  const json=(data,status=200)=>Response.json(data,{status,headers});
  if(origin&&!origins.has(origin))return json({error:'origin_not_allowed'},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'content-type, apikey'}});
  if(req.method!=='POST')return json({error:'method_not_allowed'},405);
  let data;
  try{if(!req.headers.get('content-type')?.includes('application/json'))throw 0;const text=await req.text();if(text.length>8192)throw 0;data=JSON.parse(text);}catch{return json({error:'invalid_request'},400);}
  if(!UUID.test(data?.invoice_id||'')||!TOKEN.test(data?.access_token||'')||!['checkout','status','cancel'].includes(data?.action))return json({error:'invalid_request'},400);
  let normalized;
  if(data.action==='checkout') {
   try{if(data.acknowledge_sandbox!==true)throw 0;normalized=normalizeInvoice(data.invoice);}catch{return json({error:'invalid_invoice'},400);}
  }
  try {
   let config;
   if(data.action==='checkout') {config=sandboxConfig(env);}
   const db=createDb(env,fetchImpl);const hash=await hashToken(data.access_token);
   let invoice;
   if(data.action==='checkout')invoice=await db('create_sepay_sandbox_invoice',{p_id:data.invoice_id,p_token_hash:hash,p_invoice_number:invoiceCode(data.invoice_id),p_amount:normalized.amount,p_details:normalized.details});
   else invoice=await db('read_sepay_sandbox_invoice',{p_id:data.invoice_id,p_token_hash:hash,p_cancel:data.action==='cancel'});
   if(!invoice)return json({error:'invoice_unavailable'},404);
   if(data.action==='checkout') {
    if(invoice.status!=='pending')return json({error:'invoice_not_pending'},409);
    return json(signedCheckout(makeClient(config),invoice));
   }
   let verified=false;
   if(data.action==='status'&&['pending','paid'].includes(invoice.status)) {
    const payment=await verify(invoice);
    if(payment){
     const settled=await settleVerifiedPayment(db,payment);
     if(settled?.accepted!==true)return json({error:'payment_not_matched'},409);
     // A provider response alone cannot show success: reread the committed DB row.
     invoice=await db('read_sepay_sandbox_invoice',{p_id:data.invoice_id,p_token_hash:hash,p_cancel:false});
     if(!invoice||invoice.status!=='paid')return json({error:'payment_not_committed'},503);
     verified=true;
    }else if(invoice.status==='paid')return json({error:'provider_payment_unconfirmed'},503);
   }
   return json({invoice_id:invoice.id,invoice_number:invoice.invoice_number,amount:Number(invoice.amount),status:invoice.status,payment_verified:verified,environment:'sandbox'});
  }catch(error){
   if(error instanceof PaymentVerificationError)return json({error:error.code},error.status);
   if(error instanceof SandboxConfigError)return json({error:error.code,configuration:error.variables},503);
   return json({error:'temporarily_unavailable'},503);
  }
 };
}
