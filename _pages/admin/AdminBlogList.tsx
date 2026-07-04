'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';

const API_URL = '';

interface Post {
  id: string;
  title: string;
  category: string;
  status: string;
  readTime: number | null;
  createdAt: string;
  published: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-100 text-green-800',
  draft:     'bg-gray-100 text-gray-600',
};

const CATEGORY_COLORS: Record<string, string> = {
  skincare_tips:    'bg-primary-pale text-primary',
  ingredients:      'bg-accent-pale text-accent',
  hair_care:        'bg-blue-50 text-blue-700',
  wellness:         'bg-purple-50 text-purple-700',
  self_care_guides: 'bg-green-50 text-green-700',
  brand_story:      'bg-yellow-50 text-yellow-700',
};

const AdminBlogList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'published' | 'draft'>('All');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== 'All' ? `?status=${filter}` : '';
      const res = await apiFetch(`${API_URL}/api/admin/blog${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setPosts(json.data.posts);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`${API_URL}/api/admin/blog/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setPosts((ps) => ps.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const counts = {
    All:       posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    draft:     posts.filter((p) => p.status === 'draft').length,
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2">
          {(['All', 'published', 'draft'] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === f ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 bg-white hover:border-primary hover:text-primary'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={`ml-1.5 ${filter === f ? 'text-white/70' : 'text-gray-400'}`}>{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <Link href="/admin/blog/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors flex-shrink-0">
          + New Post
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Post', 'Category', 'Read Time', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-5 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : posts.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400 italic">No posts yet.</td></tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900 leading-snug max-w-xs">{post.title}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                        {post.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{post.readTime ? `${post.readTime} min` : '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[post.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{fmtDate(post.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/blog/${post.id}`} className="text-xs font-medium text-primary hover:underline">Edit</Link>
                        <button type="button" onClick={() => handleDelete(post.id, post.title)} className="text-xs font-medium text-red-500 hover:text-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {loading ? 'Loading…' : `${posts.length} posts`}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogList;
