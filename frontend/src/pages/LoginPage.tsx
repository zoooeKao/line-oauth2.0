import { API_BASE } from '../lib/api';

export default function LoginPage() {
  const handleLineLogin = () => {
    window.location.href = `${API_BASE}/api/auth/line/authorize`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">登入 POC</h1>
          <p className="text-sm text-slate-500">用 LINE 帳號登入查看商品</p>
        </div>
        <button
          type="button"
          onClick={handleLineLogin}
          className="w-full flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b34c] active:bg-[#04a043] text-white font-medium py-3 rounded-xl transition"
        >
          <span className="inline-block w-5 h-5 rounded bg-white text-[#06C755] text-xs font-bold leading-5">L</span>
          使用 LINE 登入
        </button>
      </div>
    </div>
  );
}
