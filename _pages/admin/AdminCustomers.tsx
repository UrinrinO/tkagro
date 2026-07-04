'use client';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';

const API_URL = '';

interface Customer {
  name: string;
  email: string;
  phone: string | null;
  orders: number;
  spend: number;
  joined: string;
}

const AVATAR_BG = ['bg-primary-pale text-primary', 'bg-accent-pale text-accent', 'bg-blue-50 text-blue-700', 'bg-purple-50 text-purple-700'];
const initials = (name: string) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    apiFetch(`${API_URL}/api/admin/customers${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCustomers(json.data.customers);
        else setError(json.message);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
        <span className="text-sm text-gray-500 flex-shrink-0">{customers.length} customers</span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Customer', 'Email', 'Orders', 'Total Spend', 'First Order'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-5 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400 italic">No customers yet.</td></tr>
              ) : (
                customers.map((c, i) => (
                  <tr key={c.email} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_BG[i % AVATAR_BG.length]}`}>
                          {initials(c.name)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{c.email}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-900">{c.orders}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">£{c.spend.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{fmtDate(c.joined)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {loading ? 'Loading…' : `Showing ${customers.length} customers`}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
