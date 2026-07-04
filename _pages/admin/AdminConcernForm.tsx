'use client';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/ImageUpload';

const API_URL = '';

interface Stat { value: string; label: string }

interface FormData {
  name: string;
  slug: string;
  icon: string;
  sortOrder: string;
  shortDescription: string;
  heroDescription: string;
  metaDescription: string;
  imageUrl: string;
  whyItWorks: string;
  stats: Stat[];
}

const INITIAL: FormData = {
  name: '', slug: '', icon: '🌿', sortOrder: '0',
  shortDescription: '', heroDescription: '', metaDescription: '',
  imageUrl: '', whyItWorks: '',
  stats: [{ value: '', label: '' }, { value: '', label: '' }, { value: '', label: '' }],
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const inputCls = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30';

const AdminConcernForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`${API_URL}/api/admin/concerns`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message);
        const c = json.data.concerns.find((x: any) => x.id === id);
        if (!c) throw new Error('Concern not found');
        const stats: Stat[] = [
          ...(c.stats ?? []).slice(0, 3),
          ...Array(Math.max(0, 3 - (c.stats ?? []).length)).fill({ value: '', label: '' }),
        ];
        setForm({
          name: c.name,
          slug: c.slug,
          icon: c.icon ?? '🌿',
          sortOrder: String(c.sortOrder ?? 0),
          shortDescription: c.shortDescription ?? '',
          heroDescription: c.heroDescription ?? '',
          metaDescription: c.metaDescription ?? '',
          imageUrl: c.imageUrl ?? '',
          whyItWorks: (c.whyItWorks ?? []).join('\n'),
          stats,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((f) => ({ ...f, name, slug: !isEdit || f.slug === slugify(f.name) ? slugify(name) : f.slug }));
  };

  const setStat = (i: number, field: keyof Stat) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => {
        const stats = [...f.stats];
        stats[i] = { ...stats[i], [field]: e.target.value };
        return { ...f, stats };
      });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const whyItWorks = form.whyItWorks
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const stats = form.stats.filter((s) => s.value && s.label);

      const body = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        icon: form.icon || '🌿',
        sortOrder: parseInt(form.sortOrder, 10) || 0,
        shortDescription: form.shortDescription,
        heroDescription: form.heroDescription,
        metaDescription: form.metaDescription,
        imageUrl: form.imageUrl || null,
        whyItWorks,
        stats,
      };

      const url = isEdit ? `${API_URL}/api/admin/concerns/${id}` : `${API_URL}/api/admin/concerns`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      router.push('/admin/concerns');
    } catch (err: any) {
      setError(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`${API_URL}/api/admin/concerns/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      router.push('/admin/concerns');
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading…</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <Link href="/admin/concerns" className="text-xs text-gray-500 hover:text-primary flex items-center gap-1">
        ← Back to Concerns
      </Link>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">{isEdit ? 'Edit Concern' : 'New Concern'}</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {isEdit ? `Editing: ${form.name}` : 'Add a new skin concern category'}
        </p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      {/* Identity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="name">
              Name <span className="text-red-500">*</span>
            </label>
            <input id="name" type="text" value={form.name} onChange={handleNameChange} required
              placeholder="e.g. Hyperpigmentation" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="icon">Icon (emoji)</label>
            <input id="icon" type="text" value={form.icon} onChange={set('icon')} placeholder="🌿" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="slug">
              Slug <span className="text-gray-400 font-normal">(URL identifier)</span>
            </label>
            <input id="slug" type="text" value={form.slug} onChange={set('slug')}
              placeholder="auto-generated from name" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="sortOrder">Display Order</label>
            <input id="sortOrder" type="number" min="0" value={form.sortOrder} onChange={set('sortOrder')} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Descriptions</h3>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="shortDesc">
            Short Description <span className="text-gray-400 font-normal">(shown on concern cards)</span>
          </label>
          <textarea id="shortDesc" value={form.shortDescription} onChange={set('shortDescription')} rows={2}
            placeholder="Even out skin tone with targeted botanical brighteners."
            className={`${inputCls} resize-none`} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="heroDesc">
            Hero Description <span className="text-gray-400 font-normal">(shown on the concern detail page hero)</span>
          </label>
          <textarea id="heroDesc" value={form.heroDescription} onChange={set('heroDescription')} rows={2}
            placeholder="Botanically-powered formulas that visibly even and brighten your skin."
            className={`${inputCls} resize-none`} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="metaDesc">
            Meta Description <span className="text-gray-400 font-normal">(SEO)</span>
          </label>
          <textarea id="metaDesc" value={form.metaDescription} onChange={set('metaDescription')} rows={2}
            placeholder="Shop T.kays Agrocosmetics products for hyperpigmentation…"
            className={`${inputCls} resize-none`} />
        </div>
      </div>

      {/* Image */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Image</h3>
        <ImageUpload
          value={form.imageUrl}
          onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
          folder="concerns"
          aspectClass="aspect-video"
        />
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Stats Strip <span className="text-xs font-normal text-gray-400">(shown on concern detail page, up to 3)</span></h3>
        {form.stats.map((stat, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`stat-val-${i}`}>
                Stat {i + 1} Value
              </label>
              <input id={`stat-val-${i}`} type="text" value={stat.value} onChange={setStat(i, 'value')}
                placeholder="92%" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`stat-lbl-${i}`}>
                Stat {i + 1} Label
              </label>
              <input id={`stat-lbl-${i}`} type="text" value={stat.label} onChange={setStat(i, 'label')}
                placeholder="visible fading in 6 weeks" className={inputCls} />
            </div>
          </div>
        ))}
      </div>

      {/* Why It Works */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Why It Works</h3>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="whyItWorks">
            Bullet points <span className="text-gray-400 font-normal">(one per line)</span>
          </label>
          <textarea id="whyItWorks" value={form.whyItWorks} onChange={set('whyItWorks')} rows={6}
            placeholder={"Turmeric extract inhibits melanin overproduction at the source.\nVitamin C neutralises free-radical damage that causes dark spots.\nRosehip oil accelerates cell renewal for faster tone correction."}
            className={`${inputCls} resize-y font-mono text-xs`} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-8">
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Concern'}
        </button>
        <Link href="/admin/concerns"
          className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </Link>
        {isEdit && (
          <button type="button" onClick={handleDelete}
            className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium">
            Delete Concern
          </button>
        )}
      </div>
    </form>
  );
};

export default AdminConcernForm;
