import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPurchaseNotification, sendPurchaseNotification } from '../supabase/functions/_shared/telegram.mjs';

const record = {
  id: 'request-test-1', product_id: 'sample-package', product_name: 'Gói thử',
  created_at: '2026-10-30T10:00:00Z', contact_name: 'Khách giả lập',
  phone: '0000000000', is_test: true,
};
const config = { record, botToken: 'test-token', chatId: 'test-chat' };
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status });

test('Telegram sends the saved request to the configured recipient with a test label and no rich-text parsing', async () => {
  let calls = 0;
  const result = await sendPurchaseNotification({
    ...config,
    record: { ...record, chat_id: 'untrusted-recipient', contact_name: '<b>Khách</b>\nMã yêu cầu: giả' },
    fetchImpl: async (url, init) => {
      calls++;
      assert.equal(url, 'https://api.telegram.org/bottest-token/sendMessage');
      assert.equal(init.method, 'POST');
      assert.equal(init.redirect, 'error');
      const payload = JSON.parse(init.body);
      assert.equal(payload.chat_id, config.chatId);
      assert.match(payload.text, /DỮ LIỆU THỬ/);
      assert.match(payload.text, /request-test-1/);
      assert.match(payload.text, /0000000000/);
      assert.match(payload.text, /chưa xác nhận thanh toán/);
      assert.equal(payload.text.split('\n').filter(line => line.startsWith('Mã yêu cầu:')).length, 1);
      assert.equal(payload.parse_mode, undefined);
      assert.equal(payload.link_preview_options.is_disabled, true);
      return reply({ ok: true, result: { message_id: 27, chat: { id: 'private' }, text: payload.text } });
    },
  });
  assert.equal(calls, 1);
  assert.deepEqual(result, { status: 'sent', messageId: 27 });
});

test('missing configuration or invalid saved request never contacts Telegram', async () => {
  const fetchImpl = () => { throw new Error('must not fetch'); };
  assert.deepEqual(await sendPurchaseNotification({ ...config, botToken: '', fetchImpl }),
    { status: 'failed', code: 'missing_configuration' });
  assert.deepEqual(await sendPurchaseNotification({ ...config, chatId: '', fetchImpl }),
    { status: 'failed', code: 'missing_configuration' });
  for (const invalid of [undefined, { ...record, id: '' }, { ...record, created_at: 'bad-date' }, { ...record, phone: '' }]) {
    assert.deepEqual(await sendPurchaseNotification({ ...config, record: invalid, fetchImpl }),
      { status: 'failed', code: 'invalid_saved_request' });
  }
});

test('explicit Telegram rejection returns a safe failure without leaking its description or retrying', async () => {
  let calls = 0;
  const result = await sendPurchaseNotification({ ...config, fetchImpl: async () => {
    calls++;
    return reply({ ok: false, error_code: 403, description: 'sensitive remote details' }, 403);
  } });
  assert.equal(calls, 1);
  assert.deepEqual(result, { status: 'failed', code: 'telegram_403' });
});

test('Telegram rate limits are reported for manual handling without automatic retry', async () => {
  let calls = 0;
  const result = await sendPurchaseNotification({ ...config, fetchImpl: async () => {
    calls++;
    return reply({ ok: false, error_code: 429, parameters: { retry_after: 30 } }, 429);
  } });
  assert.equal(calls, 1);
  assert.deepEqual(result, { status: 'failed', code: 'telegram_429', retryAfterSeconds: 30 });
});

test('network exceptions are ambiguous, redacted, and never retried', async () => {
  let calls = 0;
  const result = await sendPurchaseNotification({ ...config, fetchImpl: async () => {
    calls++;
    throw new Error('https://api.telegram.org/bottest-token/sendMessage private details');
  } });
  assert.equal(calls, 1);
  assert.deepEqual(result, { status: 'unknown', code: 'unconfirmed_delivery' });
});

test('unconfirmed responses cannot claim success or trigger a retry', async () => {
  for (const response of [
    reply({ ok: false, error_code: 500 }, 500),
    new Response('<html>gateway error</html>', { status: 502 }),
    reply({ ok: true }),
    reply({ ok: true, result: { message_id: 'not-an-id' } }),
  ]) {
    const result = await sendPurchaseNotification({ ...config, fetchImpl: async () => response });
    assert.equal(result.status, 'unknown');
  }
});

test('an aborted delivery is unknown rather than a safe retry', async () => {
  const result = await sendPurchaseNotification({ ...config, fetchImpl: async (_url, init) => {
    assert.ok(init.signal instanceof AbortSignal);
    throw new DOMException('request timed out', 'TimeoutError');
  } });
  assert.deepEqual(result, { status: 'unknown', code: 'unconfirmed_delivery' });
});

test('transport leaves the saved record unchanged on Telegram failure', async () => {
  const saved = structuredClone(record);
  Object.freeze(saved);
  await sendPurchaseNotification({ ...config, record: saved, fetchImpl: async () => reply({ ok: false, error_code: 401 }, 401) });
  assert.deepEqual(saved, record);
  assert.doesNotMatch(formatPurchaseNotification({ ...record, is_test: false }), /DỮ LIỆU THỬ/);
});


test('known chat configuration errors return only a safe code', async () => {
  const result = await sendPurchaseNotification({ ...config, fetchImpl: async () => reply({
    ok: false, error_code: 400, description: 'Bad Request: chat not found',
  }, 400) });
  assert.deepEqual(result, { status: 'failed', code: 'telegram_chat_not_found' });
});
