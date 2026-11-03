// Local identity test server. Never run or deploy as the application server.
// Auth responses are simulated; no request is sent to Supabase.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const user = email => ({ id: email.startsWith('b@') ? 'fixture-b' : 'fixture-a', email, role: 'authenticated', aud: 'authenticated', email_confirmed_at: '2026-10-26T00:00:00Z', app_metadata: {}, user_metadata: {} });
const token = email => `e30.${Buffer.from(JSON.stringify({email, exp: Math.floor(Date.now()/1000)+3600})).toString('base64url')}.fixture`;
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:4175');
  const send = (body, status = 200, type = 'application/json') => res.writeHead(status, {'Content-Type': type, 'Cache-Control':'no-store', 'X-Supabase-Api-Version':'2024-01-01'}).end(typeof body === 'string' ? body : JSON.stringify(body));
  try {
    if (url.pathname.startsWith('/auth/v1/')) {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      const body = raw ? JSON.parse(raw) : {};
      if (url.pathname.endsWith('/signup')) return send({...user(body.email), email_confirmed_at:null, identities:[]});
      if (url.pathname.endsWith('/logout')) return send({});
      if (url.pathname.endsWith('/token')) {
        if (body.email === 'wrong@example.com') return send({code:'invalid_credentials',msg:'Rejected'},400);
        if (body.email === 'unconfirmed@example.com') return send({code:'email_not_confirmed',msg:'Rejected'},400);
        const email = body.email || Buffer.from(body.refresh_token, 'base64url').toString();
        return send({access_token:token(email), refresh_token:Buffer.from(email).toString('base64url'), expires_in:3600, token_type:'bearer', user:user(email)});
      }
      if (url.pathname.endsWith('/user')) {
        const email = JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64url').toString()).email;
        return send(user(email));
      }
      return send({},404);
    }
    if (url.pathname === '/catalog/supabase-config.mjs') {
      return send("export const SUPABASE_URL='http://127.0.0.1:4175'; export const SUPABASE_PUBLISHABLE_KEY='fixture-public';",200,'text/javascript');
    }
    if (url.pathname.startsWith('/rest/v1/')) return send([]);
    const path = resolve(root, '.' + (url.pathname === '/' ? '/code.html' : url.pathname));
    if (!path.startsWith(root + sep)) return send({},403);
    let body = await readFile(path);
    if (url.pathname === '/') body = Buffer.from(body.toString().replace('<h2 id="identity-heading">Tài khoản</h2>', '<h2 id="identity-heading">Tài khoản — HTTP giả lập</h2>'));
    res.writeHead(200, {'Content-Type':{'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.svg':'image/svg+xml','.css':'text/css'}[extname(path)] || 'application/octet-stream','Cache-Control':'no-store'}).end(body);
  } catch { send({},500); }
}).listen(4175,'127.0.0.1',() => console.log('AUTH FIXTURES ONLY: http://127.0.0.1:4175'));
