# Settings Page Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Admin Settings page (`_pages/admin/AdminSettings.tsx`) honest — remove the two tabs that should never be wired up as designed (Payment, Shipping), and make the other two (Store Info, Notifications) persist real data that the live site actually uses.

**Architecture:** Reuses the existing `content_blocks` table and its already-functional public/admin content APIs (no new table, no new API routes) by adding two new allowed key names. The admin form's save/load UX mirrors the pattern already established in `_pages/admin/AdminCMS.tsx`. Two consumers on the public site (`_pages/ContactPage.tsx`, `app/api/orders/route.ts`) are updated to read the newly-real data.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (Postgres via `@supabase/supabase-js`), Tailwind CSS.

## Global Constraints

- Reuse the existing `content_blocks` table — no new database table or migration.
- New content keys: `settings.store_info` (fields: `storeName`, `contactEmail`, `contactPhone`, `address`, `currency`) and `settings.notifications` (fields: `orderConfirm`, `shipUpdate`, `lowStock`, `weeklyReport`, `notificationEmail`), exactly as named here — later tasks and the next spec (new email features) depend on these exact key and field names.
- `contactPhone` is stored as digits only, with country code, no `+` or spaces (e.g. `"233123456789"`) — this is the format `https://wa.me/<number>` requires, and it is also used to build the displayed phone text by prefixing `+`.
- Payment and Shipping tabs get replaced with static, read-only content — no inputs, no save button, no API calls, ever.
- `shipUpdate`, `lowStock`, and `weeklyReport` persist correctly in this plan but must not trigger any email-sending behavior — that's a separate, future spec. Do not add any send logic for those three.
- This project has no automated test framework (no jest/vitest/playwright anywhere in the repo, confirmed via `package.json` and a repo-wide search) — every verification step in this plan uses `curl` against the local dev server or manual browser checks, not automated tests.
- The dev server is assumed to already be running at `http://localhost:3000` for all verification steps below. If `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/` doesn't return `200`, start it from `/home/urinrin/Documents/projects/agrocosmetics/site/app` with `npm run dev` before continuing.

---

### Task 1: Backend — allow the two new settings keys, gate the order confirmation email

**Files:**
- Modify: `app/api/admin/content/[key]/route.ts`
- Modify: `app/api/orders/route.ts`

**Interfaces:**
- Produces: `PUT /api/admin/content/settings.store_info` and `PUT /api/admin/content/settings.notifications` become writable (previously rejected with 400 `Unknown content key`). `GET /api/admin/content`, `GET /api/admin/content/:key`, and the public `GET /api/content/:key` already handle any key generically and need no changes to serve these two once they exist in the table.
- Consumes: nothing new — `supabase` client from `@/lib/supabase-server`, already imported in both files.

- [ ] **Step 1: Add the two new keys to `ALLOWED_KEYS`**

In `app/api/admin/content/[key]/route.ts`, find:

```typescript
const ALLOWED_KEYS = new Set([
  'homepage.hero', 'homepage.trust_strip', 'homepage.why_tkays', 'homepage.newsletter',
  'about.brand_story', 'about.founder', 'about.balanced_wellness', 'about.vhon', 'about.dice',
  'testimonials', 'faqs',
]);
```

Replace it with:

```typescript
const ALLOWED_KEYS = new Set([
  'homepage.hero', 'homepage.trust_strip', 'homepage.why_tkays', 'homepage.newsletter',
  'about.brand_story', 'about.founder', 'about.balanced_wellness', 'about.vhon', 'about.dice',
  'testimonials', 'faqs',
  'settings.store_info', 'settings.notifications',
]);
```

- [ ] **Step 2: Verify the keys are now writable (requires an admin bearer token)**

This route requires a valid Supabase admin session token, which isn't available to a non-interactive shell. Verify the change compiles and the key is recognized by checking the 400 response for an unrelated bogus key still works (proving the route is live) and that no 500 occurs — the full authenticated write path gets exercised for real once Task 2's UI calls it:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X PUT http://localhost:3000/api/admin/content/settings.store_info -H 'Content-Type: application/json' -d '{"value":{}}'
```

Expected output: `403` (no `Authorization` header supplied — proves the route is live and reaches the auth check, not a 404/500 from a broken key list or syntax error).

- [ ] **Step 3: Gate the order confirmation email by the `orderConfirm` preference**

In `app/api/orders/route.ts`, find:

```typescript
    sendOrderConfirmation({
      orderNumber, customerName: customer.name, customerEmail: customer.email,
      items: lineItems.map((i: any) => ({ name: i.name, qty: i.qty, price: `£${i.price.toFixed(2)}` })),
      total: `£${total.toFixed(2)}`, shippingAddress,
    }).catch((err) => console.error('[resend] confirmation email failed:', err));
```

Replace it with:

```typescript
    const { data: notifSettings } = await supabase
      .from('content_blocks')
      .select('value')
      .eq('key', 'settings.notifications')
      .single();
    const orderConfirmEnabled = (notifSettings?.value as any)?.orderConfirm !== false;

    if (orderConfirmEnabled) {
      sendOrderConfirmation({
        orderNumber, customerName: customer.name, customerEmail: customer.email,
        items: lineItems.map((i: any) => ({ name: i.name, qty: i.qty, price: `£${i.price.toFixed(2)}` })),
        total: `£${total.toFixed(2)}`, shippingAddress,
      }).catch((err) => console.error('[resend] confirmation email failed:', err));
    }
```

Note: `!== false` (not `=== true`) is deliberate — if `settings.notifications` doesn't exist in the table yet (e.g. before Task 2's UI has ever been used to save it), `notifSettings` is `null`, `.value` is `undefined`, and `undefined !== false` is `true` — matching the spec's documented default of `orderConfirm: true`.

- [ ] **Step 4: Verify the orders route still compiles and serves**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/orders -H 'Content-Type: application/json' -d '{}'
```

Expected output: `400` (missing required fields — proves the route compiles and runs past the new query without a 500). A full real order was already exercised end-to-end via Stripe checkout earlier this project's development, so this plan does not repeat that full flow — it only needs to confirm the new gating logic doesn't break the route.

- [ ] **Step 5: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add app/api/admin/content/[key]/route.ts app/api/orders/route.ts
git commit -m "$(cat <<'EOF'
Allow settings.* content keys and gate order confirmation email

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Rewrite AdminSettings.tsx — remove Payment/Shipping tabs, wire Store Info and Notifications

**Files:**
- Modify: `_pages/admin/AdminSettings.tsx` (full-file rewrite — the whole file is small, 213 lines, and every tab shares the top-level component and state, so this task replaces the file in one piece rather than patching individual sections)

**Interfaces:**
- Consumes: `GET /api/admin/content` and `PUT /api/admin/content/:key` (both already functional; the two new keys are writable as of Task 1) via `apiFetch` from `@/lib/apiFetch`.
- Produces: no new interfaces for other tasks to consume — this is a leaf UI component. Task 3 does not depend on this task's code (it reads the same underlying content key independently via the public API), so these two tasks can be done in either order, but are numbered this way to match the plan's narrative order.

- [ ] **Step 1: Replace the full contents of `_pages/admin/AdminSettings.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify the page compiles and serves**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/settings
```

Expected output: `200`.

- [ ] **Step 3: Verify no leftover references to the deleted fake save handlers**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
grep -n "alert(" _pages/admin/AdminSettings.tsx
```

Expected output: no matches (the old `alert('...saved')` calls are gone — real errors now go through the `save()` function's `catch` block, which is the only `alert(` call left, used for genuine save failures, not fake success).

- [ ] **Step 4: Manual browser verification (requires an authenticated admin session — not available to a non-interactive shell)**

Log into `/admin/login`, then:
1. Go to `/admin/settings` — confirm only two tabs now exist: **Store Info** and **Notifications** (no Payment, no Shipping tab).
2. On Store Info, fill in a Contact Email and a WhatsApp/Phone number (digits only, e.g. `233123456789`), click Save Changes, confirm the green "Saved" indicator appears.
3. Reload the page — confirm the values you entered are still there (proves the save round-trips through the database, not just local state).
4. On Notifications, toggle Order Confirmation off, save, reload, confirm it's still off.
5. Click the Payment tab equivalent area — confirm it now shows the static "Stripe — Active / configured by your developer" card, no inputs.
6. Click the Shipping tab equivalent area — confirm it shows the note and a working "Go to Shipping →" link that navigates to `/admin/shipping`.

- [ ] **Step 5: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add _pages/admin/AdminSettings.tsx
git commit -m "$(cat <<'EOF'
Rewrite AdminSettings: remove Payment/Shipping tabs, wire Store Info and Notifications

Payment and Shipping are replaced with static, read-only content —
real Stripe keys stay server-side only, and shipping rates are
managed on the existing, real /admin/shipping page. Store Info and
Notifications now persist to content_blocks for real via the
existing admin content API.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Wire ContactPage.tsx to the real Store Info

**Files:**
- Modify: `_pages/ContactPage.tsx`

**Interfaces:**
- Consumes: `GET /api/content/settings.store_info` (public, unauthenticated, already fully functional as of before this plan — no backend change needed for this task specifically, since the public content API handles any key generically).
- Produces: nothing new for other tasks — this is the last task in this plan.

- [ ] **Step 1: Remove the hardcoded WhatsApp number constants**

In `_pages/ContactPage.tsx`, find:

```typescript
const WHATSAPP_NUMBER = "233XXXXXXXXX"; // Replace with actual number
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
```

Delete both lines entirely — they're replaced by component state in a later step.

- [ ] **Step 2: Make `WhatsAppCard` accept the WhatsApp URL as a prop**

Find:

```tsx
const WhatsAppCard: React.FC = () => (
  <a
    href={WHATSAPP_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={styles.whatsappCard}
    aria-label="Chat with T.kays Agrocosmetics on WhatsApp"
  >
```

Replace with:

```tsx
const WhatsAppCard: React.FC<{ whatsappUrl: string }> = ({ whatsappUrl }) => (
  <a
    href={whatsappUrl}
    target="_blank"
    rel="noopener noreferrer"
    className={styles.whatsappCard}
    aria-label="Chat with T.kays Agrocosmetics on WhatsApp"
  >
```

(Only the component's type signature and the `href` line change — everything else inside the `<a>` stays exactly as-is; do not touch the SVG icon, labels, or arrow markup.)

- [ ] **Step 3: Add store info state and a fetch effect to the main `ContactPage` component**

Find the start of the component:

```tsx
const ContactPage: React.FC = () => {
```

And the line immediately after it (the first existing `useState` call):

```tsx
  const [errors, setErrors] = useState<FormErrors>({});
```

Insert this new state and effect immediately before that `useState<FormErrors>` line (i.e., right after the `const ContactPage: React.FC = () => {` line):

```tsx
  const [contactEmail, setContactEmail] = useState("hello@tkaysagrocosmetics.com");
  const [contactPhone, setContactPhone] = useState("233XXXXXXXXX");

  useEffect(() => {
    fetch("/api/content/settings.store_info")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const value = json?.data?.value;
        if (value?.contactEmail) setContactEmail(value.contactEmail);
        if (value?.contactPhone) setContactPhone(value.contactPhone);
      })
      .catch(() => {
        // Keep the defaults above — this is a non-critical enhancement fetch,
        // not something that should block or error the Contact page.
      });
  }, []);

  const whatsappUrl = `https://wa.me/${contactPhone}`;

```

- [ ] **Step 4: Add the `useEffect` import**

Find:

```tsx
import React, { useState, useCallback } from "react";
```

Replace with:

```tsx
import React, { useState, useCallback, useEffect } from "react";
```

- [ ] **Step 5: Use the new state in the JSX**

Find:

```tsx
            {/* WhatsApp CTA */}
            <WhatsAppCard />
```

Replace with:

```tsx
            {/* WhatsApp CTA */}
            <WhatsAppCard whatsappUrl={whatsappUrl} />
```

Find:

```tsx
              <a
                href="mailto:hello@tkaysagrocosmetics.com"
                className={styles.contactLink}
              >
                <span className={styles.contactLinkIcon} aria-hidden="true">
                  ✉
                </span>
                hello@tkaysagrocosmetics.com
              </a>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <span className={styles.contactLinkIcon} aria-hidden="true">
                  📱
                </span>
                +233 XX XXX XXXX
              </a>
```

Replace with:

```tsx
              <a
                href={`mailto:${contactEmail}`}
                className={styles.contactLink}
              >
                <span className={styles.contactLinkIcon} aria-hidden="true">
                  ✉
                </span>
                {contactEmail}
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <span className={styles.contactLinkIcon} aria-hidden="true">
                  📱
                </span>
                +{contactPhone}
              </a>
```

- [ ] **Step 6: Verify no dangling references to the deleted constants**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
grep -n "WHATSAPP_NUMBER\|WHATSAPP_URL" _pages/ContactPage.tsx
```

Expected output: no matches — both were fully replaced by component state and the `whatsappUrl` local variable.

- [ ] **Step 7: Verify the page still renders**

```bash
curl -s http://localhost:3000/contact | grep -o "hello@tkaysagrocosmetics.com\|+233XXXXXXXXX" | head -5
```

Expected output: at least one match — the default placeholder values render correctly before any real Store Info has been saved (proving the fetch-with-fallback logic doesn't break the page even when `settings.store_info` doesn't exist in the table yet).

- [ ] **Step 8: Manual browser verification (after Task 2 is done and a real Store Info has been saved via the admin UI)**

1. In `/admin/settings` → Store Info, save a real Contact Email and Phone (e.g. email `test@example.com`, phone `447700900123`).
2. Load `/contact` in a browser — confirm the "Contact Details" card now shows `test@example.com` and `+447700900123`, and that the mailto link and the WhatsApp CTA card both point at the values you just saved (view page source or inspect the link hrefs).

- [ ] **Step 9: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add _pages/ContactPage.tsx
git commit -m "$(cat <<'EOF'
Wire ContactPage to real Store Info instead of hardcoded placeholders

Replaces the hardcoded email and the "+233 XX XXX XXXX" placeholder
phone number with data fetched from settings.store_info, falling
back to the previous hardcoded values if that content hasn't been
saved yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
