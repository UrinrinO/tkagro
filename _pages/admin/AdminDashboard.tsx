'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/apiFetch';

const API_URL = '';

const STATUS_COLORS: Record<string, string> = {
  Delivered:  'bg-green-100 text-green-800',
  Shipped:    'bg-blue-100 text-blue-800',
  Processing: 'bg-purple-100 text-purple-800',
  Pending:    'bg-yellow-100 text-yellow-800',
  Cancelled:  'bg-red-100 text-red-800',
};

interface Stats {
  totalRevenue: number;
  ordersThisMonth: number;
  activeProducts: number;
  totalProducts: number;
  totalCustomers: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: string;
  status: string;
  created_at: string;
}

interface TopProduct {
  id: string;
  name: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`${API_URL}/api/admin/dashboard`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStats(json.data.stats);
          setRecentOrders(json.data.recentOrders);
          setTopProducts(json.data.topProducts);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const statCards = stats
    ? [
        { label: 'Total Revenue',        value: fmt(stats.totalRevenue),    note: 'all time', icon: '£' },
        { label: 'Orders This Month',     value: String(stats.ordersThisMonth), note: 'this month', icon: '📦' },
        { label: 'Active Products',       value: `${stats.activeProducts} / ${stats.totalProducts}`, note: 'in stock', icon: '🏷️' },
        { label: 'Total Customers',       value: String(stats.totalCustomers), note: 'unique buyers', icon: '👤' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Live data from your store.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map(({ label, value, note, icon }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider leading-tight">{label}</p>
                <div className="w-9 h-9 bg-primary-pale rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                  {icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{note}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-primary font-medium hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-gray-400 italic">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Order', 'Customer', 'Date', 'Total', 'Status'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-xs font-mono font-medium text-primary">
                        <Link href={`/admin/orders/${o.id}`} className="hover:underline">{o.order_number}</Link>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">{o.customer_name}</td>
                      <td className="px-6 py-3 text-xs text-gray-500">{fmtDate(o.created_at)}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">£{parseFloat(o.total).toFixed(2)}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Best Sellers */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Best Sellers</h3>
            </div>
            {loading ? (
              <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : topProducts.length === 0 ? (
              <p className="p-5 text-sm text-gray-400 italic">No best-sellers marked yet.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {topProducts.map(({ id, name }, i) => (
                  <li key={id} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-5 h-5 rounded-full bg-primary-pale text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs font-medium text-gray-900 truncate">{name}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/admin/products/new" className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors">
                + Add New Product
              </Link>
              <Link href="/admin/orders" className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                📦 View All Orders
              </Link>
              <Link href="/admin/blog/new" className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                ✏️ Write a Blog Post
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
