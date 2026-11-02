import { summarizePurchase } from '../_shared/gemini.mjs';
import { sendPurchaseNotification } from '../_shared/telegram.mjs';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const json = (data, status = 200) => Response.json(data, { status });

export function createHandler({ env, fetchImpl = fetch }) {
  return async (req) => {
    if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    const token = req.headers.get('x-delivery-token') || '';
    if (!/^[0-9a-f-]{72}$/i.test(token)) return json({ error: 'unauthorized' }, 401);
    let requestId;
    try {
      const raw = await req.text();
      if (raw.length > 1024) return json({ error: 'invalid_request' }, 400);
      requestId = JSON.parse(raw).request_id;
    } catch { return json({ error: 'invalid_request' }, 400); }
    if (typeof requestId !== 'string' || !uuid.test(requestId)) return json({ error: 'invalid_request' }, 400);
    const url = env.get('SUPABASE_URL');
    let key;
    try { key = JSON.parse(env.get('SUPABASE_SECRET_KEYS') || '{}').default; } catch { /* fallback */ }
    key ||= env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'backend_configuration' }, 503);
    const headers = { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=representation' };
    if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
    async function db(path, method = 'GET', body) {
      const response = await fetchImpl(`${url}/rest/v1/${path}`, {
        method, headers, body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(8000), redirect: 'error',
      });
      if (!response.ok) throw new Error('database_error');
      return await response.json();
    }
    try {
      const bytes = new TextEncoder().encode(token);
      const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
        .map(x => x.toString(16).padStart(2, '0')).join('');
      // One atomic compare-and-set claim, before any Telegram call. Replay and
      // concurrent requests cannot claim processing/sent/failed/unknown rows.
      const claims = await db(`telegram_deliveries?request_id=eq.${requestId}&token_hash=eq.${hash}&status=eq.pending`, 'PATCH', {
        status: 'processing', updated_at: new Date().toISOString(),
      });
      if (claims.length !== 1) return json({ error: 'not_claimable' }, 409);
      const rows = await db(`purchase_requests?id=eq.${requestId}&select=id,product_id,product_name,contact_name,phone,created_at,is_test`);
      const summary = rows.length === 1
        ? await summarizePurchase({ productName: rows[0].product_name, apiKey: env.get('GEMINI_API_KEY'), fetchImpl })
        : { status: 'fallback', code: 'saved_request_not_found', text: null };
      const result = rows.length === 1
        ? await sendPurchaseNotification({ record: rows[0], botToken: env.get('TELEGRAM_BOT_TOKEN'), chatId: env.get('TELEGRAM_CHAT_ID'), summary: summary.text, fetchImpl })
        : { status: 'failed', code: 'saved_request_not_found' };
      const finished = await db(`telegram_deliveries?request_id=eq.${requestId}&status=eq.processing`, 'PATCH', {
        status: result.status, code: result.code || null,
        message_id: result.messageId || null, updated_at: new Date().toISOString(),
      });
      if (finished.length !== 1) return json({ error: 'reconciliation_required' }, 503);
      return json({ request_id: requestId, status: result.status, code: result.code || null, summary_status: summary.status, summary_code: summary.code });
    } catch {
      // If delivery or status persistence was interrupted, leave processing for
      // reconciliation. Never log exceptions containing URLs/credentials/PII.
      return json({ error: 'reconciliation_required' }, 503);
    }
  };
}
