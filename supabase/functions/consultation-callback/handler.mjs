import {createCallbackDestinationVerifier,CallbackConfigurationError} from '../_shared/callback-destination.mjs';
import {serviceKey,verifyConsultationReceipt,receiptHash} from '../_shared/consultation-receipt.mjs';
import {sendPurchaseNotification} from '../_shared/telegram.mjs';
const origins=new Set(['https://cloudfitk.vercel.app','http://127.0.0.1:4173','http://localhost:4173']);
export function createCallbackHandler({env,fetchImpl=fetch,now=Date.now}){
 const verifyDestination=createCallbackDestinationVerifier({env,fetchImpl,now});
 return async req=>{
  const origin=req.headers.get('origin'),headers={'Cache-Control':'no-store',Vary:'Origin'};
  if(origins.has(origin))headers['Access-Control-Allow-Origin']=origin;
  const json=(body,status=200)=>Response.json(body,{status,headers});
  if(origin&&!origins.has(origin))return json({error:'origin_not_allowed'},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'content-type, apikey'}});
  if(req.method==='GET'){
   try{await verifyDestination();return json({status:'ready',callback_bot_verified:true,callback_group_verified:true});}
   catch(error){return json({error:error instanceof CallbackConfigurationError?error.code:'callback_verification_unavailable'},503);}
  }
  if(req.method!=='POST')return json({error:'method_not_allowed'},405);
  let data;
  try{if(!req.headers.get('content-type')?.includes('application/json'))throw 0;const raw=await req.text();if(raw.length>1024)throw 0;data=JSON.parse(raw);}catch{return json({error:'invalid_request'},400);}
  if(!['contact_later','status'].includes(data?.action))return json({error:'invalid_request'},400);
  let authenticated=false;
  try{authenticated=await verifyConsultationReceipt(env,data.request_id,data.product_id,data.receipt,now());}catch{return json({error:'backend_configuration'},503);}
  if(!authenticated)return json({error:'unauthorized'},401);
  let destination,bot;
  if(data.action==='contact_later'){
   try{const config=await verifyDestination();destination=config.chatId;bot=config.token;}
   catch(error){return json({error:error instanceof CallbackConfigurationError?error.code:'callback_verification_unavailable'},503);}
  }
  const base=env.get('SUPABASE_URL'),key=serviceKey(env);
  if(!base||!key)return json({error:'backend_configuration'},503);
  const dbHeaders={apikey:key,'Content-Type':'application/json',Prefer:'return=representation'};
  if(key.startsWith('eyJ'))dbHeaders.Authorization=`Bearer ${key}`;
  const db=async(path,method='GET',body,prefer)=>{
   const response=await fetchImpl(`${base}/rest/v1/${path}`,{method,headers:{...dbHeaders,...(prefer?{Prefer:prefer}:{})},body:body===undefined?undefined:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw new Error('database_error');return response.json();
  };
  const id=data.request_id;
  try{
   const rows=await db(`purchase_requests?id=eq.${id}&product_id=eq.${data.product_id}&select=id,product_id,product_name,contact_name,phone,created_at,is_test`);
   if(rows.length!==1)return json({error:'request_unavailable'},404);
   if(data.action==='status'){
    const deliveries=await db(`telegram_deliveries?request_id=eq.${id}&select=status`);
    return json({request_id:id,status:deliveries.length===1?deliveries[0].status:'not_requested'});
   }
   let claims=await db('telegram_deliveries?on_conflict=request_id','POST',{request_id:id,token_hash:await receiptHash(data.receipt),status:'processing',updated_at:new Date(now()).toISOString()},'resolution=ignore-duplicates,return=representation');
   if(claims.length!==1){
    const prior=await db(`telegram_deliveries?request_id=eq.${id}&select=status,code,updated_at`);
    if(prior.length!==1)throw new Error('database_error');
    if(prior[0].status==='sent')return json({request_id:id,status:'sent',already_notified:true});
    // Only explicit Telegram 4xx rejection is safe to retry, and only on a new user click.
    if(prior[0].status==='failed'&&/^telegram_(?:4\d\d|chat_not_found|bot_blocked)$/.test(prior[0].code||'')){
     const cutoff=new Date(now()-60000).toISOString();
     if(!Number.isFinite(Date.parse(prior[0].updated_at))||Date.parse(prior[0].updated_at)>now()-60000)return json({error:'callback_rate_limited'},429);
     claims=await db(`telegram_deliveries?request_id=eq.${id}&status=eq.failed&code=eq.${prior[0].code}&updated_at=lte.${encodeURIComponent(cutoff)}`,'PATCH',{status:'processing',code:null,updated_at:new Date(now()).toISOString()});
     if(claims.length!==1)return json({request_id:id,status:'processing'},202);
    }else return json({request_id:id,status:prior[0].status==='unknown'?'unknown':'processing'},202);
   }
   const result=await sendPurchaseNotification({record:rows[0],botToken:bot,chatId:destination,purpose:'callback',fetchImpl});
   const finish=await db(`telegram_deliveries?request_id=eq.${id}&status=eq.processing`,'PATCH',{status:result.status,code:result.code||null,message_id:result.messageId||null,updated_at:new Date(now()).toISOString()});
   if(finish.length!==1)throw new Error('database_error');
   return json({request_id:id,status:result.status,code:result.code||null});
  }catch{return json({error:'reconciliation_required'},503);}
 };
}
