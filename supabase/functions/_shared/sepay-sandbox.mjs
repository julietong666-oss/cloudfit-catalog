export const SANDBOX_CHECKOUT = 'https://pay-sandbox.sepay.vn/v1/checkout/init';
export const PUBLIC_ORIGIN = 'https://cloudfitk.vercel.app';
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const TOKEN = /^[0-9a-f]{64}$/i;
export async function hashToken(value) {
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
 return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function secretMatches(a,b) {
 if(typeof a!=='string'||typeof b!=='string'||!a||!b)return false;
 const [left,right]=await Promise.all([hashToken(a),hashToken(b)]);
 let mismatch=0;for(let i=0;i<left.length;i++)mismatch|=left.charCodeAt(i)^right.charCodeAt(i);
 return mismatch===0;
}
export class SandboxConfigError extends Error {
 constructor(code, variables) { super(code); this.code=code; this.variables=variables; }
}
export function sandboxIpnSecret(env) {
 const secret=env.get('SEPAY_SANDBOX_IPN_SECRET');
 if(typeof secret!=='string'||!secret)throw new SandboxConfigError('ipn_not_configured',['SEPAY_SANDBOX_IPN_SECRET']);
 // SePay lets the merchant choose this independent IPN key; it has no SDK prefix.
 // Match the configured value exactly, never fall back to the checkout key.
 if(secret.trim()!==secret||/[\u0000-\u001f\u007f]/.test(secret))throw new SandboxConfigError('ipn_invalid_configuration',['SEPAY_SANDBOX_IPN_SECRET']);
 return secret;
}
export function sandboxConfig(env) {
 const merchant=env.get('SEPAY_SANDBOX_MERCHANT_ID'),secret=env.get('SEPAY_SANDBOX_SECRET_KEY');
 const missing=[];
 if(!merchant)missing.push('SEPAY_SANDBOX_MERCHANT_ID');
 if(!secret)missing.push('SEPAY_SANDBOX_SECRET_KEY');
 if(missing.length)throw new SandboxConfigError('sandbox_not_configured',missing);
 if(!/^SP-TEST-[A-Za-z0-9-]+$/.test(merchant)||!/^spsk_test_[A-Za-z0-9_-]{16,}$/.test(secret)||/^SP-TEST-X+$/i.test(merchant)||/^spsk_test_x+$/i.test(secret))throw new SandboxConfigError('sandbox_not_configured',['SEPAY_SANDBOX_MERCHANT_ID','SEPAY_SANDBOX_SECRET_KEY']);
 return {env:'sandbox',merchant_id:merchant,secret_key:secret};
}
export function invoiceCode(id) {if(!UUID.test(id))throw new Error('invalid_request');return `CFSBX${id.replaceAll('-','').toUpperCase()}`;}
export function normalizeInvoice(data) {
 const text=(key,max=200)=>{const s=typeof data?.[key]==='string'?data[key].trim():'';if(!s||s.length>max||/[\u0000-\u001f\u007f]/.test(s))throw new Error('invalid_invoice');return s;};
 const int=(key,max)=>{const s=String(data?.[key]);if(!/^\d+$/.test(s)||!Number.isSafeInteger(Number(s))||Number(s)<1||Number(s)>max)throw new Error('invalid_invoice');return Number(s);};
 const details={company:text('company'),taxId:text('taxId',14),address:text('address',500),contact:text('contact',120),phone:text('phone',24).replace(/[ ()-]/g,''),email:text('email',254),packageName:text('packageName'),users:int('users',100000000),months:int('months',120)};
 if(!/^\d{10}(?:-?\d{3})?$/.test(details.taxId)||!/^\+?\d{8,15}$/.test(details.phone)||!/^\S+@\S+\.\S+$/.test(details.email))throw new Error('invalid_invoice');
 return {details,amount:int('amount',1000000000)};
}
export function signedCheckout(client,invoice) {
 const code=invoice.invoice_number;
 const callback=result=>`${PUBLIC_ORIGIN}/#sepay-sandbox/${invoice.id}?result=${result}`;
 const fields=client.checkout.initOneTimePaymentFields({operation:'PURCHASE',payment_method:'BANK_TRANSFER',order_invoice_number:code,order_amount:Number(invoice.amount),currency:'VND',order_description:`THU NGHIEM CloudFit ${code}`,success_url:callback('success'),error_url:callback('error'),cancel_url:callback('cancel')});
 if(client.checkout.initCheckoutUrl()!==SANDBOX_CHECKOUT)throw new Error('invalid_sandbox_endpoint');
 return {action:SANDBOX_CHECKOUT,fields,invoice_id:invoice.id,invoice_number:code,amount:Number(invoice.amount),environment:'sandbox'};
}
export function parsePaidIpn(body) {
 const {order,transaction}=body||{};
 if(typeof body?.notification_type!=='string'||!body.notification_type)throw new Error('invalid_payment');
 if(!['ORDER_PAID','PAYMENT_SUCCESS'].includes(body.notification_type))return null;
 const money=value=>{const s=String(value);if(!/^\d+(?:\.0{1,2})?$/.test(s)||!Number.isSafeInteger(Number(s))||Number(s)<1)throw new Error('invalid_payment');return Number(s);};
 const amount=money(order?.order_amount);
 if(order?.order_status!=='CAPTURED'||order?.order_currency!=='VND'||transaction?.transaction_status!=='APPROVED'||transaction?.transaction_type!=='PAYMENT'||transaction?.payment_method!=='BANK_TRANSFER'||transaction?.transaction_currency!=='VND'||money(transaction?.transaction_amount)!==amount||!UUID.test(transaction?.id||'')||!UUID.test(order?.id||'')||!/^[-A-Za-z0-9_]{1,128}$/.test(order?.order_invoice_number||''))throw new Error('invalid_payment');
 return {invoice_number:order.order_invoice_number,amount,transaction_id:transaction.id,provider_order_id:order.id};
}
export function createDb(env,fetchImpl=fetch) {
 let key;try{key=JSON.parse(env.get('SUPABASE_SECRET_KEYS')||'{}').default;}catch{}
 key ||= env.get('SUPABASE_SERVICE_ROLE_KEY');const base=env.get('SUPABASE_URL');
 if(!key||!base)throw new Error('backend_configuration');
 const headers={apikey:key,'Content-Type':'application/json'};
 if(key.startsWith('eyJ'))headers.Authorization=`Bearer ${key}`;
 return async(path,body)=>{
  const r=await fetchImpl(`${base}/rest/v1/rpc/${path}`,{method:'POST',headers,body:JSON.stringify(body),signal:AbortSignal.timeout(10000),redirect:'error'});
  if(!r.ok)throw new Error('database_error');return r.json();
 };
}
