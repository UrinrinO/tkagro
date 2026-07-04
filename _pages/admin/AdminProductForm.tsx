'use client';
import React, { useState, useEffect, type FormEvent } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/ImageUpload';

const API_URL = '';

const CATEGORIES = ['skincare', 'haircare', 'body', 'accessories', 'wellness'];

interface FormData {
  name: string; tagline: string; shortDescription: string; description: string;
  price: string; compareAtPrice: string; category: string; concern: string;
  imageUrl: string; weightGrams: string; stockCount: string; inStock: boolean; isNew: boolean; isBestSeller: boolean;
}

const INITIAL: FormData = {
  name: '', tagline: '', shortDescription: '', description: '',
  price: '', compareAtPrice: '', category: '', concern: '',
  imageUrl: '', weightGrams: '', stockCount: '', inStock: true, isNew: false, isBestSeller: false,
};

const Field: React.FC<{ label: string; id: string; required?: boolean; hint?: string; children: React.ReactNode }> = ({ label, id, required, hint, children }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const inputCls = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30';

const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [concerns, setConcerns] = useState<{ slug: string; name: string }[]>([]);

  useEffect(() => {
    apiFetch(`${API_URL}/api/admin/concerns`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setConcerns(json.data.concerns.map((c: any) => ({ slug: c.slug, name: c.name })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`${API_URL}/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message);
        const p = json.data.product;
        setForm({
          name: p.name, tagline: p.tagline, shortDescription: p.shortDescription,
          description: p.description, price: String(p.price),
          compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
          category: p.category, concern: (p.concern ?? []).join(', '),
          imageUrl: p.imageUrl, weightGrams: p.weightGrams ? String(p.weightGrams) : '',
          stockCount: p.stockCount !== null && p.stockCount !== undefined ? String(p.stockCount) : '',
          inStock: p.inStock, isNew: p.isNew, isBestSeller: p.isBestSeller,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const setCheck = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.checked }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = {
        name: form.name, tagline: form.tagline, shortDescription: form.shortDescription,
        description: form.description, price: form.price,
        compareAtPrice: form.compareAtPrice || null,
        category: form.category,
        concern: form.concern ? form.concern.split(',').map((s) => s.trim()).filter(Boolean) : [],
        imageUrl: form.imageUrl, weightGrams: form.weightGrams || null,
        stockCount: form.stockCount !== '' ? form.stockCount : null,
        inStock: form.inStock, isNew: form.isNew, isBestSeller: form.isBestSeller,
      };
      const url = isEdit ? `${API_URL}/api/admin/products/${id}` : `${API_URL}/api/admin/products`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`${API_URL}/api/admin/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      router.push('/admin/products');
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading product…</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <Link href="/admin/products" className="text-xs text-gray-500 hover:text-primary flex items-center gap-1">
        ← Back to Products
      </Link>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{isEdit ? `Editing: ${form.name}` : 'Fill in the details below'}</p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Product Details</h3>
            <Field label="Product Name" id="name" required>
              <input id="name" type="text" value={form.name} onChange={set('name')} className={inputCls} required />
            </Field>
            <Field label="Tagline" id="tagline" hint="Short marketing line shown under the name">
              <input id="tagline" type="text" value={form.tagline} onChange={set('tagline')} className={inputCls} />
            </Field>
            <Field label="Short Description" id="shortDesc" hint="1–2 sentences shown on product cards">
              <textarea id="shortDesc" value={form.shortDescription} onChange={set('shortDescription')} rows={2} className={`${inputCls} resize-none`} />
            </Field>
            <Field label="Full Description" id="desc" hint="Shown on the product detail page">
              <textarea id="desc" value={form.description} onChange={set('description')} rows={6} className={`${inputCls} resize-y`} />
            </Field>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Pricing & Shipping</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (£)" id="price" required>
                <input id="price" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} className={inputCls} required />
              </Field>
              <Field label="Compare At Price (£)" id="comparePrice" hint="Shown as a strikethrough 'was' price">
                <input id="comparePrice" type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={set('compareAtPrice')} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Weight (grams)" id="weightGrams" hint="Used to calculate shipping costs">
                <input id="weightGrams" type="number" min="0" step="1" value={form.weightGrams} onChange={set('weightGrams')} className={inputCls} placeholder="e.g. 250" />
              </Field>
              <Field label="Stock Count" id="stockCount" hint="Shows 'Low stock' warning below 5">
                <input id="stockCount" type="number" min="0" step="1" value={form.stockCount} onChange={set('stockCount')} className={inputCls} placeholder="e.g. 20" />
              </Field>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Organisation</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" id="category" required>
                <select id="category" value={form.category} onChange={set('category')} className={inputCls} required>
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </Field>
              <Field label="Concerns" id="concern" hint="Select all that apply (or type slugs comma-separated)">
                {concerns.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {concerns.map((c) => {
                      const active = form.concern.split(',').map((s) => s.trim()).includes(c.slug);
                      return (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => {
                            const current = form.concern.split(',').map((s) => s.trim()).filter(Boolean);
                            const next = active ? current.filter((s) => s !== c.slug) : [...current, c.slug];
                            setForm((f) => ({ ...f, concern: next.join(', ') }));
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${active ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input id="concern" type="text" value={form.concern} onChange={set('concern')} className={inputCls} placeholder="acne, dry-skin" />
                )}
              </Field>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Product Image</h3>
            <ImageUpload
              value={form.imageUrl}
              onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
              folder="products"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Availability & Labels</h3>
            {([
              { key: 'inStock', label: 'In Stock', desc: 'Available to purchase' },
              { key: 'isNew', label: 'New Drop', desc: 'Show a "New" badge' },
              { key: 'isBestSeller', label: 'Best Seller', desc: 'Show a "Best Seller" badge' },
            ] as const).map(({ key, label, desc }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={Boolean(form[key])} onChange={setCheck(key)}
                  className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pb-8">
        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
        </button>
        <Link href="/admin/products" className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </Link>
        {isEdit && (
          <button type="button" onClick={handleDelete} className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium">
            Delete Product
          </button>
        )}
      </div>
    </form>
  );
};

export default AdminProductForm;
