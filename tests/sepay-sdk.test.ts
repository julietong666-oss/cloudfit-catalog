import { SePayPgClient } from 'npm:sepay-pg-node@1.0.0';
import { signedCheckout } from '../supabase/functions/_shared/sepay-sandbox.mjs';
Deno.test('official SDK signs sandbox-only checkout with expected HMAC and field order', async()=>{
 const secret='spsk_test_'+'a'.repeat(32);
 const client=new SePayPgClient({env:'sandbox',merchant_id:'SP-TEST-CLOUDFIT',secret_key:secret});
 const signed=signedCheckout(client,{id:'50000000-0000-4000-8000-000000000001',invoice_number:'CFSBX50000000000040008000000000000001',amount:10000});
 if(signed.action!=='https://pay-sandbox.sepay.vn/v1/checkout/init')throw new Error('wrong host');
 const {signature,...fields}=signed.fields;
 const payload=Object.entries(fields).map(([k,v])=>`${k}=${v}`).join(',');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const bytes=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(payload)));
 if(signature!==btoa(String.fromCharCode(...bytes)))throw new Error('signature mismatch');
});
