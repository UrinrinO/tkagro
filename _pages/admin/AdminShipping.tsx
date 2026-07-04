'use client';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';

const API_URL = '';

interface Zone {
  id: string;
  name: string;
  countries: string[];
  base_price: number;
  price_per_gram: number;
  estimated_days: string;
  free_above: number | null;
  active: boolean;
}

const EMPTY: Omit<Zone, 'id'> = {
  name: '', countries: [], base_price: 0, price_per_gram: 0,
  estimated_days: '', free_above: null, active: true,
};

const inputCls = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30';

const AdminShipping: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Zone | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countriesText, setCountriesText] = useState('');

  const load = () => {
    setLoading(true);
    apiFetch(`${API_URL}/api/admin/shipping/zones`)
      .then(async (r) => {
        if (!r.headers.get('content-type')?.includes('application/json')) return;
        const j = await r.json();
        if (j.success) setZones(j.data.zones);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({ id: '', ...EMPTY });
    setCountriesText('');
    setIsNew(true);
    setError(null);
  };

  const openEdit = (z: Zone) => {
    setEditing({ ...z });
    setCountriesText((z.countries ?? []).join(', '));
    setIsNew(false);
    setError(null);
  };

  const close = () => { setEditing(null); setIsNew(false); setError(null); };

  const set = (k: keyof Omit<Zone, 'id'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.type === 'checkbox' ? e.target.checked :
                  e.target.type === 'number'   ? e.target.value   : e.target.value;
      setEditing((prev) => prev ? { ...prev, [k]: val } : prev);
    };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: editing.name,
        countries: countriesText.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
        basePrice: editing.base_price,
        pricePerGram: editing.price_per_gram,
        estimatedDays: editing.estimated_days,
        freeAbove: editing.free_above,
        active: editing.active,
      };
      const url = isNew
        ? `${API_URL}/api/admin/shipping/zones`
        : `${API_URL}/api/admin/shipping/zones/${editing.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Guard: if the server returned non-JSON (e.g. 404 HTML), surface a clear error
      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server error ${res.status} — make sure the backend is running and the migration has been applied.`);
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      load();
      close();
    } catch (e: any) {
      setError(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete zone "${name}"?`)) return;
    await apiFetch(`${API_URL}/api/admin/shipping/zones/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleActive = async (zone: Zone) => {
    await apiFetch(`${API_URL}/api/admin/shipping/zones/${zone.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !zone.active }),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mt-0.5">
            Weight-based shipping rates by destination zone. Price = base fee + (weight in grams × price per gram).
          </p>
        </div>
        <button onClick={openNew}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
          + Add Zone
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {zones.map((zone) => (
            <div key={zone.id} className={`bg-white rounded-xl border shadow-sm p-5 ${zone.active ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{zone.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${zone.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {zone.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600 mt-3">
                    <div>
                      <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px] mb-0.5">Base price</p>
                      <p className="font-semibold text-gray-900">£{Number(zone.base_price).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px] mb-0.5">Per gram</p>
                      <p className="font-semibold text-gray-900">£{Number(zone.price_per_gram).toFixed(5)}</p>
                      <p className="text-gray-400 text-[10px]">(£{(Number(zone.price_per_gram) * 1000).toFixed(2)} per kg)</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px] mb-0.5">Delivery</p>
                      <p className="font-semibold text-gray-900">{zone.estimated_days || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px] mb-0.5">Free above</p>
                      <p className="font-semibold text-gray-900">{zone.free_above ? `£${Number(zone.free_above).toFixed(2)}` : 'Never'}</p>
                    </div>
                  </div>

                  {zone.countries?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wide mb-1">Countries ({zone.countries.length})</p>
                      <p className="text-xs text-gray-600 leading-relaxed font-mono">
                        {zone.countries.join(', ')}
                      </p>
                    </div>
                  )}
                  {(!zone.countries || zone.countries.length === 0) && (
                    <p className="mt-2 text-xs text-amber-600 font-medium">⚡ Fallback zone — applies to all unmatched countries</p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(zone)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                    {zone.active ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => openEdit(zone)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(zone.id, zone.name)}
                    className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {zones.length === 0 && (
            <div className="text-center py-16 text-sm text-gray-400">
              No shipping zones yet. Add one to enable shipping at checkout.
            </div>
          )}
        </div>
      )}

      {/* ── Shipping cost calculator preview ── */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">How shipping is calculated</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong>Shipping cost = Base price + (Total weight in grams × Price per gram)</strong><br />
          Example: A UK order with 500g of products at the current UK rate would cost:
          £{(3.99 + 500 * 0.005).toFixed(2)} (£3.99 base + 500g × £0.005/g).<br />
          Products without a weight set contribute 0g — make sure to set weights on all products.
        </p>
      </div>

      {/* ── Edit / New modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">{isNew ? 'New Shipping Zone' : `Edit: ${editing.name}`}</h2>
            </div>

            <div className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Zone Name <span className="text-red-500">*</span></label>
                <input type="text" value={editing.name} onChange={set('name')} className={inputCls} placeholder="e.g. United Kingdom" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Base Price (£)</label>
                  <input type="number" min="0" step="0.01" value={editing.base_price} onChange={set('base_price')} className={inputCls} placeholder="3.99" />
                  <p className="text-xs text-gray-400 mt-1">Flat fee regardless of weight</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Price per Gram (£)</label>
                  <input type="number" min="0" step="0.00001" value={editing.price_per_gram} onChange={set('price_per_gram')} className={inputCls} placeholder="0.00500" />
                  <p className="text-xs text-gray-400 mt-1">£{editing.price_per_gram ? (Number(editing.price_per_gram) * 1000).toFixed(3) : '0.000'} per kg</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Estimated Delivery</label>
                  <input type="text" value={editing.estimated_days} onChange={set('estimated_days')} className={inputCls} placeholder="2–3 business days" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Free Shipping Above (£)</label>
                  <input type="number" min="0" step="0.01"
                    value={editing.free_above ?? ''}
                    onChange={(e) => setEditing((prev) => prev ? { ...prev, free_above: e.target.value ? parseFloat(e.target.value) : null } : prev)}
                    className={inputCls} placeholder="50.00 (leave blank to disable)" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Country Codes <span className="text-gray-400 font-normal">(comma-separated ISO 2-letter codes)</span>
                </label>
                <textarea
                  value={countriesText}
                  onChange={(e) => setCountriesText(e.target.value)}
                  rows={3}
                  className={`${inputCls} font-mono text-xs resize-none`}
                  placeholder="GB, GG, JE, IM"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty to make this a fallback zone (applies to all unmatched countries).
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.active}
                  onChange={(e) => setEditing((prev) => prev ? { ...prev, active: e.target.checked } : prev)}
                  className="rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm text-gray-700">Zone is active</span>
              </label>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={handleSave} disabled={saving || !editing.name}
                className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : isNew ? 'Create Zone' : 'Save Changes'}
              </button>
              <button onClick={close} className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShipping;
