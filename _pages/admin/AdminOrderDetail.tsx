'use client';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const API_URL = '';

const STATUS_COLORS: Record<string, string> = {
  Delivered:  'bg-green-100 text-green-800',
  Shipped:    'bg-blue-100 text-blue-800',
  Processing: 'bg-purple-100 text-purple-800',
  Pending:    'bg-yellow-100 text-yellow-800',
  Cancelled:  'bg-red-100 text-red-800',
};

const ALL_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

interface OrderData {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: Record<string, string>;
  payment_method: string;
  payment_reference: string | null;
  payment_status: string;
  items: Array<{ id: string; name: string; qty: number; price: number; subtotal: number }>;
  subtotal: string;
  shipping_cost: string;
  discount_amount: string;
  total: string;
}

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`${API_URL}/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message);
        setOrder(json.data.order);
        setStatus(json.data.order.status);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!order || status === order.status) return;
    setUpdating(true);
    setUpdateMsg(null);
    try {
      const res = await apiFetch(`${API_URL}/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setOrder(json.data.order);
      setUpdateMsg('Status updated.');
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (err: any) {
      setUpdateMsg(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading order…</div>;
  if (error || !order) return <div className="p-8 text-sm text-red-600">{error ?? 'Order not found.'}</div>;

  const addr = order.shipping_address ?? {};

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Link href="/admin/orders" className="text-xs text-gray-500 hover:text-primary flex items-center gap-1">
          ← Back to Orders
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {order.status}
          </span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" onClick={handleStatusUpdate} disabled={updating || status === order.status}
            className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors disabled:opacity-40">
            {updating ? 'Saving…' : 'Update'}
          </button>
        </div>
      </div>

      {updateMsg && <p className={`text-sm ${updateMsg.startsWith('Error') ? 'text-red-600' : 'text-green-700'}`}>{updateMsg}</p>}

      <div>
        <h2 className="text-xl font-bold text-gray-900 font-mono">{order.order_number}</h2>
        <p className="text-sm text-gray-500 mt-0.5">Placed on {fmtDate(order.created_at)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Line items */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Order Items</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Product', 'Qty', 'Price', 'Subtotal'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{item.qty}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">£{Number(item.price).toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">£{Number(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-4 border-t border-gray-100 space-y-2 bg-gray-50">
              {[
                { label: 'Subtotal', value: `£${parseFloat(order.subtotal).toFixed(2)}` },
                { label: 'Shipping', value: `£${parseFloat(order.shipping_cost).toFixed(2)}` },
                { label: 'Discount', value: parseFloat(order.discount_amount) > 0 ? `-£${parseFloat(order.discount_amount).toFixed(2)}` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm text-gray-600">
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span><span>£{parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary-pale text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                {order.customer_name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                <p className="text-xs text-gray-500">{order.customer_email}</p>
              </div>
            </div>
            {order.customer_phone && <p className="text-xs text-gray-500">{order.customer_phone}</p>}
          </div>

          {/* Shipping address */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Shipping Address</h3>
            <address className="not-italic text-sm text-gray-600 leading-relaxed space-y-0.5">
              {addr.addressLine1 && <p>{addr.addressLine1}</p>}
              {addr.addressLine2 && <p>{addr.addressLine2}</p>}
              {(addr.city || addr.postcode) && <p>{[addr.city, addr.postcode].filter(Boolean).join(', ')}</p>}
              {addr.county && <p>{addr.county}</p>}
              {addr.country && <p>{addr.country}</p>}
            </address>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900">{order.payment_method}</span>
              </div>
              {order.payment_reference && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono text-xs text-gray-700 truncate max-w-[140px]" title={order.payment_reference}>
                    {order.payment_reference.slice(0, 20)}…
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="text-green-700 font-semibold">{order.payment_status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
