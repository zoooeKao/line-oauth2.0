import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { tokenStore } from '../lib/auth';

type Me = {
  id: number;
  lineUserId: string;
  displayName: string;
  pictureUrl: string;
  officialAccountFollowed: boolean;
  oaAddFriendUrl: string;
};

const mockProducts = [
  { id: 1, name: '經典咖啡豆 500g', price: 480 },
  { id: 2, name: '手沖濾杯', price: 320 },
  { id: 3, name: '陶瓷馬克杯', price: 250 },
  { id: 4, name: '電子秤', price: 1280 },
];

export default function ProductsPage() {
  const navigate = useNavigate();

  const { data: me, isLoading, isError } = useQuery<Me>({
    queryKey: ['me'],
    queryFn: async () => (await api.get<Me>('/api/me')).data,
  });

  const handleLogout = () => {
    tokenStore.clear();
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">載入中…</div>;
  }
  if (isError || !me) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">無法載入使用者資料</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {me.pictureUrl && (
              <img src={me.pictureUrl} alt={me.displayName} className="w-10 h-10 rounded-full" />
            )}
            <div>
              <div className="font-medium text-slate-800">{me.displayName}</div>
              <div className="text-xs text-slate-500">{me.lineUserId}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-100"
          >
            登出
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {!me.officialAccountFollowed && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
            <div>
              <div className="font-medium text-emerald-800">還沒加入我們的官方帳號</div>
              <div className="text-sm text-emerald-700">加入即可接收訂單通知與專屬優惠。</div>
            </div>
            <a
              href={me.oaAddFriendUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-center text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md"
            >
              加入官方帳號
            </a>
          </div>
        )}

        <h2 className="text-xl font-semibold text-slate-800 mb-4">商品列表</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockProducts.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
              <div className="aspect-square bg-slate-100 rounded-lg mb-3" />
              <div className="font-medium text-slate-800">{p.name}</div>
              <div className="text-slate-500 mt-1">NT$ {p.price}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
