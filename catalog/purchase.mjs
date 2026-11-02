import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.mjs';
export async function submitPurchase(data,fetchImpl=fetch){
 try{
  const response=await fetchImpl(`${SUPABASE_URL}/functions/v1/purchase-request`,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
  const body=await response.json();
  if(response.ok && body.saved===true && body.request_id===data.request_id)return body;
  const messages={rate_limited:'Bạn đã gửi nhiều yêu cầu gần đây. Vui lòng thử lại sau.',request_conflict:'Mã yêu cầu đang gắn với thông tin khác. Hãy tải lại trang để bắt đầu lại.',product_unavailable:'Gói này hiện chưa tiếp nhận đăng ký.',invalid_request:'Vui lòng kiểm tra tên, số điện thoại và xác nhận liên hệ.'};
  const error = new Error(messages[body.error]||'Chưa xác nhận được yêu cầu đã lưu. Giữ nguyên thông tin và bấm gửi lại để kiểm tra.');
  error.code = body.error;
  throw error;
 }catch(error){
  if(error?.name==='TimeoutError'||error instanceof TypeError)throw new Error('Chưa xác nhận được yêu cầu đã lưu. Kiểm tra mạng rồi bấm gửi lại; hệ thống dùng cùng mã để tránh tạo trùng.');
  throw error;
 }
}
export function createPurchaseForm(product){
 const form=document.createElement('form');form.className='cf-purchase';
 const heading=document.createElement('h3');heading.textContent='Đăng ký gói dịch vụ';
 const description=document.createElement('p');description.textContent='Để lại thông tin để chúng tôi liên hệ xác nhận cấu hình và giá. Gửi đăng ký chưa phát sinh thanh toán.';
 const fields=document.createElement('fieldset');const legend=document.createElement('legend');legend.textContent='Thông tin liên hệ';fields.append(legend);
 function input(labelText,name,type,autocomplete){
  const label=document.createElement('label');label.textContent=labelText;
  const control=document.createElement('input');control.name=name;control.type=type;control.autocomplete=autocomplete;control.required=true;
  label.append(control);fields.append(label);return control;
 }
 const name=input('Họ và tên','contact_name','text','name');name.maxLength=120;
 const phone=input('Số điện thoại','phone','tel','tel');phone.pattern='[+0-9 ()-]{8,24}';phone.maxLength=24;phone.inputMode='tel';
 const consent=document.createElement('label');consent.className='cf-consent';const check=document.createElement('input');check.type='checkbox';check.required=true;
 consent.append(check,document.createTextNode('Tôi đồng ý dùng tên và số điện thoại để liên hệ xử lý đăng ký; thông tin được gửi đến người phụ trách qua Telegram.'));fields.append(consent);
 const trap=document.createElement('input');trap.name='website';trap.type='text';trap.tabIndex=-1;trap.autocomplete='off';trap.hidden=true;fields.append(trap);
 const button=document.createElement('button');button.type='submit';button.textContent='Gửi đăng ký';fields.append(button);
 const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 let requestId=crypto.randomUUID(),busy=false,saved=false;
 const storageKey=`cf-purchase-${product.id}`;
 try{const previous=sessionStorage.getItem(storageKey);if(/^[0-9a-f-]{36}$/i.test(previous||''))requestId=previous;}catch{}
 form.append(heading,description,fields,status);
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||saved||!form.reportValidity())return;
  busy=true;fields.disabled=true;form.setAttribute('aria-busy','true');button.textContent='Đang gửi…';status.textContent='Đang tiếp nhận đăng ký…';
  try{
   try{sessionStorage.setItem(storageKey,requestId);}catch{}
   const result=await submitPurchase({request_id:requestId,product_id:product.id,contact_name:name.value.trim(),phone:phone.value,consent:check.checked,website:trap.value});
   saved=true;status.textContent=`Đã tiếp nhận đăng ký. Mã yêu cầu: ${result.request_id}. Chúng tôi sẽ liên hệ xác nhận; chưa phát sinh thanh toán.`;button.textContent='Đã tiếp nhận';
   try{sessionStorage.removeItem(storageKey);}catch{}
  }catch(error){
   status.textContent=error.message||'Chưa xác nhận được yêu cầu đã lưu. Vui lòng thử lại.';button.textContent='Gửi lại';
   if(error.code==='request_conflict'){requestId=crypto.randomUUID();try{sessionStorage.removeItem(storageKey);}catch{}status.textContent='Yêu cầu trước đã được lưu với thông tin khác. Nếu muốn gửi thông tin hiện tại thành yêu cầu mới, bấm Gửi lại.';}
  }
  finally{busy=false;fields.disabled=saved;form.setAttribute('aria-busy','false');}
 });
 return form;
}
