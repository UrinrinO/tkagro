# Shipping Update Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send a real "your order has shipped" email (with an optional tracking number) the moment an admin marks an order as Shipped, gated by the already-existing `shipUpdate` notification preference.

**Architecture:** One new nullable DB column, one extended existing API route (adds transition detection + the email trigger), one new email-sending function following the exact pattern of the existing order-confirmation email, and one new admin form field.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (Postgres), Resend (transactional email).

## Global Constraints

- The email must fire only on a genuine transition into `'Shipped'` status — never on a later, unrelated edit to an order that's already Shipped (e.g. correcting a typo in the tracking number afterward must NOT re-send the email).
- Gated by `content_blocks` key `settings.notifications`, field `shipUpdate`, using the exact fail-open check `value?.shipUpdate !== false` (defaults to sending when the row doesn't exist yet) — this must match the existing `orderConfirm` pattern in `app/api/orders/route.ts` exactly.
- Tracking number is optional everywhere: nullable DB column, optional form field, conditionally rendered in the email — there is no invalid/required state for it.
- No carrier detection, no generated tracking-link URLs — the tracking number is a plain string, included as-is.
- The email send must be fire-and-forget (`.catch(console.error)`) and must never cause the status-update request itself to fail.
- This project has no automated test framework (no jest/vitest/playwright anywhere in the repo) — every verification step in this plan uses `curl` against the local dev server or manual browser checks, not automated tests.
- The dev server is assumed to already be running at `http://localhost:3000` for all verification steps. If `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/` doesn't return `200`, start it from `/home/urinrin/Documents/projects/agrocosmetics/site/app` with `npm run dev` before continuing.

---

### Task 1: Add the `tracking_number` column

**Files:**
- None created/modified in the repo — this is a database schema change executed directly against Supabase via `psql`.

**Interfaces:**
- Produces: a nullable `tracking_number text` column on the existing `public.orders` table, which Task 2 and Task 3 depend on.

- [ ] **Step 1: Confirm with the user before running any schema change**

Before running Step 2, tell the user exactly what SQL you are about to run against their live Supabase project (the `ALTER TABLE` statement below) and wait for explicit go-ahead. This is a low-risk, purely additive change (a new nullable column, no data loss possible), but still confirm first, matching how the `ingredients` table migration was handled earlier this session.

- [ ] **Step 2: Run the migration**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
DB_URL=$(grep -E '^DATABASE_URL=' .env.local | cut -d= -f2-)
psql "$DB_URL" -c "ALTER TABLE orders ADD COLUMN tracking_number text;"
```

Expected output: `ALTER TABLE`

- [ ] **Step 3: Verify the column exists and is nullable**

```bash
DB_URL=$(grep -E '^DATABASE_URL=' .env.local | cut -d= -f2-)
psql "$DB_URL" -c "\d orders" | grep tracking_number
```

Expected output: a line showing `tracking_number | text |` with an empty "Nullable" indicator column (meaning it IS nullable — Postgres's `\d` output only prints `not null` when a column is NOT nullable, so no such marker here confirms nullability).

- [ ] **Step 4: Verify existing rows are unaffected**

```bash
DB_URL=$(grep -E '^DATABASE_URL=' .env.local | cut -d= -f2-)
psql "$DB_URL" -c "SELECT count(*) FROM orders WHERE tracking_number IS NULL;"
psql "$DB_URL" -c "SELECT count(*) FROM orders;"
```

Expected output: both counts are equal — every existing order has `tracking_number IS NULL`, confirming the column was added without touching any existing data.

No commit for this task — it's a database change, not a code change.

---

### Task 2: Email function + order-status trigger logic

**Files:**
- Modify: `lib/resend.ts`
- Modify: `app/api/admin/orders/[id]/route.ts`

**Interfaces:**
- Consumes: `tracking_number` column from Task 1; the existing `resend` client, `FROM` constant, and `sendOrderConfirmation` pattern already in `lib/resend.ts`; the existing `content_blocks` fail-open-gate pattern already in `app/api/orders/route.ts`.
- Produces: `sendShippingUpdate(data: ShippingUpdateEmailData)` exported from `lib/resend.ts` — Task 3 does not call this directly (only the route does), but needs to know the `trackingNumber` field name is what the route forwards from the request body.

- [ ] **Step 1: Add the email function to `lib/resend.ts`**

Find the end of the existing `sendOrderConfirmation` function (the closing `}` right before the file ends), and add this immediately after it:

```typescript
export interface ShippingUpdateEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  trackingNumber?: string | null;
}

export async function sendShippingUpdate(data: ShippingUpdateEmailData) {
  const trackingBlock = data.trackingNumber
    ? `<div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px;margin-left:12px;display:inline-block">
        <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Tracking number</span>
        <span style="display:block;font-size:16px;font-weight:700;color:#1a1a1a;margin-top:2px;font-family:monospace">${data.trackingNumber}</span>
      </div>`
    : '';

  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Your order has shipped — ${data.orderNumber} | T.kays Agrocosmetics`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a1a">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <div style="background:#2d5016;padding:28px 32px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:20px;letter-spacing:0.02em">T.kays Agrocosmetics</h1>
      <p style="margin:6px 0 0;color:#c9a84c;font-size:12px;letter-spacing:0.12em;text-transform:uppercase">Balanced Wellness</p>
    </div>
    <div style="padding:36px 32px">
      <h2 style="margin:0 0 8px;color:#2d5016;font-size:22px">Your Order Has Shipped ✓</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:15px">
        Hi ${data.customerName}, great news — your order is on its way!
      </p>
      <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px;display:inline-block">
        <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Order number</span>
        <span style="display:block;font-size:16px;font-weight:700;color:#1a1a1a;margin-top:2px;font-family:monospace">${data.orderNumber}</span>
      </div>
      ${trackingBlock}
      <p style="margin:32px 0 0;font-size:13px;color:#9ca3af;line-height:1.6">
        Questions about your delivery? Simply reply to this email and we'll help.<br>
        Thank you for choosing T.kays.
      </p>
    </div>
    <div style="background:#f9fafb;padding:20px 32px;text-align:center">
      <p style="margin:0;font-size:11px;color:#9ca3af">© 2026 T.kays Agrocosmetics · London, UK</p>
    </div>
  </div>
</body>
</html>`,
  });
}
```

- [ ] **Step 2: Extend the PATCH handler in `app/api/admin/orders/[id]/route.ts`**

Find:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
```

Replace with:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { sendShippingUpdate } from '@/lib/resend';
```

Find:

```typescript
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { status } = await request.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
  }
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { order: data } });
}
```

Replace with:

```typescript
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { status, trackingNumber } = await request.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
  }

  const { data: existing } = await supabase.from('orders').select('status').eq('id', params.id).single();
  const previousStatus = existing?.status;

  const updatePayload: Record<string, unknown> = { status };
  if (trackingNumber !== undefined) updatePayload.tracking_number = trackingNumber || null;

  const { data, error } = await supabase.from('orders').update(updatePayload).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });

  if (status === 'Shipped' && previousStatus !== 'Shipped') {
    const { data: notifSettings } = await supabase
      .from('content_blocks')
      .select('value')
      .eq('key', 'settings.notifications')
      .single();
    const shipUpdateEnabled = (notifSettings?.value as any)?.shipUpdate !== false;

    if (shipUpdateEnabled) {
      sendShippingUpdate({
        orderNumber: data.order_number,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        trackingNumber: data.tracking_number,
      }).catch((err) => console.error('[resend] shipping update email failed:', err));
    }
  }

  return NextResponse.json({ success: true, data: { order: data } });
}
```

- [ ] **Step 3: Verify the route still compiles and rejects unauthenticated requests**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X PATCH http://localhost:3000/api/admin/orders/00000000-0000-0000-0000-000000000000 -H 'Content-Type: application/json' -d '{"status":"Shipped","trackingNumber":"TRK123"}'
```

Expected output: `403` (no `Authorization` header supplied — proves the route compiles and reaches the auth check with the new `trackingNumber` field in the body, not a syntax error).

- [ ] **Step 4: Verify `lib/resend.ts` still compiles**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/admin/orders/00000000-0000-0000-0000-000000000000
```

Expected output: `403` — this GET request exercises the same file's import chain; a `403` (not a `500`) confirms `lib/resend.ts`'s new export didn't break anything the route imports.

- [ ] **Step 5: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add lib/resend.ts "app/api/admin/orders/[id]/route.ts"
git commit -m "$(cat <<'EOF'
Add shipping-update email, gated on Shipped-status transitions

Fires only when an order's status genuinely transitions into
Shipped, not on later edits to an already-Shipped order. Gated by
the existing settings.notifications.shipUpdate preference, defaulting
to enabled (fail-open) to match the orderConfirm precedent.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Admin UI — Tracking Number field

**Files:**
- Modify: `_pages/admin/AdminOrderDetail.tsx`

**Interfaces:**
- Consumes: `PATCH /api/admin/orders/:id` (Task 2), sending an additional `trackingNumber` field in its request body alongside the existing `status` field.
- Produces: nothing for other tasks — this is the last task in this plan.

- [ ] **Step 1: Add `tracking_number` to the `OrderData` interface and add tracking-number state**

Find:

```tsx
interface OrderData {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: Record<string, string>;
  payment_method: string;
  payment_reference: string | null;
  payment_status: string;
  items: Array<{ id: string; name: string; qty: number; price: number; subtotal: number }>;
  subtotal: string;
  shipping_cost: string;
  discount_amount: string;
  total: string;
}
```

Replace with:

```tsx
interface OrderData {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  tracking_number: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: Record<string, string>;
  payment_method: string;
  payment_reference: string | null;
  payment_status: string;
  items: Array<{ id: string; name: string; qty: number; price: number; subtotal: number }>;
  subtotal: string;
  shipping_cost: string;
  discount_amount: string;
  total: string;
}
```

Find:

```tsx
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`${API_URL}/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message);
        setOrder(json.data.order);
        setStatus(json.data.order.status);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!order || status === order.status) return;
    setUpdating(true);
    setUpdateMsg(null);
    try {
      const res = await apiFetch(`${API_URL}/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setOrder(json.data.order);
      setUpdateMsg('Status updated.');
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (err: any) {
      setUpdateMsg(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };
```

Replace with:

```tsx
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`${API_URL}/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message);
        setOrder(json.data.order);
        setStatus(json.data.order.status);
        setTrackingNumber(json.data.order.tracking_number ?? '');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!order) return;
    if (status === order.status && trackingNumber === (order.tracking_number ?? '')) return;
    setUpdating(true);
    setUpdateMsg(null);
    try {
      const res = await apiFetch(`${API_URL}/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setOrder(json.data.order);
      setUpdateMsg('Status updated.');
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (err: any) {
      setUpdateMsg(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };
```

- [ ] **Step 2: Add the Tracking Number input to the JSX**

Find:

```tsx
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" onClick={handleStatusUpdate} disabled={updating || status === order.status}
            className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors disabled:opacity-40">
            {updating ? 'Saving…' : 'Update'}
          </button>
```

Replace with:

```tsx
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Tracking number (optional)"
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
          />
          <button
            type="button"
            onClick={handleStatusUpdate}
            disabled={updating || (status === order.status && trackingNumber === (order.tracking_number ?? ''))}
            className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors disabled:opacity-40"
          >
            {updating ? 'Saving…' : 'Update'}
          </button>
```

- [ ] **Step 3: Verify the page still renders**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/orders
```

Expected output: `200`.

- [ ] **Step 4: Manual browser verification (requires an authenticated admin session — not available to a non-interactive shell)**

Log into `/admin/login`, then:
1. Open a real test order that's currently `Processing`.
2. Enter a tracking number (e.g. `TEST123456`), change the status to `Shipped`, click Update.
3. Confirm the shipping-update email arrives at the test order's customer email, showing the order number and the tracking number.
4. Reload the page, change only the tracking number (leave status as `Shipped`), click Update again.
5. Confirm NO second email is sent for this second update — this is the "transition-only" behavior the plan requires.

- [ ] **Step 5: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add _pages/admin/AdminOrderDetail.tsx
git commit -m "$(cat <<'EOF'
Add Tracking Number field to admin order detail

Completes the shipping-update-email feature: an admin can now enter
a tracking number alongside changing an order's status, submitted
together through the existing status-update call.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
