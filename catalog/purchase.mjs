import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.mjs';
export async function submitPurchase(data,fetchImpl=fetch){
 try{
  const response=await fetchImpl(`${SUPABASE_URL}/functions/v1/purchase-request`,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
  const body=await response.json();
  if(response.ok && body.saved===true && body.request_id===data.request_id)return body;
  const messages={rate_limited:'Bạn đã gửi nhiều yêu cầu tư vấn gần đây. Vui lòng thử lại sau.',request_conflict:'Mã yêu cầu tư vấn đang gắn với thông tin khác. Hãy tải lại trang để bắt đầu lại.',product_unavailable:'Gói này hiện chưa tiếp nhận yêu cầu tư vấn.',invalid_request:'Vui lòng kiểm tra tên, số điện thoại và đồng ý liên hệ tư vấn.'};
  const error = new Error(messages[body.error]||'Chưa xác nhận được yêu cầu tư vấn đã lưu. Giữ nguyên thông tin và bấm gửi lại để kiểm tra.');
  error.code = body.error;
  throw error;
 }catch(error){
  if(error?.name==='TimeoutError'||error instanceof TypeError)throw new Error('Chưa xác nhận được yêu cầu tư vấn đã lưu. Kiểm tra mạng rồi bấm gửi lại; hệ thống dùng cùng mã để tránh tạo trùng.');
  throw error;
 }
}
export function createPurchaseForm(product){
 const form=document.createElement('form');form.className='cf-purchase';
 const heading=document.createElement('h3');heading.textContent='Đăng ký tư vấn gói dịch vụ';
 const description=document.createElement('p');description.textContent='Để lại thông tin để được tư vấn giải pháp và gói dịch vụ phù hợp với nhu cầu, số lượng người dùng và ngân sách của doanh nghiệp. Nếu chưa biết chọn gói nào, chúng tôi sẽ hỗ trợ bạn. Gửi yêu cầu chưa phát sinh thanh toán.';
 const fields=document.createElement('fieldset');const legend=document.createElement('legend');legend.textContent='Thông tin liên hệ';fields.append(legend);
 function input(labelText,name,type,autocomplete){
  const label=document.createElement('label');label.textContent=labelText;
  const control=document.createElement('input');control.name=name;control.type=type;control.autocomplete=autocomplete;control.required=true;
  label.append(control);fields.append(label);return control;
 }
 const name=input('Họ và tên','contact_name','text','name');name.maxLength=120;
 const phone=input('Số điện thoại','phone','tel','tel');phone.pattern='[+0-9 ()-]{8,24}';phone.maxLength=24;phone.inputMode='tel';
 const consent=document.createElement('label');consent.className='cf-consent';const check=document.createElement('input');check.type='checkbox';check.required=true;
 consent.append(check,document.createTextNode('Tôi đồng ý dùng tên và số điện thoại để liên hệ tư vấn giải pháp và gói dịch vụ phù hợp; thông tin được gửi đến người phụ trách qua Telegram.'));fields.append(consent);
 const trap=document.createElement('input');trap.name='website';trap.type='text';trap.tabIndex=-1;trap.autocomplete='off';trap.hidden=true;fields.append(trap);
 const button=document.createElement('button');button.type='submit';button.textContent='Gửi yêu cầu tư vấn';fields.append(button);
 const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 let requestId=crypto.randomUUID(),busy=false,saved=false;
 const storageKey=`cf-purchase-${product.id}`;
 try{const previous=sessionStorage.getItem(storageKey);if(/^[0-9a-f-]{36}$/i.test(previous||''))requestId=previous;}catch{}
 const interest=document.createElement('p');interest.textContent=`Gói quan tâm: ${product.name}`;
 form.append(heading,description,interest,fields,status);
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||saved||!form.reportValidity())return;
  busy=true;fields.disabled=true;form.setAttribute('aria-busy','true');button.textContent='Đang gửi yêu cầu tư vấn…';status.textContent='Đang gửi yêu cầu tư vấn…';
  try{
   try{sessionStorage.setItem(storageKey,requestId);}catch{}
   await submitPurchase({request_id:requestId,product_id:product.id,contact_name:name.value.trim(),phone:phone.value,consent:check.checked,website:trap.value});
   saved=true;status.textContent='Đã nhận yêu cầu tư vấn. Nhân viên sẽ liên hệ để tìm hiểu nhu cầu và đề xuất gói dịch vụ phù hợp.';button.textContent='Đã nhận yêu cầu tư vấn';
   try{sessionStorage.removeItem(storageKey);}catch{}
  }catch(error){
   status.textContent=error.message||'Chưa xác nhận được yêu cầu tư vấn đã lưu. Vui lòng thử lại.';button.textContent='Gửi lại yêu cầu tư vấn';
   if(error.code==='request_conflict'){requestId=crypto.randomUUID();try{sessionStorage.removeItem(storageKey);}catch{}status.textContent='Yêu cầu tư vấn trước đã được lưu với thông tin khác. Nếu muốn gửi thông tin hiện tại thành yêu cầu tư vấn mới, bấm Gửi lại yêu cầu tư vấn.';}
  }
  finally{busy=false;fields.disabled=saved;form.setAttribute('aria-busy','false');}
 });
 return form;
}
