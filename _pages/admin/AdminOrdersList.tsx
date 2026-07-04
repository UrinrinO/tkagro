'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';

const API_URL = '';

type Status = 'All' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  created_at: string;
  items: any[];
  total: string;
  status: string;
  payment_method: string;
}

const STATUS_COLORS: Record<string, string> = {
  Delivered:  'bg-green-100 text-green-800',
  Shipped:    'bg-blue-100 text-blue-800',
  Processing: 'bg-purple-100 text-purple-800',
  Pending:    'bg-yellow-100 text-yellow-800',
  Cancelled:  'bg-red-100 text-red-800',
};

const TABS: Status[] = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Status>('All');
  const [search, setSearch] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (tab !== 'All') params.set('status', tab);
      if (search) params.set('search', search);
      const res = await apiFetch(`${API_URL}/api/admin/orders?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setOrders(json.data.orders);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'All' ? orders.length : orders.filter((o) => o.status === t).length;
    return acc;
  }, {} as Record<Status, number>);

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          placeholder="Search by order # or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === t ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}
          >
            {t}
            {counts[t] > 0 && (
              <span className={`ml-1.5 ${tab === t ? 'text-white/70' : 'text-gray-400'}`}>{counts[t]}</span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-5 py-4"><div className="h-5 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400 italic">No orders yet.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono font-semibold text-primary whitespace-nowrap">{o.order_number}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{o.customer_name}</p>
                      <p className="text-[11px] text-gray-400">{o.customer_email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{fmtDate(o.created_at)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{Array.isArray(o.items) ? o.items.length : '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">£{parseFloat(o.total).toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{o.payment_method}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/orders/${o.id}`} className="text-xs font-medium text-primary hover:underline whitespace-nowrap">View →</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {loading ? 'Loading…' : `${orders.length} orders`}
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersList;
