import {hashToken,UUID} from '../_shared/sepay-sandbox.mjs';
export function createPaymentNotifier({env,fetchImpl=fetch}) {
 return async req=>{
  const json=(body,status=200)=>Response.json(body,{status});
  if(req.method!=='POST')return json({error:'method_not_allowed'},405);
  const token=req.headers.get('x-delivery-token')||'';
  if(!/^[a-f0-9-]{72}$/i.test(token))return json({error:'unauthorized'},401);
  let id;
  try{const raw=await req.text();if(raw.length>512)throw 0;id=JSON.parse(raw).invoice_id;if(!UUID.test(id||''))throw 0;}catch{return json({error:'invalid_request'},400);}
  let key;try{key=JSON.parse(env.get('SUPABASE_SECRET_KEYS')||'{}').default;}catch{}
  key ||= env.get('SUPABASE_SERVICE_ROLE_KEY');const base=env.get('SUPABASE_URL');
  if(!key||!base)return json({error:'backend_configuration'},503);
  const headers={apikey:key,'Content-Type':'application/json',Prefer:'return=representation'};if(key.startsWith('eyJ'))headers.Authorization=`Bearer ${key}`;
  const db=async(path,method='GET',body)=>{
   const r=await fetchImpl(`${base}/rest/v1/${path}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(8000),redirect:'error'});
   if(!r.ok)throw new Error('db_failure');return r.json();
  };
  try {
   const claim=await db(`sandbox_payment_deliveries?invoice_id=eq.${id}&token_hash=eq.${await hashToken(token)}&status=eq.pending`,'PATCH',{status:'processing',updated_at:new Date().toISOString()});
   if(claim.length!==1)return json({error:'not_claimable'},409);
   const rows=await db(`sepay_sandbox_invoices?id=eq.${id}&status=eq.paid&environment=eq.sandbox&select=id,invoice_number,amount,currency,details`);
   let result={status:'failed',code:'paid_invoice_not_found'};
   if(rows.length===1)result=await sendSandboxPayment(rows[0],env,fetchImpl);
   const finish=await db(`sandbox_payment_deliveries?invoice_id=eq.${id}&status=eq.processing`,'PATCH',{status:result.status,code:result.code||null,message_id:result.messageId||null,updated_at:new Date().toISOString()});
   if(finish.length!==1)throw new Error('reconcile');
   return json({invoice_id:id,status:result.status});
  }catch{return json({error:'reconciliation_required'},503);}
 };
}
export async function sendSandboxPayment(invoice,env,fetchImpl=fetch) {
 const token=env.get('TELEGRAM_BOT_TOKEN'),chat=env.get('TELEGRAM_CHAT_ID');
 if(!token||!chat)return {status:'failed',code:'missing_configuration'};
 const field=v=>String(v||'').replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,200);
 const text=['THỬ NGHIỆM — SEPAY SANDBOX','Hoá đơn thanh toán thử nghiệm thành công',`Mã hoá đơn: ${field(invoice.invoice_number)}`,`Doanh nghiệp mẫu: ${field(invoice.details.company)}`,`Gói mẫu: ${field(invoice.details.packageName)}`,`Số tiền thử nghiệm: ${invoice.amount} VND`,'Không phát sinh tiền thật; không kích hoạt gói thật.'].join('\n');
 try {
  const response=await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chat,text,link_preview_options:{is_disabled:true}}),redirect:'error',signal:AbortSignal.timeout(10000)});
  const body=await response.json();
  if(response.ok&&body?.ok===true&&Number.isSafeInteger(body.result?.message_id)&&body.result.message_id>0)return {status:'sent',messageId:body.result.message_id};
  if(body?.ok===false&&Number.isInteger(body.error_code)&&body.error_code>=400&&body.error_code<500)return {status:'failed',code:`telegram_${body.error_code}`};
  return {status:'unknown',code:'unconfirmed_response'};
 }catch{return {status:'unknown',code:'unconfirmed_delivery'};}
}
