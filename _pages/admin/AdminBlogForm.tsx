'use client';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/ImageUpload';
import MDEditor from '@uiw/react-md-editor';

const API_URL = '';

const CATEGORIES = [
  { value: 'skincare_tips',    label: 'Skincare Tips' },
  { value: 'ingredients',     label: 'Ingredients' },
  { value: 'hair_care',       label: 'Hair Care' },
  { value: 'wellness',        label: 'Wellness' },
  { value: 'self_care_guides', label: 'Self Care' },
  { value: 'brand_story',     label: 'Brand News' },
];

interface FormData {
  title: string; category: string; excerpt: string; body: string;
  imageUrl: string; status: 'published' | 'draft'; readTime: string; author: string;
}

const INITIAL: FormData = {
  title: '', category: '', excerpt: '', body: '',
  imageUrl: '', status: 'draft', readTime: '', author: '',
};

const AdminBlogForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`${API_URL}/api/admin/blog/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message);
        const p = json.data.post;
        setForm({
          title: p.title, category: p.category, excerpt: p.excerpt,
          body: p.body, imageUrl: p.featuredImage,
          status: p.status as 'published' | 'draft',
          readTime: p.readTime ? String(p.readTime) : '',
          author: p.author?.name ?? '',
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
      const body = { title: form.title, category: form.category, excerpt: form.excerpt, body: form.body, imageUrl: form.imageUrl, status: form.status, readTime: form.readTime || null, author: form.author || undefined };
      const url = isEdit ? `${API_URL}/api/admin/blog/${id}` : `${API_URL}/api/admin/blog`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      router.push('/admin/blog');
    } catch (err: any) {
      setError(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`${API_URL}/api/admin/blog/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      router.push('/admin/blog');
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading post…</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/blog" className="text-xs text-gray-500 hover:text-primary flex items-center gap-1">
        ← Back to Blog
      </Link>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">{isEdit ? 'Edit Post' : 'New Post'}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{isEdit ? `Editing: ${form.title}` : 'Write a new article for the T.kays Journal'}</p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="title">Post Title <span className="text-red-500">*</span></label>
          <input id="title" type="text" value={form.title} onChange={set('title')} required
            placeholder="e.g. 5 Botanical Ingredients That Transform Your Skin"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        {/* Category + Status + Read time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="category">Category <span className="text-red-500">*</span></label>
            <select id="category" value={form.category} onChange={set('category')} required
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="readTime">Read Time (min)</label>
            <input id="readTime" type="number" min="1" value={form.readTime} onChange={set('readTime')} placeholder="5"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
            <div className="flex gap-2 mt-2">
              {(['draft', 'published'] as const).map((s) => (
                <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${form.status === s ? (s === 'published' ? 'bg-green-600 text-white border-green-600' : 'bg-gray-600 text-white border-gray-600') : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Author */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="author">Author <span className="text-gray-400 font-normal">(optional)</span></label>
          <input id="author" type="text" value={form.author} onChange={set('author')} placeholder="T.kays Agrocosmetics"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="excerpt">
            Excerpt <span className="text-gray-400 font-normal">(shown on blog listing)</span>
          </label>
          <textarea id="excerpt" value={form.excerpt} onChange={set('excerpt')} rows={3} placeholder="A short description of the post…"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>

        {/* Featured image */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Featured Image</label>
          <ImageUpload
            value={form.imageUrl}
            onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            folder="blog"
            aspectClass="aspect-video"
          />
        </div>

        {/* Content */}
        <div data-color-mode="light">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Content
          </label>
          <MDEditor
            value={form.body}
            onChange={(val) => setForm((f) => ({ ...f, body: val ?? '' }))}
            height={420}
            preview="live"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : form.status === 'published' ? 'Publish Post' : 'Save Draft'}
          </button>
          <Link href="/admin/blog" className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          {isEdit && (
            <button type="button" onClick={handleDelete} className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium">
              Delete Post
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminBlogForm;
