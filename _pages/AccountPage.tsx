'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { apiFetch } from '@/lib/apiFetch';
import PageSEO from '@/components/SEO/PageSEO';

const API_URL = '';

const BANNER_IMG = 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1400&q=85&fit=crop';

type Tab = 'profile' | 'orders' | 'wishlist';

interface Profile { firstName: string; lastName: string; phone: string; email: string }
interface Order {
  id: string; orderNumber: string; status: string;
  total: number; createdAt: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}
interface WishlistProduct {
  id: string; product_id: string;
  products: { id: string; name: string; slug: string; price: number; image_url: string; category: string };
}

const STATUS_COLORS: Record<string, string> = {
  Processing: 'bg-blue-50 text-blue-700 border border-blue-100',
  Shipped:    'bg-amber-50 text-amber-700 border border-amber-100',
  Delivered:  'bg-green-50 text-green-700 border border-green-100',
  Cancelled:  'bg-red-50 text-red-600 border border-red-100',
  Refunded:   'bg-gray-100 text-gray-500 border border-gray-200',
};

/* ─── AccountPage ───────────────────────────────────────────────────────────── */
const AccountPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('profile');

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  const handleSignOut = async () => { await signOut(); router.push('/'); };

  if (!user) return null;

  const initial = (user.email?.[0] ?? '?').toUpperCase();

  return (
    <>
      <PageSEO title="My Account" description="Manage your T.kays account, orders and wishlist." canonicalPath="/account" />

      <div className="min-h-screen bg-[#F7F6F3] pt-20">

        {/* ── Hero banner ── */}
        <div className="relative h-52 sm:h-64 overflow-hidden">
          <img src={BANNER_IMG} alt="" aria-hidden="true"
            className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(201,151,58,0.65) 0%, rgba(122,59,46,0.8) 55%, rgba(62,107,48,0.7) 100%)' }} />
          {/* Decorative word mark */}
          <div className="absolute bottom-6 left-0 right-0 max-w-5xl mx-auto px-4 lg:px-8">
            <p className="text-white/30 font-heading text-xs tracking-[0.3em] uppercase font-bold">T.kays Agrocosmetics</p>
          </div>
        </div>

        {/* ── Identity strip ── */}
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between -mt-12 mb-0 pb-5">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white text-2xl sm:text-3xl font-bold font-heading flex-shrink-0"
                style={{ background: 'linear-gradient(145deg, #C9973A 0%, #7A3B2E 100%)' }}>
                {initial}
              </div>
              <div className="pb-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 tracking-[0.18em] uppercase mb-0.5">Member Account</p>
                <p className="text-sm sm:text-base font-bold text-gray-800 truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={handleSignOut}
              className="pb-1 text-xs text-gray-400 hover:text-red-500 transition-colors font-semibold flex items-center gap-1.5 flex-shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white border-b border-gray-100 sticky top-20 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 flex">
            {([
              { key: 'profile',  label: 'Profile' },
              { key: 'orders',   label: 'Orders' },
              { key: 'wishlist', label: 'Wishlist' },
            ] as { key: Tab; label: string }[]).map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setTab(key)}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all duration-200 ${
                  tab === key
                    ? 'border-[#C9973A] text-[#7A3B2E]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
          {tab === 'profile'  && <ProfileTab />}
          {tab === 'orders'   && <OrdersTab />}
          {tab === 'wishlist' && <WishlistTab />}
        </div>
      </div>
    </>
  );
};

/* ─── Profile Tab ───────────────────────────────────────────────────────────── */
const ProfileTab: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile]   = useState<Profile>({ firstName: '', lastName: '', phone: '', email: user?.email ?? '' });
  const [orders, setOrders]     = useState(0);
  const [wishlist, setWishlist] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch(`${API_URL}/api/account/me`).then((r) => r.json()),
      apiFetch(`${API_URL}/api/account/orders`).then((r) => r.json()),
      supabase.from('wishlists').select('id', { count: 'exact', head: true }),
    ]).then(([me, ord, wish]) => {
      if (me.success) setProfile(me.data);
      if (ord.success) setOrders(ord.data.orders?.length ?? 0);
      setWishlist(wish.count ?? 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    try {
      const res = await apiFetch(`${API_URL}/api/account/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = [
    'w-full px-4 py-3.5 text-sm bg-white rounded-xl border border-gray-200',
    'focus:outline-none focus:border-[#C9973A]/60 focus:ring-2 focus:ring-[#C9973A]/10 transition-all',
  ].join(' ');

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-3 gap-4">{[0,1,2].map(i => <div key={i} className="h-28 bg-white rounded-2xl"/>)}</div>
      <div className="h-72 bg-white rounded-2xl"/>
    </div>
  );

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');

  return (
    <div className="space-y-5">

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Orders Placed', value: String(orders), sub: orders === 1 ? 'order' : 'orders' },
          { label: 'Wishlist', value: String(wishlist), sub: wishlist === 1 ? 'item saved' : 'items saved' },
          { label: 'Membership', value: 'Active', sub: 'T.kays member' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6">
            <p className="text-3xl font-bold font-heading text-gray-900">{value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
            <p className="text-xs text-gray-300 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="px-6 lg:px-8 py-5 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 font-heading">
              {displayName || 'Personal Details'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Update your name and contact info</p>
          </div>
          {saved && (
            <span className="text-xs font-bold text-[#3E6B30] bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
              Saved ✓
            </span>
          )}
        </div>

        <div className="px-6 lg:px-8 py-6">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">{error}</p>}

          <form onSubmit={handleSave} className="space-y-5 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="firstName">First Name</label>
                <input id="firstName" type="text" value={profile.firstName}
                  onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                  className={inputCls} placeholder="Adaeze" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="lastName">Last Name</label>
                <input id="lastName" type="text" value={profile.lastName}
                  onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                  className={inputCls} placeholder="Obi" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="email">Email Address</label>
              <input id="email" type="email" value={profile.email} disabled
                className={`${inputCls} text-gray-300 cursor-not-allowed bg-gray-50`} />
              <p className="text-xs text-gray-300 mt-1.5">Email address cannot be changed here.</p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="phone">Phone Number</label>
              <input id="phone" type="tel" value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                className={inputCls} placeholder="+44 7700 000000" />
            </div>
            <button type="submit" disabled={saving}
              className="px-8 py-3.5 text-sm font-bold text-white rounded-xl tracking-wide transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #C9973A 0%, #7A3B2E 100%)' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ─── Orders Tab ─────────────────────────────────────────────────────────────── */
const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`${API_URL}/api/account/orders`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setOrders(json.data.orders); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-3">
      {[0,1,2].map((i) => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #C9973A20, #7A3B2E20)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9973A" strokeWidth="1.5" strokeLinecap="round">
          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
      </div>
      <p className="font-heading text-lg font-bold text-gray-900 mb-1">No orders yet</p>
      <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">Your order history will appear here after your first purchase.</p>
      <Link href="/catalog"
        className="inline-flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl transition-all"
        style={{ background: 'linear-gradient(135deg, #C9973A 0%, #7A3B2E 100%)' }}>
        Shop Now
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
      </Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-mono text-sm font-bold text-gray-900">{order.orderNumber}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {order.status}
              </span>
              <span className="text-base font-bold text-gray-900">£{order.total.toFixed(2)}</span>
            </div>
          </div>
          {order.items?.length > 0 && (
            <div className="border-t border-gray-50 pt-3 space-y-1.5">
              {order.items.slice(0, 3).map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-400">
                  <span>{item.name} <span className="text-gray-300">× {item.quantity}</span></span>
                  <span>£{(item.price / 100).toFixed(2)}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-xs text-gray-300">+{order.items.length - 3} more items</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ─── Wishlist Tab ───────────────────────────────────────────────────────────── */
const WishlistTab: React.FC = () => {
  const [items, setItems]     = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlists')
      .select('id, product_id, products(id, name, slug, price, image_url, category)')
      .order('created_at', { ascending: false });
    if (!error && data) setItems(data as unknown as WishlistProduct[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    await supabase.from('wishlists').delete().eq('id', id);
    setItems((prev) => prev.filter((w) => w.id !== id));
  };

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {[0,1,2,3,4,5].map((i) => <div key={i} className="aspect-square rounded-2xl bg-white border border-gray-100 animate-pulse" />)}
    </div>
  );

  if (items.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #C9973A20, #7A3B2E20)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9973A" strokeWidth="1.5" strokeLinecap="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </div>
      <p className="font-heading text-lg font-bold text-gray-900 mb-1">Your wishlist is empty</p>
      <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">Heart products you love and they'll appear here.</p>
      <Link href="/catalog"
        className="inline-flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl transition-all"
        style={{ background: 'linear-gradient(135deg, #C9973A 0%, #7A3B2E 100%)' }}>
        Browse Products
      </Link>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const p = item.products;
        if (!p) return null;
        return (
          <div key={item.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <Link href={`/catalog/${p.slug}`} className="block relative aspect-square overflow-hidden bg-[#F7F6F3]">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-200 text-3xl">🌿</span>
                </div>
              )}
            </Link>
            <div className="p-3.5">
              <p className="text-[10px] font-bold text-[#C9973A] uppercase tracking-widest mb-0.5">{p.category}</p>
              <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2 font-heading">{p.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: '#7A3B2E' }}>£{p.price.toFixed(2)}</span>
                <button onClick={() => remove(item.id)}
                  className="text-xs text-gray-300 hover:text-red-400 transition-colors font-semibold"
                  aria-label={`Remove ${p.name} from wishlist`}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccountPage;
