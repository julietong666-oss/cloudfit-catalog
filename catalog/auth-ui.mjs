import { authMessage, createIdentityClient } from './auth.mjs';

const root = document.querySelector('#identity');
const form = root.querySelector('form');
const email = root.querySelector('#identity-email');
const password = root.querySelector('#identity-password');
const message = root.querySelector('#identity-message');
const current = root.querySelector('#identity-current');
const submit = root.querySelector('#identity-submit');
const toggle = root.querySelector('#identity-toggle');
const logout = root.querySelector('#identity-logout');
const retry = root.querySelector('#identity-retry');
const header = document.querySelector('#identity-link');
let client;
let signup = false;
let busy = false;
let generation = 0;

function feedback(text, error = false) {
  message.textContent = text;
  message.dataset.error = String(error);
}
function pending(value) {
  busy = value;
  root.setAttribute('aria-busy', String(value));
  for (const control of [submit, toggle, logout, retry, email, password]) control.disabled = value;
}
function showUser(user) {
  form.hidden = Boolean(user);
  toggle.hidden = Boolean(user);
  logout.hidden = !user;
  current.textContent = user ? `Đang đăng nhập: ${user.email}` : 'Bạn chưa đăng nhập.';
  header.textContent = user ? user.email : 'Đăng nhập';
}

async function verifySession(session) {
  const version = ++generation;
  pending(true);
  // Do not display a cached identity until the Auth server validates it.
  showUser(null);
  current.textContent = 'Đang kiểm tra phiên…';
  retry.hidden = true;
  if (!session) {
    showUser(null);
    pending(false);
    return;
  }
  try {
    const { data, error } = await client.auth.getUser();
    if (version !== generation) return;
    if (error) throw error;
    if (!data.user?.email_confirmed_at) {
      await client.auth.signOut({ scope: 'local' });
      feedback('Email chưa được xác nhận. Hãy mở email xác nhận trước khi đăng nhập.', true);
      return;
    }
    showUser(data.user);
    feedback('Danh tính đã xác thực. Quyền Admin được cấp riêng bởi người quản trị.');
  } catch (error) {
    if (version !== generation) return;
    showUser(null);
    feedback(error?.status === 401 || error?.status === 403
      ? 'Phiên đã hết hạn hoặc không còn hợp lệ. Vui lòng đăng nhập lại.'
      : authMessage(error), true);
    retry.hidden = false;
  } finally {
    if (version === generation) pending(false);
  }
}

toggle.addEventListener('click', () => {
  signup = !signup;
  password.value = '';
  password.autocomplete = signup ? 'new-password' : 'current-password';
  password.minLength = signup ? 6 : 1;
  submit.textContent = signup ? 'Đăng ký' : 'Đăng nhập';
  toggle.textContent = signup ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký';
  feedback(signup ? 'Đăng ký cần xác nhận email và không tự cấp quyền Admin.' : '');
  email.focus();
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy || !client) return;
  pending(true);
  feedback(signup ? 'Đang gửi đăng ký…' : 'Đang đăng nhập…');
  try {
    const credentials = { email: email.value.trim(), password: password.value };
    const { data, error } = signup
      ? await client.auth.signUp({
        ...credentials,
        options: { emailRedirectTo: `${location.origin}${location.pathname}` },
      })
      : await client.auth.signInWithPassword(credentials);
    if (error) throw error;
    password.value = '';
    if (signup) {
      // A normal signup must never be treated as a confirmed identity.
      if (data.session) await client.auth.signOut({ scope: 'local' });
      feedback('Hãy kiểm tra hộp thư (kể cả thư rác) và xác nhận email trước khi đăng nhập. Đăng ký không tự cấp quyền Admin.');
    }
  } catch (error) {
    feedback(authMessage(error), true);
  } finally {
    password.value = '';
    pending(false);
  }
});

logout.addEventListener('click', async () => {
  if (busy || !client) return;
  pending(true);
  try {
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) throw error;
    ++generation;
    showUser(null);
    feedback('Đã đăng xuất khỏi trình duyệt này.');
  } catch (error) { feedback(authMessage(error), true); }
  finally { pending(false); }
});

async function restore() {
  pending(true);
  try {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    await verifySession(data.session);
  } catch (error) {
    showUser(null);
    feedback(authMessage(error), true);
    retry.hidden = false;
    pending(false);
  }
}
retry.addEventListener('click', restore);

try {
  client = createIdentityClient(window.supabase.createClient);
  // Keep this callback synchronous: calling Auth methods inside it can deadlock.
  client.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => verifySession(session), 0);
  });
} catch {
  feedback('Không tải được dịch vụ danh tính. Vui lòng tải lại trang.', true);
  pending(true);
}
