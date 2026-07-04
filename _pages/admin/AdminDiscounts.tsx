'use client';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';

const API_URL = '';

interface Discount {
  id: string;
  code: string;
  type: '%' | 'fixed';
  value: number;
  min_order: number;
  uses: number;
  use_limit: number | null;
  expires_at: string | null;
  active: boolean;
}

const EMPTY_FORM = { code: '', type: '%' as '%' | 'fixed', value: '', minOrder: '', expires: '', limit: '' };

const AdminDiscounts: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchDiscounts = () => {
    setLoading(true);
    apiFetch(`${API_URL}/api/admin/discounts`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setDiscounts(json.data.discounts); else setError(json.message); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchDiscounts, []);

  const handleCreate = async () => {
    if (!form.code || !form.value) return;
    setSaving(true);
    try {
      const res = await apiFetch(`${API_URL}/api/admin/discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: form.code, type: form.type, value: form.value, minOrder: form.minOrder, useLimit: form.limit, expiresAt: form.expires }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setDiscounts((ds) => [json.data.discount, ...ds]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await apiFetch(`${API_URL}/api/admin/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !current }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setDiscounts((ds) => ds.map((d) => d.id === id ? { ...d, active: !current } : d));
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Delete discount "${code}"?`)) return;
    try {
      const res = await apiFetch(`${API_URL}/api/admin/discounts/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setDiscounts((ds) => ds.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
    }
  };

  const fmtExpiry = (s: string | null) => s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No expiry';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{discounts.filter((d) => d.active).length} active codes</p>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors">
          {showForm ? 'Cancel' : '+ New Discount'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Create Discount Code</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Code', key: 'code' as const, placeholder: 'SUMMER20', span: 'col-span-2 sm:col-span-1' },
            ].map(({ label, key, placeholder, span }) => (
              <div key={key} className={span}>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{label}</label>
                <input type="text" placeholder={placeholder} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase" />
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as '%' | 'fixed' }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="%">% Off</option>
                <option value="fixed">£ Off</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Value</label>
              <input type="number" placeholder="10" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Min Order (£)</label>
              <input type="number" placeholder="0" value={form.minOrder} onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Expires</label>
              <input type="date" value={form.expires} onChange={(e) => setForm((f) => ({ ...f, expires: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={handleCreate} disabled={saving}
                className="w-full py-2 bg-accent text-brand-dark text-sm font-semibold rounded-lg hover:bg-accent-light transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Code', 'Discount', 'Min Order', 'Usage', 'Expires', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-5 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : discounts.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400 italic">No discount codes yet.</td></tr>
              ) : (
                discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded">{d.code}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-primary">
                      {d.value}{d.type === '%' ? '%' : '£'} off
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">£{d.min_order.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{d.uses}{d.use_limit ? `/${d.use_limit}` : ''} uses</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{fmtExpiry(d.expires_at)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${d.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {d.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => toggleActive(d.id, d.active)}
                          className={`text-xs font-medium ${d.active ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}>
                          {d.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button type="button" onClick={() => handleDelete(d.id, d.code)} className="text-xs font-medium text-red-500 hover:text-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDiscounts;
