import {createPaymentVerifier,settleVerifiedPayment,PaymentVerificationError} from '../_shared/sepay-verification.mjs';
import { secretMatches,parsePaidIpn,createDb,sandboxIpnSecret,SandboxConfigError } from '../_shared/sepay-sandbox.mjs';
const reportFailure=entry=>console.warn(JSON.stringify(entry));
export function createIpnHandler({env,fetchImpl=fetch,report=reportFailure}) {
 const verify=createPaymentVerifier({env,fetchImpl});
 return async req=>{
  const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
  // Diagnostics contain only allowlisted codes/stages, never exception messages,
  // header values, payloads, merchant credentials or database responses.
  const unavailable=(code,stage,configuration)=>{
   report({component:'sepay-sandbox-ipn',code,stage});
   return json({error:code,...(configuration?{configuration}: {})},503);
  };
  if(req.method!=='POST')return json({error:'method_not_allowed'},405);
  let secret;
  try {secret=sandboxIpnSecret(env);}catch(error){
   if(error instanceof SandboxConfigError)return unavailable(error.code,'configuration',error.variables);
   return unavailable('internal_error','configuration');
  }
  // HTTP header names are case-insensitive; Headers.get handles X-Secret-Key.
  const supplied=req.headers.get('x-secret-key');
  if(!await secretMatches(supplied,secret)){
   report({component:'sepay-sandbox-ipn',code:supplied?'ipn_secret_mismatch':'ipn_secret_missing',stage:'authentication'});
   return json({error:'unauthorized'},401);
  }
  let payment;
  try {
   if(!req.headers.get('content-type')?.includes('application/json'))throw 0;
   const raw=await req.text();if(raw.length>32768)throw 0;
   payment=parsePaidIpn(JSON.parse(raw));
  }catch{return json({error:'invalid_payment'},400);}
  if(!payment)return json({success:true,ignored:true});
  try {
   const db=createDb(env,fetchImpl);
   const confirmed=await verify({invoice_number:payment.invoice_number,amount:payment.amount},payment);
   if(!confirmed)return unavailable('provider_payment_unconfirmed','verification');
   const result=await settleVerifiedPayment(db,confirmed);
   if(result?.accepted!==true)return json({error:'payment_not_matched'},409);
   return json({success:true,environment:'sandbox'});
  }catch(error){
   if(error instanceof SandboxConfigError)return unavailable(error.code,'configuration',error.variables);
   if(error instanceof PaymentVerificationError){
    if(error.status===409)return json({error:error.code},409);
    return unavailable(error.code,'verification');
   }
   if(error?.message==='backend_configuration')return unavailable('backend_configuration','database_configuration');
   if(error?.message==='database_error')return unavailable('database_error','settlement');
   return unavailable('temporarily_unavailable','settlement');
  }
 };
}
