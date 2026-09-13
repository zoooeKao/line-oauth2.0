import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { tokenStore } from '../lib/auth';

type Me = {
  id: number;
  lineId: string;
  lineDisplayName: string;
  linePictureUrl: string;
  oaFriendFlag: boolean;
  oaAddFriendUrl: string;
};

type Recipient = {
  lineId: string;
  lineDisplayName: string;
  linePictureUrl: string;
  oaFriendFlag: boolean;
};

type MulticastResponse = {
  status: string;
  requestId: string;
  sentTo: number;
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
            {me.linePictureUrl && (
              <img src={me.linePictureUrl} alt={me.lineDisplayName} className="w-10 h-10 rounded-full" />
            )}
            <div>
              <div className="font-medium text-slate-800">{me.lineDisplayName}</div>
              <div className="text-xs text-slate-500">{me.lineId}</div>
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
        {!me.oaFriendFlag && (
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

        <BroadcastSection />
      </main>
    </div>
  );
}

function BroadcastSection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [text, setText] = useState('');

  const { data: recipients, isLoading: recipientsLoading, isError: recipientsError } = useQuery<Recipient[]>({
    queryKey: ['recipients'],
    queryFn: async () => (await api.get<Recipient[]>('/api/users/recipients')).data,
  });

  const mutation = useMutation<MulticastResponse, unknown, { lineIds: string[]; text: string }>({
    mutationFn: async (body) => (await api.post<MulticastResponse>('/api/messages/multicast', body)).data,
    onSuccess: () => {
      setText('');
      setSelectedIds([]);
    },
  });

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ids = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setSelectedIds(ids);
  };

  const handleSend = () => {
    if (selectedIds.length === 0 || !text.trim()) return;
    mutation.mutate({ lineIds: selectedIds, text: text.trim() });
  };

  const disabled = selectedIds.length === 0 || !text.trim() || mutation.isPending;

  return (
    <section className="mt-10 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-1">傳送 LINE 訊息（Multicast）</h2>
      <p className="text-sm text-slate-500 mb-4">
        選擇一或多位收件人，輸入文字後發送。未追蹤官方帳號的收件人會被 LINE 靜默略過。
      </p>

      {recipientsLoading && <div className="text-slate-500 text-sm">收件人清單載入中…</div>}
      {recipientsError && <div className="text-red-500 text-sm">無法載入收件人清單</div>}

      {recipients && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              收件人 <span className="text-slate-400 font-normal">（按住 ⌘ / Ctrl 可多選，至少 1 位、最多 500 位）</span>
            </label>
            <select
              multiple
              size={Math.min(Math.max(recipients.length, 3), 8)}
              value={selectedIds}
              onChange={handleSelectChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {recipients.map((r) => (
                <option key={r.lineId} value={r.lineId}>
                  {r.lineDisplayName} — {r.lineId} {r.oaFriendFlag ? '' : '（未追蹤 OA）'}
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-500 mt-1">已選 {selectedIds.length} 位</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              訊息內容 <span className="text-slate-400 font-normal">（最多 5000 字）</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="輸入要發送的訊息…"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="text-xs text-slate-500 mt-1">{text.length} / 5000</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSend}
              disabled={disabled}
              className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed px-5 py-2 rounded-md"
            >
              {mutation.isPending ? '傳送中…' : '發送'}
            </button>

            {mutation.isSuccess && mutation.data && (
              <span className="text-sm text-emerald-700">
                ✓ 已送出 {mutation.data.sentTo} 位（requestId：{mutation.data.requestId ?? '—'}）
              </span>
            )}
            {mutation.isError && (
              <span className="text-sm text-red-600">
                ✗ 發送失敗：{extractErrorMessage(mutation.error)}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as { response?: { status?: number; data?: unknown } }).response;
    if (resp) {
      const body = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
      return `${resp.status} ${body}`;
    }
  }
  return err instanceof Error ? err.message : String(err);
}
