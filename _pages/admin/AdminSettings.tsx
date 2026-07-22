'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/apiFetch';

const API_URL = '';

type Tab = 'store' | 'payment' | 'shipping' | 'notifications';

const TABS: { key: Tab; label: string }[] = [
  { key: 'store',         label: 'Store Info' },
  { key: 'payment',       label: 'Payment' },
  { key: 'shipping',      label: 'Shipping' },
  { key: 'notifications', label: 'Notifications' },
];

interface StoreInfo {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
}

interface NotificationSettings {
  orderConfirm: boolean;
  shipUpdate: boolean;
  lowStock: boolean;
  weeklyReport: boolean;
  notificationEmail: string;
}

const DEFAULT_STORE_INFO: StoreInfo = {
  storeName: 'T.kays Agrocosmetics',
  contactEmail: '',
  contactPhone: '',
  address: '',
  currency: 'GBP (£)',
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  orderConfirm: true,
  shipUpdate: false,
  lowStock: false,
  weeklyReport: false,
  notificationEmail: '',
};

async function saveBlock(key: string, value: unknown): Promise<void> {
  const res = await apiFetch(`${API_URL}/api/admin/content/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? 'Save failed');
  }
}

const Toggle: React.FC<{ checked: boolean; onChange: () => void; label: string; desc?: string }> = ({ checked, onChange, label, desc }) => (
  <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4 ${checked ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const Field: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
}> = ({ label, id, value, onChange, type = 'text', placeholder, hint }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const SaveBar: React.FC<{
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  onReset: () => void;
}> = ({ saving, saved, onSave, onReset }) => (
  <div className="flex items-center gap-3 pt-2">
    <button
      type="button"
      onClick={onSave}
      disabled={saving}
      className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
    >
      {saving ? 'Saving…' : 'Save changes'}
    </button>
    <button
      type="button"
      onClick={onReset}
      disabled={saving}
      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-40"
    >
      Reset
    </button>
    {saved && (
      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Saved
      </span>
    )}
  </div>
);

const AdminSettings: React.FC = () => {
  const [tab, setTab] = useState<Tab>('store');
  const [allContent, setAllContent] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(DEFAULT_STORE_INFO);
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetch(`${API_URL}/api/admin/content`);
      if (!res.ok) throw new Error('Failed to load settings');
      const json = await res.json();
      setAllContent(json.data ?? {});
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (loading) return;
    setStoreInfo({ ...DEFAULT_STORE_INFO, ...(allContent['settings.store_info'] as Partial<StoreInfo>) });
    setNotifications({ ...DEFAULT_NOTIFICATIONS, ...(allContent['settings.notifications'] as Partial<NotificationSettings>) });
  }, [loading, allContent]);

  async function save(key: string, value: unknown) {
    setSaving(key);
    setSaved(null);
    try {
      await saveBlock(key, value);
      setSaved(key);
      setTimeout(() => setSaved(null), 3000);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-gray-400 animate-pulse">Loading settings…</div>;
  }

  if (loadError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        Failed to load settings: {loadError}
        <button onClick={load} className="ml-3 underline hover:no-underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
              tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {/* ── Store Info ── */}
        {tab === 'store' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Store Information</h3>
            <Field
              label="Store Name"
              id="storeName"
              value={storeInfo.storeName}
              onChange={(v) => setStoreInfo((s) => ({ ...s, storeName: v }))}
            />
            <Field
              label="Contact Email"
              id="storeEmail"
              type="email"
              value={storeInfo.contactEmail}
              onChange={(v) => setStoreInfo((s) => ({ ...s, contactEmail: v }))}
              placeholder="hello@tkaysagrocosmetics.com"
            />
            <Field
              label="WhatsApp / Phone Number"
              id="storePhone"
              type="tel"
              value={storeInfo.contactPhone}
              onChange={(v) => setStoreInfo((s) => ({ ...s, contactPhone: v }))}
              placeholder="233123456789"
              hint="Digits only, with country code, no spaces or + sign — e.g. 233123456789. Powers both the displayed contact number and the WhatsApp chat link on the Contact page."
            />
            <div>
              <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1.5">Business Address</label>
              <textarea
                id="address"
                value={storeInfo.address}
                onChange={(e) => setStoreInfo((s) => ({ ...s, address: e.target.value }))}
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <Field
              label="Currency"
              id="currency"
              value={storeInfo.currency}
              onChange={(v) => setStoreInfo((s) => ({ ...s, currency: v }))}
            />
            <SaveBar
              saving={saving === 'settings.store_info'}
              saved={saved === 'settings.store_info'}
              onSave={() => save('settings.store_info', storeInfo)}
              onReset={() => setStoreInfo({ ...DEFAULT_STORE_INFO, ...(allContent['settings.store_info'] as Partial<StoreInfo>) })}
            />
          </div>
        )}

        {/* ── Payment ── */}
        {tab === 'payment' && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-900">Payment Settings</h3>
            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <svg className="w-8 h-8 text-indigo-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-900">Stripe</p>
                <p className="text-xs text-gray-500">Accepts all major cards, Apple Pay & Google Pay. 1.5% + 20p (UK cards) per transaction.</p>
              </div>
              <span className="ml-auto text-xs font-semibold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full flex-shrink-0">Active</span>
            </div>
            <p className="text-sm text-gray-600">
              Payment keys are configured on the server by your developer — they are not editable here. This keeps
              secret keys out of the application database and admin dashboard.
            </p>
          </div>
        )}

        {/* ── Shipping ── */}
        {tab === 'shipping' && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-900">Shipping Rates</h3>
            <p className="text-sm text-gray-600">
              Shipping rates are managed on the Shipping page, where you can set up zones by country with their own
              base price, per-gram rate, and free-shipping threshold.
            </p>
            <Link
              href="/admin/shipping"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Shipping →
            </Link>
          </div>
        )}

        {/* ── Notifications ── */}
        {tab === 'notifications' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Email Notifications</h3>
            <Toggle
              label="Order Confirmation"
              desc="Send a confirmation email to customers when an order is placed"
              checked={notifications.orderConfirm}
              onChange={() => setNotifications((n) => ({ ...n, orderConfirm: !n.orderConfirm }))}
            />
            <Toggle
              label="Shipping Update"
              desc="Notify customers when their order is shipped with tracking info"
              checked={notifications.shipUpdate}
              onChange={() => setNotifications((n) => ({ ...n, shipUpdate: !n.shipUpdate }))}
            />
            <Toggle
              label="Low Stock Alert"
              desc="Send an admin alert when a product has fewer than 5 units in stock"
              checked={notifications.lowStock}
              onChange={() => setNotifications((n) => ({ ...n, lowStock: !n.lowStock }))}
            />
            <Toggle
              label="Weekly Sales Report"
              desc="Receive a weekly email summary of sales, revenue, and top products"
              checked={notifications.weeklyReport}
              onChange={() => setNotifications((n) => ({ ...n, weeklyReport: !n.weeklyReport }))}
            />
            <div className="mt-5">
              <Field
                label="Notification Email"
                id="notifEmail"
                type="email"
                value={notifications.notificationEmail}
                onChange={(v) => setNotifications((n) => ({ ...n, notificationEmail: v }))}
                placeholder={storeInfo.contactEmail || 'you@example.com'}
                hint="Leave blank to use the Contact Email from Store Info."
              />
            </div>
            <div className="mt-4">
              <SaveBar
                saving={saving === 'settings.notifications'}
                saved={saved === 'settings.notifications'}
                onSave={() => save('settings.notifications', notifications)}
                onReset={() => setNotifications({ ...DEFAULT_NOTIFICATIONS, ...(allContent['settings.notifications'] as Partial<NotificationSettings>) })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
