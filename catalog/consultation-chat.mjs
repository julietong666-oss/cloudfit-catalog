// Frontend handoff only: a saved consultation is not a live staff assignment.
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function createConsultationConversation(data, firstQuestion) {
 if (!uuid.test(data?.requestId || '') || !data?.productId || !data?.productName) throw new Error('Thông tin yêu cầu tư vấn không hợp lệ.');
 const contact = {
  requestId:data.requestId, productId:String(data.productId).slice(0,128),
  productName:String(data.productName).slice(0,200), contactName:String(data.contactName||'').slice(0,120), phone:String(data.phone||'').slice(0,24),
 };
 return {
  source:'consultation',customerId:`consultation-${contact.requestId}`,contact,interest:contact.productName,answers:{},step:0,
  messages:[
   {role:'admin',text:`${contact.contactName?'Chào '+contact.contactName:'Xin chào'}. Yêu cầu tư vấn ${contact.requestId} cho gói ${contact.productName} đã được tiếp nhận. Bạn không cần điền lại tên và số điện thoại.`},
   {role:'admin',text:'Hiện chưa có nhân viên được phân công trực tuyến. Bạn có thể bổ sung nhu cầu tại đây; phần trả lời khảo sát hiện chỉ lưu trong trang này và chưa được gửi cho nhân viên.'},
   {role:'admin',text:firstQuestion},
  ],
 };
}
