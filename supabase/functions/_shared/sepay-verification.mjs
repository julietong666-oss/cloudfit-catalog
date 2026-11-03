import {sandboxConfig,UUID} from './sepay-sandbox.mjs';
export const SANDBOX_API='https://pgapi-sandbox.sepay.vn/v1/order/detail/';
export class PaymentVerificationError extends Error {
 constructor(code,status=503){super(code);this.code=code;this.status=status;}
}
const mismatch=()=>{throw new PaymentVerificationError('payment_not_matched',409);};
function money(value){
 const text=String(value);
 if(!/^\d+(?:\.0{1,2})?$/.test(text)||!Number.isSafeInteger(Number(text))||Number(text)<1)mismatch();
 return Number(text);
}
export function matchProviderPayment(data,invoice,expected){
 if(!data||typeof data!=='object'||Array.isArray(data))throw new PaymentVerificationError('provider_invalid_response');
 if(data.order_invoice_number!==invoice.invoice_number||data.order_currency!=='VND'||money(data.order_amount)!==Number(invoice.amount)||!UUID.test(data.id||''))mismatch();
 if(data.order_status!=='CAPTURED')return null;
 if(!Array.isArray(data.transactions))throw new PaymentVerificationError('provider_payment_unconfirmed');
 if(data.transactions.some(t=>t?.transaction_status==='APPROVED'&&['REFUND','VOID'].includes(t.transaction_type)))throw new PaymentVerificationError('provider_payment_unconfirmed');
 const matches=data.transactions.filter(t=>t?.transaction_status==='APPROVED'&&t.transaction_type==='PAYMENT'&&t.payment_method==='BANK_TRANSFER'&&t.transaction_currency==='VND'&&UUID.test(t.id||'')&&String(t.transaction_amount).match(/^\d+(?:\.0{1,2})?$/)&&Number(t.transaction_amount)===Number(invoice.amount));
 if(matches.length!==1)throw new PaymentVerificationError('provider_payment_unconfirmed');
 const payment={invoice_number:data.order_invoice_number,amount:money(data.order_amount),provider_order_id:data.id.toLowerCase(),transaction_id:matches[0].id.toLowerCase()};
 if(expected&&(payment.provider_order_id!==expected.provider_order_id.toLowerCase()||payment.transaction_id!==expected.transaction_id.toLowerCase()))mismatch();
 return payment;
}
// Cache/coalescing is per worker, bounded and short-lived; DB settlement remains atomic.
// No credentials, provider customer details or raw provider responses are logged/returned.
export function createPaymentVerifier({env,fetchImpl=fetch,now=Date.now}){
 const cache=new Map();
 return async(invoice,expected)=>{
  const config=sandboxConfig(env);
  if(!/^CFSBX[A-F0-9]{32}$/.test(invoice.invoice_number||''))mismatch();
  const key=invoice.invoice_number;
  let entry=cache.get(key);
  if(!entry||entry.until<=now()){
   if(cache.size>=100)cache.delete(cache.keys().next().value);
   const pending=(async()=>{
    try{
     const response=await fetchImpl(SANDBOX_API+encodeURIComponent(key),{method:'GET',headers:{Authorization:'Basic '+btoa(config.merchant_id+':'+config.secret_key),Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(6000)});
     if(response.status===404)return null;
     if(!response.ok)throw new PaymentVerificationError(response.status===401||response.status===403?'provider_authentication_failed':response.status===429?'provider_rate_limited':'provider_unavailable');
     const raw=await response.text();
     if(raw.length>262144)throw new PaymentVerificationError('provider_invalid_response');
     return JSON.parse(raw)?.data??null;
    }catch(error){if(error instanceof PaymentVerificationError)throw error;throw new PaymentVerificationError('provider_unavailable');}
   })();
   entry={pending,until:now()+5000};cache.set(key,entry);
   pending.catch(()=>{if(cache.get(key)===entry)cache.delete(key);});
  }
  const data=await entry.pending;
  return data===null?null:matchProviderPayment(data,invoice,expected);
 };
}
export async function settleVerifiedPayment(db,payment){
 return db('settle_sepay_sandbox_invoice',{p_invoice_number:payment.invoice_number,p_amount:payment.amount,p_transaction_id:payment.transaction_id,p_provider_order_id:payment.provider_order_id});
}
