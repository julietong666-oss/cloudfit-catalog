const encoder=new TextEncoder();
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const RECEIPT_LIFETIME=7*24*60*60;
export function serviceKey(env){let key;try{key=JSON.parse(env.get('SUPABASE_SECRET_KEYS')||'{}').default;}catch{}return key||env.get('SUPABASE_SERVICE_ROLE_KEY');}
async function signingKey(env){
 const root=serviceKey(env),project=env.get('SUPABASE_URL');if(!root||!project)throw new Error('backend_configuration');
 // Domain-separated HKDF subkey; never use the service credential as the HMAC key.
 const material=await crypto.subtle.importKey('raw',encoder.encode(root),'HKDF',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:encoder.encode(project),info:encoder.encode('cloudfit/consultation-callback/receipt/v1')},material,{name:'HMAC',hash:'SHA-256',length:256},false,['sign','verify']);
}
const message=(id,product,expiry)=>encoder.encode(`v1|${id}|${product}|${expiry}`);
export async function issueConsultationReceipt(env,id,product,now=Date.now()){
 if(!uuid.test(id)||!/^[a-z0-9-]{1,128}$/.test(product))throw new Error('invalid_request');
 const expiry=Math.floor(now/1000)+RECEIPT_LIFETIME;
 const bytes=await crypto.subtle.sign('HMAC',await signingKey(env),message(id,product,expiry));
 return `v1.${expiry}.${Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('')}`;
}
export async function verifyConsultationReceipt(env,id,product,receipt,now=Date.now()){
 if(!uuid.test(id||'')||!/^[a-z0-9-]{1,128}$/.test(product||''))return false;
 const match=typeof receipt==='string'&&receipt.match(/^v1\.(\d{10})\.([a-f0-9]{64})$/);
 if(!match||Number(match[1])<=Math.floor(now/1000)||Number(match[1])>Math.floor(now/1000)+RECEIPT_LIFETIME+60)return false;
 const signature=Uint8Array.from(match[2].match(/../g),h=>parseInt(h,16));
 return crypto.subtle.verify('HMAC',await signingKey(env),signature,message(id,product,Number(match[1])));
}
export async function receiptHash(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
