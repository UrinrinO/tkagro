'use client';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const API_URL = '';

const TYPE_OPTIONS = [
  { value: 'traditional_african', label: 'Traditional African' },
  { value: 'natural', label: 'Natural' },
  { value: 'organic', label: 'Organic' },
  { value: 'herbal', label: 'Herbal' },
  { value: 'vegan', label: 'Vegan' },
];

interface FormData {
  name: string;
  origin: string;
  type: string;
  description: string;
  detail: string;
  benefits: string;
  sortOrder: string;
}

const INITIAL: FormData = {
  name: '',
  origin: '',
  type: 'natural',
  description: '',
  detail: '',
  benefits: '',
  sortOrder: '0',
};

const inputCls = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30';

const AdminIngredientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`${API_URL}/api/admin/ingredients`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message);
        const i = json.data.ingredients.find((x: any) => x.id === id);
        if (!i) throw new Error('Ingredient not found');
        setForm({
          name: i.name,
          origin: i.origin,
          type: i.type,
          description: i.description ?? '',
          detail: i.detail ?? '',
          benefits: (i.benefits ?? []).join('\n'),
          sortOrder: String(i.sortOrder ?? 0),
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const benefits = form.benefits
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const body = {
        name: form.name,
        origin: form.origin,
        type: form.type,
        description: form.description,
        detail: form.detail || null,
        benefits,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
      };

      const url = isEdit ? `${API_URL}/api/admin/ingredients/${id}` : `${API_URL}/api/admin/ingredients`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      router.push('/admin/ingredients');
    } catch (err: any) {
      setError(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`${API_URL}/api/admin/ingredients/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      router.push('/admin/ingredients');
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading…</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <Link href="/admin/ingredients" className="text-xs text-gray-500 hover:text-primary flex items-center gap-1">
        ← Back to Ingredients
      </Link>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">{isEdit ? 'Edit Ingredient' : 'New Ingredient'}</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {isEdit ? `Editing: ${form.name}` : 'Add a new ingredient to the transparency library'}
        </p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="name">
              Name <span className="text-red-500">*</span>
            </label>
            <input id="name" type="text" value={form.name} onChange={set('name')} required
              placeholder="e.g. Shea Butter" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="sortOrder">Display Order</label>
            <input id="sortOrder" type="number" min="0" value={form.sortOrder} onChange={set('sortOrder')} className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="origin">
              Origin <span className="text-red-500">*</span>
            </label>
            <input id="origin" type="text" value={form.origin} onChange={set('origin')} required
              placeholder="e.g. West Africa" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="type">
              Type <span className="text-red-500">*</span>
            </label>
            <select id="type" value={form.type} onChange={set('type')} required className={inputCls}>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Descriptions</h3>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="description">
            Short Description <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(shown on the ingredient card)</span>
          </label>
          <textarea id="description" value={form.description} onChange={set('description')} rows={2} required
            placeholder="A rich, deeply moisturising butter that soothes and repairs dry skin."
            className={`${inputCls} resize-none`} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="detail">
            Detail <span className="text-gray-400 font-normal">(shown in the ingredient detail modal, optional)</span>
          </label>
          <textarea id="detail" value={form.detail} onChange={set('detail')} rows={4}
            placeholder="Cold-pressed from the nuts of the shea tree, traditionally used across West Africa for centuries..."
            className={`${inputCls} resize-none`} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Key Benefits</h3>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="benefits">
            Bullet points <span className="text-gray-400 font-normal">(one per line, optional)</span>
          </label>
          <textarea id="benefits" value={form.benefits} onChange={set('benefits')} rows={5}
            placeholder={"Deeply moisturises and repairs the skin barrier\nRich in vitamins A and E\nSoothes irritation and inflammation"}
            className={`${inputCls} resize-y font-mono text-xs`} />
        </div>
      </div>

      <div className="flex items-center gap-3 pb-8">
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Ingredient'}
        </button>
        <Link href="/admin/ingredients"
          className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </Link>
        {isEdit && (
          <button type="button" onClick={handleDelete}
            className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium">
            Delete Ingredient
          </button>
        )}
      </div>
    </form>
  );
};

export default AdminIngredientForm;
