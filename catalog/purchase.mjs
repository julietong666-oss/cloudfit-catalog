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
const requestUuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Receipt metadata only. Contact details and chat answers never enter storage or URLs.
export function consultationReceipt(data,state='saved'){
 if(!requestUuid.test(data?.requestId||'')||!data?.productId||!data?.productName||!['pending','saved'].includes(state))return null;
 return {version:1,state,requestId:data.requestId,productId:String(data.productId),productName:String(data.productName).slice(0,200)};
}
export function readConsultationReceipt(raw,product){
 try{
  if(requestUuid.test(raw||''))return consultationReceipt({requestId:raw,productId:product.id,productName:product.name},'pending');
  if(typeof raw!=='string'||raw.length>2048)return null;
  const value=JSON.parse(raw);
  if(value?.version!==1||value.productId!==product.id)return null;
  return consultationReceipt(value,value.state);
 }catch{return null;}
}
export function createPurchaseForm(product){
 const form=document.createElement('form');form.className='cf-purchase';
 const node=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
 const heading=node('h3','Đăng ký tư vấn gói dịch vụ');
 const description=node('p','Để lại thông tin để được tư vấn giải pháp và gói dịch vụ phù hợp với nhu cầu, số lượng người dùng và ngân sách của doanh nghiệp. Nếu chưa biết chọn gói nào, chúng tôi sẽ hỗ trợ bạn. Gửi yêu cầu chưa phát sinh thanh toán.');
 const fields=node('fieldset');fields.append(node('legend','Thông tin liên hệ'));
 function input(labelText,name,type,autocomplete){
  const label=node('label',labelText),control=document.createElement('input');Object.assign(control,{name,type,autocomplete,required:true});label.append(control);fields.append(label);return control;
 }
 const name=input('Họ và tên','contact_name','text','name');name.maxLength=120;
 const phone=input('Số điện thoại','phone','tel','tel');phone.pattern='[+0-9 ()-]{8,24}';phone.maxLength=24;phone.inputMode='tel';
 const consent=node('label',undefined,'cf-consent'),check=document.createElement('input');check.type='checkbox';check.required=true;
 consent.append(check,document.createTextNode('Tôi đồng ý dùng tên và số điện thoại để liên hệ tư vấn giải pháp và gói dịch vụ phù hợp; thông tin hoá đơn thanh toán thử nghiệm được thông báo đến người phụ trách qua Telegram sau khi SePay xác nhận.'));fields.append(consent);
 const trap=document.createElement('input');Object.assign(trap,{name:'website',type:'text',tabIndex:-1,autocomplete:'off',hidden:true});fields.append(trap);
 const button=node('button','Gửi yêu cầu tư vấn');button.type='submit';fields.append(button);
 const status=node('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const storageKey=`cf-purchase-${product.id}`;
 let previous;try{previous=readConsultationReceipt(sessionStorage.getItem(storageKey),product);}catch{}
 let requestId=previous?.requestId||crypto.randomUUID(),busy=false,saved=previous?.state==='saved',handoff=previous?.state==='saved'?previous:null;
 const store=state=>{try{sessionStorage.setItem(storageKey,JSON.stringify(consultationReceipt({requestId,productId:product.id,productName:product.name},state)));return true;}catch{return false;}};
 function confirmation(focus=false,persisted=true){
  const panel=node('section',undefined,'cf-consultation-confirmation');
  const title=node('h3','CloudFit đã nhận yêu cầu tư vấn!');title.tabIndex=-1;title.dataset.confirmationTitle='';
  const detail=node('p','Cảm ơn quý khách đã quan tâm. Đội ngũ CloudFit sẽ liên hệ để tư vấn giải pháp phù hợp.');
  const interest=node('p');interest.append(document.createTextNode('Gói dịch vụ đã chọn: '),node('strong',handoff.productName));
  const waiting=node('p','Chờ tư vấn','cf-consultation-state');
  const actions=node('div',undefined,'cf-consultation-actions');
  const chat=node('button','Chat ngay với nhân viên');chat.type='button';chat.dataset.consultationChat='';
  const later=node('button','Để nhân viên liên hệ sau','cf-consultation-later');later.type='button';
  chat.addEventListener('click',()=>{
   const event=new CustomEvent('cloudfit:consultation-saved',{bubbles:true,cancelable:true,detail:handoff});
   const unhandled=form.dispatchEvent(event);
   status.textContent=unhandled?'Chưa mở được khung chat. Yêu cầu tư vấn vẫn đã lưu; bạn có thể thử lại hoặc để nhân viên liên hệ sau.':'';
  });
  later.addEventListener('click',()=>{location.hash='#catalog';document.querySelector('#catalog-heading')?.focus();});
  actions.append(chat,later);
  panel.append(title,detail,interest,waiting,actions,node('p','Khung chat hiện là bản mô phỏng, chưa kết nối nhân viên trực tuyến.','cf-consultation-note'));
  form.replaceChildren(panel,status);
  status.textContent=persisted?'':'Yêu cầu đã lưu. Trình duyệt không lưu được phiên; hãy giữ trang này để tiếp tục, tránh gửi lại yêu cầu sau khi tải lại.';
  if(focus)title.focus();
 }
 form.append(heading,description,node('p',`Gói quan tâm: ${product.name}`),fields,status);
 if(saved)confirmation();
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||saved||!form.reportValidity())return;
  busy=true;fields.disabled=true;form.setAttribute('aria-busy','true');button.textContent='Đang gửi yêu cầu tư vấn…';status.textContent='Đang gửi yêu cầu tư vấn…';
  try{
   store('pending');
   const result=await submitPurchase({request_id:requestId,product_id:product.id,contact_name:name.value.trim(),phone:phone.value,consent:check.checked,website:trap.value});
   saved=true;
   handoff={requestId:result.request_id,productId:product.id,productName:product.name,contactName:name.value.trim(),phone:phone.value};
   confirmation(true,store('saved'));
  }catch(error){
   status.textContent=error.message||'Chưa xác nhận được yêu cầu tư vấn đã lưu. Vui lòng thử lại.';button.textContent='Gửi lại yêu cầu tư vấn';
   if(error.code==='request_conflict')status.textContent='Mã yêu cầu đã gắn với thông tin khác. Yêu cầu trước được giữ nguyên; vui lòng kiểm tra lại thông tin, không gửi thêm yêu cầu mới.';
  }finally{busy=false;fields.disabled=saved;form.setAttribute('aria-busy','false');}
 });
 return form;
}
