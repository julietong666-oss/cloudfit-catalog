import { SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY } from './supabase-config.mjs';
const ACTION='https://pay-sandbox.sepay.vn/v1/checkout/init';
const tokenKey=id=>`cf-sepay-sandbox-${id}`;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function sandboxRequest(data,fetchImpl=fetch) {
 const response=await fetchImpl(`${SUPABASE_URL}/functions/v1/sepay-sandbox`,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
 const result=await response.json();
 if(!response.ok)throw new Error(['sandbox_not_configured','ipn_not_configured','ipn_invalid_configuration'].includes(result.error)?'Chưa cấu hình SePay Sandbox ở backend. Vui lòng kiểm tra Merchant ID, Secret Key và IPN.':'Chưa xác nhận được trạng thái hoá đơn thử nghiệm. Vui lòng thử lại.');
 return result;
}
export function validateSandboxCheckout(result,id) {
 if(result?.action!==ACTION||result?.environment!=='sandbox'||result?.invoice_id!==id||typeof result.fields!=='object'||!result.fields||result.fields.currency!=='VND'||result.fields.operation!=='PURCHASE'||result.fields.payment_method!=='BANK_TRANSFER'||!String(result.fields.merchant).startsWith('SP-TEST-')||!result.fields.signature)throw new Error('Biểu mẫu SePay Sandbox không hợp lệ.');
 const allowed=new Set(['operation','payment_method','order_invoice_number','order_amount','currency','order_description','success_url','error_url','cancel_url','merchant','signature']);
 for(const [key,value]of Object.entries(result.fields))if(!allowed.has(key)||!['string','number'].includes(typeof value))throw new Error('Trường checkout không hợp lệ.');
 return result;
}
export async function startSandboxCheckout(order) {
 if(!uuid.test(order.id)||order.status!=='offered')throw new Error('Phiếu không còn chờ thanh toán.');
 let accessToken;
 try {
  const existing=JSON.parse(sessionStorage.getItem(tokenKey(order.id))||'null');
  accessToken=existing?.token;
  if(!/^[a-f0-9]{64}$/.test(accessToken||''))accessToken=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
  sessionStorage.setItem(tokenKey(order.id),JSON.stringify({token:accessToken,notified:existing?.notified===true}));
 }catch{throw new Error('Cần cho phép bộ nhớ phiên trình duyệt để quay lại kiểm tra hoá đơn thử nghiệm.');}
 const checkout=validateSandboxCheckout(await sandboxRequest({action:'checkout',invoice_id:order.id,access_token:accessToken,acknowledge_sandbox:true,invoice:order}),order.id);
 const form=document.createElement('form');form.method='POST';form.action=ACTION;form.hidden=true;
 // Keep the SDK's field insertion order, including its signature.
 for(const [name,value]of Object.entries(checkout.fields)){const input=document.createElement('input');input.type='hidden';input.name=name;input.value=String(value);form.append(input);}
 document.body.append(form);HTMLFormElement.prototype.submit.call(form);
}
// Provider-added return parameters are untrusted and never prove payment.
export function sandboxReturnId(hash) {
 const path=String(hash).split('?')[0];
 const match=path.match(/^#sepay-sandbox\/(.+)$/i);
 return match&&uuid.test(match[1])?match[1]:null;
}
let pollGeneration=0;
export function initSandboxReturn() {
 const panel=document.querySelector('#sepay-return'),status=panel.querySelector('[role=status]'),button=panel.querySelector('button');
 let current;
 async function check(manual=false) {
  if(!current)return;
  const generation=++pollGeneration;
  button.disabled=true;
  let credentials;
  try{credentials=JSON.parse(sessionStorage.getItem(tokenKey(current))||'null');}catch{}
  if(!credentials?.token){status.textContent='Không có phiên xác nhận hoá đơn trên trình duyệt này. Hãy quay lại cửa sổ đã tạo thanh toán; không thể xác nhận từ URL.';button.disabled=false;return;}
  try {
   const result=await sandboxRequest({action:'status',invoice_id:current,access_token:credentials.token});
   if(generation!==pollGeneration)return;
   if(result.environment!=='sandbox'||result.invoice_id!==current||result.invoice_number!==`CFSBX${current.replaceAll('-','').toUpperCase()}`||!Number.isSafeInteger(result.amount)||result.amount<1||(!['pending','paid','cancelled'].includes(result.status)||result.status==='paid'&&result.payment_verified!==true))throw new Error('Trạng thái trả về không hợp lệ.');
   if(result.status==='paid') {
    status.textContent=`Hoá đơn ${result.invoice_number} đã thanh toán thử nghiệm, được backend đối chiếu với API SePay Sandbox. Không nhận tiền hoặc kích hoạt gói thật.`;
    if(!credentials.notified) {
     credentials.notified=true;sessionStorage.setItem(tokenKey(current),JSON.stringify(credentials));
     document.querySelector('#payment-success-copy').textContent=`SePay Sandbox đã xác nhận hoá đơn ${result.invoice_number}, số tiền thử nghiệm ${new Intl.NumberFormat('vi-VN').format(result.amount)} VND. Không phát sinh tiền thật hoặc kích hoạt gói thật.`;
     document.querySelector('#payment-success-title').textContent='Thanh toán thành công — Cảm ơn quý khách đã tin tưởng và sử dụng CloudFit';
     document.querySelector('#payment-success').showModal();
    }
   } else if(result.status==='cancelled')status.textContent='Phiếu thử nghiệm đã huỷ; chưa đăng ký gói.';
   else status.textContent='Đang chờ SePay Sandbox xác nhận thanh toán. Trang quay về báo thành công chưa đủ để xác nhận thanh toán. Có thể bấm kiểm tra lại.';
   if(result.status==='pending'&&!manual&&generation===pollGeneration)setTimeout(()=>{if(location.hash.startsWith(`#sepay-sandbox/${current}`)&&checks++<20)check();},3000);
  }catch(error){if(generation===pollGeneration)status.textContent=error.message||'Chưa kiểm tra được hoá đơn thử nghiệm.';}
  finally{button.disabled=false;}
 }
 let checks=0;
 function route() {
  const id=sandboxReturnId(location.hash);
  panel.hidden=!id;pollGeneration++;current=id;checks=0;
  if(id){panel.scrollIntoView({block:'start'});check();}
 }
 button.addEventListener('click',()=>check(true));window.addEventListener('hashchange',route);route();
}
