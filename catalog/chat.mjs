// Interactive design prototype only. No network, storage, AI or real assignment.
export const demoCustomers = Object.freeze([
  Object.freeze({ id: 'your-company', company: 'Doanh nghiệp của bạn', admin: 'Ngọc Anh', initials: 'NA', specialty: 'Giải pháp doanh nghiệp' }),
  Object.freeze({ id: 'mekong-demo', company: 'Mekong Studio (mẫu)', admin: 'Minh Quân', initials: 'MQ', specialty: 'Hạ tầng & dữ liệu' }),
  Object.freeze({ id: 'anphat-demo', company: 'An Phát Retail (mẫu)', admin: 'Ngọc Anh', initials: 'NA', specialty: 'Giải pháp doanh nghiệp' }),
]);
export const questions = Object.freeze([
  Object.freeze({ key: 'users', label: 'Quy mô người dùng', text: 'Giải pháp dự kiến phục vụ bao nhiêu người? Bạn có thể tách số nhân viên dùng nội bộ và số khách hàng dùng ứng dụng.', choices: ['Dưới 20 nhân viên', '20–100 nhân viên', 'Trên 100 nhân viên', 'Chưa xác định'] }),
  Object.freeze({ key: 'context', label: 'Bối cảnh công ty', text: 'Công ty hoạt động trong lĩnh vực nào? Bạn đang triển khai mới hay muốn cải thiện hệ thống đang dùng?', choices: ['Startup xây ứng dụng mới', 'Doanh nghiệp chuyển đổi số', 'Mở rộng hệ thống hiện tại'] }),
  Object.freeze({ key: 'needs', label: 'Mong muốn chính', text: 'Bạn muốn giải quyết vấn đề gì trước tiên: lưu trữ dữ liệu, cộng tác, tích hợp, bảo mật hay hiệu năng? Có yêu cầu riêng nào cần lưu ý?', choices: ['Lưu trữ & bảo mật dữ liệu', 'Email & cộng tác nội bộ', 'Tích hợp & mở rộng ứng dụng', 'Cần hỗ trợ xác định nhu cầu'] }),
  Object.freeze({ key: 'budget', label: 'Ngân sách dự kiến', text: 'Ngân sách hàng tháng dự kiến của doanh nghiệp là bao nhiêu? Nếu chưa có mức cụ thể, bạn có thể chọn “Cần tư vấn ngân sách”.', choices: ['Dưới 5 triệu/tháng', '5–20 triệu/tháng', 'Trên 20 triệu/tháng', 'Cần tư vấn ngân sách'] }),
  Object.freeze({ key: 'timeline', label: 'Thời gian triển khai', text: 'Bạn dự kiến bắt đầu khi nào? Hãy chia sẻ thêm yêu cầu chuyển dữ liệu hoặc hỗ trợ triển khai nếu có.', choices: ['Trong tháng này', 'Trong 1–3 tháng', 'Đang tìm hiểu'] }),
]);
export function createConversation(customerId, interest = '') {
  const customer = demoCustomers.find(item => item.id === customerId);
  if (!customer) throw new Error('Khách hàng mẫu không hợp lệ.');
  return {
    customerId, interest, answers: {}, step: 0,
    messages: [
      { role: 'admin', text: `Xin chào! Tôi là ${customer.admin}, người phụ trách tư vấn cho ${customer.company}. Chúng ta cùng tìm hiểu nhu cầu trước khi cân nhắc gói dịch vụ nhé.` },
      { role: 'admin', text: questions[0].text },
    ],
  };
}
export function answerConversation(conversation, raw) {
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!text) throw new Error('Hãy nhập câu trả lời hoặc chọn một gợi ý.');
  if (text.length > 1000) throw new Error('Mỗi tin nhắn tối đa 1.000 ký tự.');
  if (conversation.step >= questions.length) throw new Error('Khảo sát mẫu đã hoàn tất. Chọn “Làm lại khảo sát” để thay đổi câu trả lời.');
  const answers = { ...conversation.answers, [questions[conversation.step].key]: text };
  const step = conversation.step + 1;
  const response = step < questions.length ? questions[step].text
    : 'Cảm ơn bạn đã chia sẻ. Thông tin đã được tổng hợp trong bản mẫu để người phụ trách xem xét giải pháp và gói phù hợp. Ở hệ thống thật, admin sẽ trao đổi thêm trước khi đề xuất; chưa phát sinh mua gói hoặc thanh toán.';
  const finalResponse = conversation.source==='consultation' && step===questions.length ? 'Cảm ơn bạn. Phần nhu cầu bổ sung hiện chỉ được giữ trong trang này; chưa có kết nối chat trực tuyến hoặc lưu câu trả lời vào hệ thống. Yêu cầu tư vấn ban đầu đã được tiếp nhận; nhân viên sẽ liên hệ theo thông tin bạn đã gửi.' : response;
  return { ...conversation, answers, step, messages: [...conversation.messages, { role: 'customer', text }, { role: 'admin', text: finalResponse }] };
}
