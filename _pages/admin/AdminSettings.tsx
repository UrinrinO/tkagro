'use client';
import React, { useState } from 'react';

type Tab = 'store' | 'payment' | 'shipping' | 'notifications';

const TABS: { key: Tab; label: string }[] = [
  { key: 'store',         label: 'Store Info' },
  { key: 'payment',       label: 'Payment' },
  { key: 'shipping',      label: 'Shipping' },
  { key: 'notifications', label: 'Notifications' },
];

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

const Field: React.FC<{ label: string; id: string; defaultValue?: string; type?: string; placeholder?: string; hint?: string }> = ({ label, id, defaultValue, type = 'text', placeholder, hint }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
    <input
      id={id}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const AdminSettings: React.FC = () => {
  const [tab, setTab] = useState<Tab>('store');
  const [notifs, setNotifs] = useState({ orderConfirm: true, shipUpdate: true, weeklyReport: false, lowStock: true });

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
            <Field label="Store Name" id="storeName" defaultValue="T.kays Agrocosmetics" />
            <Field label="Contact Email" id="storeEmail" type="email" defaultValue="hello@tkaysagro.com" />
            <Field label="Phone Number" id="storePhone" type="tel" defaultValue="+44 7000 000000" />
            <div>
              <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1.5">Business Address</label>
              <textarea
                id="address"
                defaultValue="London, United Kingdom"
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <Field label="Currency" id="currency" defaultValue="GBP (£)" />
            <button type="button" className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors" onClick={() => alert('Settings saved')}>
              Save Changes
            </button>
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
            <Field
              label="Publishable Key"
              id="stripePublishable"
              placeholder="pk_test_… or pk_live_…"
              hint="dashboard.stripe.com → Developers → API keys — safe to use in the frontend"
            />
            <Field
              label="Secret Key"
              id="stripeSecret"
              type="password"
              placeholder="sk_test_… or sk_live_…"
              hint="Backend only — never expose this in the browser or commit to version control"
            />
            <Field
              label="Webhook Signing Secret"
              id="stripeWebhook"
              type="password"
              placeholder="whsec_…"
              hint="dashboard.stripe.com → Developers → Webhooks → your endpoint → Signing secret"
            />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Environment</label>
              <div className="flex gap-2">
                {['Test Mode', 'Live Mode'].map((env) => (
                  <button
                    key={env}
                    type="button"
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      env === 'Test Mode' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors" onClick={() => alert('Payment settings saved')}>
              Save
            </button>
          </div>
        )}

        {/* ── Shipping ── */}
        {tab === 'shipping' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Shipping Rates</h3>
            <Field label="Free Shipping Threshold (£)" id="freeShipThreshold" defaultValue="50" hint="Orders over this amount qualify for free standard shipping" />
            <Field label="Standard Shipping Rate (£)" id="standardRate" defaultValue="3.99" />
            <Field label="Express Shipping Rate (£)" id="expressRate" defaultValue="7.99" />
            <Field label="International Rate (£)" id="intlRate" defaultValue="12.99" />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Shipping Regions</label>
              <div className="space-y-2">
                {['United Kingdom', 'Europe', 'Rest of World'].map((r) => (
                  <label key={r} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary" />
                    {r}
                  </label>
                ))}
              </div>
            </div>
            <button type="button" className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors" onClick={() => alert('Shipping settings saved')}>
              Save
            </button>
          </div>
        )}

        {/* ── Notifications ── */}
        {tab === 'notifications' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Email Notifications</h3>
            <Toggle
              label="Order Confirmation"
              desc="Send a confirmation email to customers when an order is placed"
              checked={notifs.orderConfirm}
              onChange={() => setNotifs((n) => ({ ...n, orderConfirm: !n.orderConfirm }))}
            />
            <Toggle
              label="Shipping Update"
              desc="Notify customers when their order is shipped with tracking info"
              checked={notifs.shipUpdate}
              onChange={() => setNotifs((n) => ({ ...n, shipUpdate: !n.shipUpdate }))}
            />
            <Toggle
              label="Low Stock Alert"
              desc="Send an admin alert when a product has fewer than 5 units in stock"
              checked={notifs.lowStock}
              onChange={() => setNotifs((n) => ({ ...n, lowStock: !n.lowStock }))}
            />
            <Toggle
              label="Weekly Sales Report"
              desc="Receive a weekly email summary of sales, revenue, and top products"
              checked={notifs.weeklyReport}
              onChange={() => setNotifs((n) => ({ ...n, weeklyReport: !n.weeklyReport }))}
            />
            <div className="mt-5">
              <Field label="Notification Email" id="notifEmail" type="email" defaultValue="ogidiamau@gmail.com" />
            </div>
            <button type="button" className="mt-4 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors" onClick={() => alert('Notification settings saved')}>
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
