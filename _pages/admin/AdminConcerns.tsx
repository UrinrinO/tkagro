'use client';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = '';

interface Concern {
  id: string;
  slug: string;
  name: string;
  icon: string;
  shortDescription: string;
  sortOrder: number;
}

const AdminConcerns: React.FC = () => {
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const load = () => {
    setLoading(true);
    apiFetch(`${API_URL}/api/admin/concerns`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message);
        setConcerns(json.data.concerns);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`${API_URL}/api/admin/concerns/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setConcerns((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-400 animate-pulse">Loading concerns…</div>;
  if (error) return <div className="p-8 text-sm text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Skin Concerns</h2>
          <p className="text-sm text-gray-500 mt-0.5">{concerns.length} concern{concerns.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => router.push('/admin/concerns/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Add Concern
        </button>
      </div>

      {concerns.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">
          No concerns yet.{' '}
          <button onClick={() => router.push('/admin/concerns/new')} className="text-primary hover:underline">
            Add your first concern
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Concern</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Short Description</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {concerns.map((concern) => (
                <tr key={concern.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">{concern.icon}</span>
                      <span className="font-medium text-gray-900">{concern.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{concern.slug}</code>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-gray-500 max-w-xs truncate">
                    {concern.shortDescription || <span className="text-gray-300 italic">—</span>}
                  </td>
                  <td className="px-5 py-4 text-center text-gray-500">{concern.sortOrder}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/concerns/${concern.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(concern.id, concern.name)}
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminConcerns;
