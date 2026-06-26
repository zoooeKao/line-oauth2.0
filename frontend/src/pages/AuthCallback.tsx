import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenStore } from '../lib/auth';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      tokenStore.set(token);
      navigate('/products', { replace: true });
    } else {
      const desc = params.get('error_description');
      console.warn('LINE 登入失敗', error, desc);
      navigate(`/login?error=${error ?? 'unknown'}`, { replace: true });
    }
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500">
      處理登入中…
    </div>
  );
}
