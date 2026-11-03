import {issueConsultationReceipt} from '../_shared/consultation-receipt.mjs';
const allowed = new Set(['https://cloudfitk.vercel.app','http://127.0.0.1:4173','http://localhost:4173']);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function createIntakeHandler({env,fetchImpl=fetch}) {
 return async req=>{
  const origin=req.headers.get('origin');
  const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
  if(allowed.has(origin))headers['Access-Control-Allow-Origin']=origin;
  const result=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(origin && !allowed.has(origin))return result({error:'origin_not_allowed'},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'content-type, apikey','Access-Control-Max-Age':'600'}});
  if(req.method!=='POST')return result({error:'method_not_allowed'},405);
  let data;
  try {
   if(!req.headers.get('content-type')?.includes('application/json'))return result({error:'invalid_request'},400);
   const raw=await req.text();if(raw.length>2048)return result({error:'invalid_request'},400);data=JSON.parse(raw);
  }catch{return result({error:'invalid_request'},400);}
  const name=typeof data?.contact_name==='string'?data.contact_name.trim():'';
  const phone=typeof data?.phone==='string'?data.phone.replace(/[ ()-]/g,''):'';
  if(!uuid.test(data?.request_id||'') || typeof data?.product_id!=='string' || !/^[a-z0-9-]{1,128}$/.test(data.product_id)
   || !name || name.length>120 || /[\u0000-\u001f\u007f]/.test(name) || !/^\+?[0-9]{8,15}$/.test(phone)
   || data?.consent!==true || data?.website)return result({error:'invalid_request'},400);
  let key;try{key=JSON.parse(env.get('SUPABASE_SECRET_KEYS')||'{}').default;}catch{}
  key ||= env.get('SUPABASE_SERVICE_ROLE_KEY');const base=env.get('SUPABASE_URL');
  if(!key||!base)return result({error:'temporarily_unavailable'},503);
  const dbHeaders={'Content-Type':'application/json',apikey:key};if(key.startsWith('eyJ'))dbHeaders.Authorization=`Bearer ${key}`;
  try{
   const response=await fetchImpl(`${base}/rest/v1/rpc/submit_purchase_request`,{method:'POST',headers:dbHeaders,redirect:'error',signal:AbortSignal.timeout(10000),body:JSON.stringify({p_id:data.request_id,p_product_id:data.product_id,p_contact_name:name,p_phone:phone,p_is_test:data.test_mode===true})});
   if(!response.ok){
    const error=await response.json();
    const codes={rate_limited:429,request_conflict:409,product_unavailable:400,invalid_request:400};
    if(Object.hasOwn(codes,error?.message))return result({error:error.message},codes[error.message]);
    return result({error:'temporarily_unavailable'},503);
   }
   const id=await response.json();if(id!==data.request_id)return result({error:'temporarily_unavailable'},503);
   let callbackReceipt;try{callbackReceipt=await issueConsultationReceipt(env,id,data.product_id);}catch{}
   return result({saved:true,request_id:id,...(callbackReceipt?{callback_receipt:callbackReceipt}:{})},201);
  }catch{return result({error:'temporarily_unavailable'},503);}
 };
}
