import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.mjs';

// The pinned browser SDK owns token storage, refresh, confirmation callbacks,
// and cross-tab session events. Never persist passwords or log Auth responses.
export const authOptions = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
};

export function authMessage(error) {
  if (error?.code === 'email_not_confirmed') return 'Email chưa được xác nhận. Hãy mở email xác nhận trước khi đăng nhập.';
  if (error?.code === 'invalid_credentials') return 'Email hoặc mật khẩu không đúng.';
  if (error?.code === 'user_banned') return 'Tài khoản đang bị khóa. Vui lòng liên hệ người quản trị.';
  if (error?.code === 'weak_password') return 'Mật khẩu chưa đáp ứng yêu cầu. Hãy dùng mật khẩu dài và khó đoán hơn.';
  if (error?.status === 429) return 'Bạn đã thử quá nhiều lần. Vui lòng chờ rồi thử lại.';
  if (error?.status === 0 || error?.name === 'AuthRetryableFetchError' || error instanceof TypeError) return 'Không kết nối được dịch vụ danh tính. Kiểm tra mạng và thử lại.';
  return 'Không hoàn tất được thao tác. Vui lòng kiểm tra thông tin và thử lại.';
}

export function createIdentityClient(createClient) {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: authOptions });
}
