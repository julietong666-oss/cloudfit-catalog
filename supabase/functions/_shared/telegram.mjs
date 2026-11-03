// Caller must fetch a committed request from DB and claim its delivery before
// calling this transport. This module never accepts a recipient from the client,
// persists request data, logs remote errors, or retries an ambiguous delivery.
function field(value, limit) {
  if (typeof value !== 'string' || !value.trim() || value.length > limit) {
    throw new Error('invalid_saved_request');
  }
  const cleaned = value.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();
  if (!cleaned) throw new Error('invalid_saved_request');
  return cleaned;
}

export function formatPurchaseNotification(record, summary = null) {
  const id = field(record?.id, 128);
  const productId = field(record?.product_id, 128);
  const productName = field(record?.product_name, 200);
  const contactName = field(record?.contact_name, 120);
  const phone = field(record?.phone, 32);
  const createdAt = field(record?.created_at, 64);
  if (!Number.isFinite(Date.parse(createdAt))) throw new Error('invalid_saved_request');
  const time = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'medium',
  }).format(new Date(createdAt));
  return [
    `Có yêu cầu tư vấn gói dịch vụ mới${record.is_test === true ? ' — DỮ LIỆU THỬ' : ''}`,
    `Mã yêu cầu: ${id}`,
    `Gói: ${productName}`,
    `Mã gói: ${productId}`,
    `Thời điểm (Việt Nam): ${time}`,
    `Người liên hệ: ${contactName}`,
    `Số điện thoại: ${phone}`,
    ...(typeof summary === 'string' && summary.trim() && summary.length <= 360
      ? [`Tóm tắt AI (tham khảo): ${summary.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim()}`] : []),
    'Đây là yêu cầu tư vấn gói dịch vụ, chưa phát sinh thanh toán.',
  ].join('\n');
}

export async function sendPurchaseNotification({
  record, botToken, chatId, summary = null, fetchImpl = fetch, timeoutMs = 10000,
}) {
  if (typeof botToken !== 'string' || !botToken.trim()
    || typeof chatId !== 'string' || !chatId.trim()) {
    return { status: 'failed', code: 'missing_configuration' };
  }
  let text;
  try { text = formatPurchaseNotification(record, summary); }
  catch { return { status: 'failed', code: 'invalid_saved_request' }; }

  try {
    const response = await fetchImpl(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      redirect: 'error',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = await response.json();
    if (response.ok && body?.ok === true
      && Number.isSafeInteger(body.result?.message_id) && body.result.message_id > 0) {
      // Return no recipient, full Telegram response, or contact information.
      return { status: 'sent', messageId: body.result.message_id };
    }
    const code = body?.error_code;
    if (body?.ok === false && Number.isInteger(code) && code >= 400 && code < 500) {
      let safeCode = `telegram_${code}`;
      const description = typeof body.description === 'string' ? body.description.toLowerCase() : '';
      if (code === 400 && description.includes('chat not found')) safeCode = 'telegram_chat_not_found';
      if (code === 403 && description.includes('blocked')) safeCode = 'telegram_bot_blocked';
      const result = { status: 'failed', code: safeCode };
      const retryAfter = body.parameters?.retry_after;
      if (code === 429 && Number.isSafeInteger(retryAfter) && retryAfter > 0) {
        result.retryAfterSeconds = retryAfter;
      }
      return result;
    }
    // A proxy error, malformed reply or server failure cannot establish whether
    // Telegram accepted the message. Do not automatically retry it.
    return { status: 'unknown', code: 'unconfirmed_response' };
  } catch {
    // Even a connection error can occur after delivery. Never expose exception
    // text: fetch exceptions may include the URL containing the bot token.
    return { status: 'unknown', code: 'unconfirmed_delivery' };
  }
}
