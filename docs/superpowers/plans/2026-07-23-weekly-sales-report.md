# Weekly Sales Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send a weekly email (scheduled via Vercel Cron, manually triggerable by an admin) summarizing the trailing 7 days of sales — orders count, revenue, average order value, new customers, and top 5 products by revenue.

**Architecture:** A new `GET /api/cron/weekly-report` route accepts either a `CRON_SECRET` bearer header (Vercel Cron's standard invocation) or an authenticated admin session, aggregates the last 7 days of `orders` in application code (no separate line-items table — line items live as JSONB on `orders.items`), and sends the report via a new `sendWeeklySalesReport()` in `lib/resend.ts`, reusing the existing `getNotificationRecipient()`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (Postgres), Resend, Vercel Cron.

## Global Constraints

- Threshold/window: rolling 7 days ending at request time — `windowStart = now - 7 days`, `windowEnd = now`. Not calendar-aligned.
- Gate check is fail-closed: `value?.weeklyReport === true` (the toggle already exists in Settings, default `false`).
- Order filter for all metrics: exclude `status = 'Cancelled'` and `payment_status = 'Refunded'`, matching `app/api/admin/dashboard/route.ts`'s existing revenue filter exactly.
- Recipient resolution goes through the existing shared `getNotificationRecipient()` in `lib/resend.ts` — do not reimplement.
- Top products: top 5 by summed line-item `subtotal` (revenue), not units.
- The report always sends when gate + recipient checks pass, even with zero qualifying orders — no silent skip on an empty window.
- Unlike the other three email features in this codebase, this route **awaits** the send and reports outcome in its JSON response (it has no parent request to protect — sending the email IS the request).
- No automated test framework in this project — verification is `curl` plus a manual admin-triggered check deferred to the human.

---

### Task 1: Weekly sales report email in `lib/resend.ts`

**Files:**
- Modify: `lib/resend.ts` (227 lines currently — the file ends after `sendLowStockAlert()` at line 226/227; append new content there)

**Interfaces:**
- Produces: `export interface WeeklySalesReportEmailData { recipientEmail: string; windowStart: string; windowEnd: string; ordersCount: number; totalRevenue: number; averageOrderValue: number; newCustomers: number; topProducts: { name: string; unitsSold: number; revenue: number }[] }` and `export async function sendWeeklySalesReport(data: WeeklySalesReportEmailData): Promise<void>` — both consumed by Task 2.

- [ ] **Step 1: Append the new interface and function to the end of the file**

The file currently ends (lines 224-227) with:

```typescript
</body>
</html>`,
  });
}
```

(the closing of `sendLowStockAlert`). Append this new content immediately after that closing `}` (keep a blank line before it):

```typescript

export interface WeeklySalesReportEmailData {
  recipientEmail: string;
  windowStart: string;
  windowEnd: string;
  ordersCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  newCustomers: number;
  topProducts: { name: string; unitsSold: number; revenue: number }[];
}

export async function sendWeeklySalesReport(data: WeeklySalesReportEmailData) {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const productRows = data.topProducts.length > 0
    ? data.topProducts
        .map(
          (p, i) =>
            `<tr>
              <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${i + 1}. ${p.name}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center">${p.unitsSold}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right">£${p.revenue.toFixed(2)}</td>
            </tr>`,
        )
        .join('')
    : `<tr><td colspan="3" style="padding:16px 12px;text-align:center;color:#9ca3af">No sales this week</td></tr>`;

  await resend.emails.send({
    from: FROM,
    to: data.recipientEmail,
    subject: `Weekly Sales Report — ${formatDate(data.windowStart)} to ${formatDate(data.windowEnd)} | T.kays Agrocosmetics`,
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
      <h2 style="margin:0 0 8px;color:#2d5016;font-size:22px">Weekly Sales Report</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:15px">
        ${formatDate(data.windowStart)} – ${formatDate(data.windowEnd)}
      </p>
      <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px;display:inline-block">
        <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Orders</span>
        <span style="display:block;font-size:20px;font-weight:700;color:#1a1a1a;margin-top:2px">${data.ordersCount}</span>
      </div>
      <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px;margin-left:12px;display:inline-block">
        <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Revenue</span>
        <span style="display:block;font-size:20px;font-weight:700;color:#1a1a1a;margin-top:2px">£${data.totalRevenue.toFixed(2)}</span>
      </div>
      <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px;margin-left:12px;display:inline-block">
        <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Avg. order</span>
        <span style="display:block;font-size:20px;font-weight:700;color:#1a1a1a;margin-top:2px">£${data.averageOrderValue.toFixed(2)}</span>
      </div>
      <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px;margin-left:12px;display:inline-block">
        <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">New customers</span>
        <span style="display:block;font-size:20px;font-weight:700;color:#1a1a1a;margin-top:2px">${data.newCustomers}</span>
      </div>
      <h3 style="margin:0 0 8px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Top products</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151">Product</th>
            <th style="padding:10px 12px;text-align:center;font-weight:600;color:#374151">Units</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;color:#374151">Revenue</th>
          </tr>
        </thead>
        <tbody>${productRows}</tbody>
      </table>
      <p style="margin:32px 0 0;font-size:13px;color:#9ca3af;line-height:1.6">
        You're receiving this because Weekly Sales Reports are enabled in Admin → Settings → Notifications.
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

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit` from the `app/` directory (there is no dedicated typecheck script in `package.json` — use `tsc` directly). Pre-existing unrelated errors elsewhere in the project are not this task's concern — only make sure no new errors originate from `lib/resend.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/resend.ts
git commit -m "feat: add weekly sales report email"
```

---

### Task 2: Cron route — auth, aggregation, and send

**Files:**
- Create: `app/api/cron/weekly-report/route.ts`
- Create: `vercel.json` (project root, alongside `package.json`)

**Interfaces:**
- Consumes: `getNotificationRecipient(): Promise<string | null>` and `sendWeeklySalesReport(data: WeeklySalesReportEmailData): Promise<void>` from `@/lib/resend` (Task 1).

- [ ] **Step 1: Create the route file**

Create `app/api/cron/weekly-report/route.ts` with this exact content:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { getNotificationRecipient, sendWeeklySalesReport } from '@/lib/resend';

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single();
  return data ? user : null;
}

interface OrderRow {
  total: string;
  customer_email: string;
  items: unknown;
  created_at: string;
}

interface TopProduct {
  name: string;
  unitsSold: number;
  revenue: number;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.split(' ')[1];

  const isCronRequest = !!cronSecret && bearerToken === cronSecret;
  const isAdminRequest = !isCronRequest && (await requireAdmin(request)) !== null;

  if (!isCronRequest && !isAdminRequest) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const windowEnd = new Date();
  const windowStart = new Date(windowEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data: notifSettings } = await supabase
    .from('content_blocks')
    .select('value')
    .eq('key', 'settings.notifications')
    .single();
  const weeklyReportEnabled = (notifSettings?.value as any)?.weeklyReport === true;

  if (!weeklyReportEnabled) {
    return NextResponse.json({ success: true, data: { sent: false, reason: 'disabled' } });
  }

  const recipientEmail = await getNotificationRecipient();
  if (!recipientEmail) {
    return NextResponse.json({ success: true, data: { sent: false, reason: 'no_recipient' } });
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('total, customer_email, items, created_at')
    .gte('created_at', windowStart.toISOString())
    .lt('created_at', windowEnd.toISOString())
    .neq('status', 'Cancelled')
    .neq('payment_status', 'Refunded');

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  const orderRows = (orders ?? []) as OrderRow[];

  const ordersCount = orderRows.length;
  const totalRevenue = orderRows.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const averageOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0;

  const emails = [...new Set(orderRows.map((o) => o.customer_email))];
  let newCustomers = 0;
  if (emails.length > 0) {
    const { data: firstOrders } = await supabase
      .from('orders')
      .select('customer_email, created_at')
      .in('customer_email', emails)
      .order('created_at', { ascending: true });

    const firstOrderByEmail = new Map<string, string>();
    for (const o of firstOrders ?? []) {
      if (!firstOrderByEmail.has(o.customer_email)) firstOrderByEmail.set(o.customer_email, o.created_at);
    }

    newCustomers = emails.filter((e) => {
      const first = firstOrderByEmail.get(e);
      if (!first) return false;
      const firstDate = new Date(first);
      return firstDate >= windowStart && firstDate < windowEnd;
    }).length;
  }

  const productTotals = new Map<string, TopProduct>();
  for (const order of orderRows) {
    if (!Array.isArray(order.items)) continue;
    for (const item of order.items as any[]) {
      if (!item || typeof item !== 'object') continue;
      const id = item.id;
      const name = item.name;
      const qty = item.qty;
      const subtotal = item.subtotal;
      if (typeof id !== 'string' || typeof name !== 'string' || typeof qty !== 'number' || typeof subtotal !== 'number') continue;

      const existing = productTotals.get(id);
      if (existing) {
        existing.unitsSold += qty;
        existing.revenue += subtotal;
      } else {
        productTotals.set(id, { name, unitsSold: qty, revenue: subtotal });
      }
    }
  }

  const topProducts = [...productTotals.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const reportData = {
    ordersCount,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
    newCustomers,
    topProducts,
  };

  try {
    await sendWeeklySalesReport({
      recipientEmail,
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      ...reportData,
    });
    return NextResponse.json({ success: true, data: { sent: true, ...reportData } });
  } catch (err) {
    console.error('[cron] weekly sales report send failed:', err);
    return NextResponse.json({ success: false, message: 'Failed to send report email' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create `vercel.json` at the project root**

Create `vercel.json` (same directory as `package.json`) with this exact content:

```json
{
  "crons": [
    { "path": "/api/cron/weekly-report", "schedule": "0 8 * * 1" }
  ]
}
```

- [ ] **Step 3: Verify the file compiles**

Run: `npx tsc --noEmit` from the `app/` directory. Pre-existing unrelated errors elsewhere in the project are not this task's concern — only make sure no new errors originate from `app/api/cron/weekly-report/route.ts`.

- [ ] **Step 4: Verify unauthenticated and wrongly-authenticated requests are rejected**

With the local dev server running on port 3000:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/cron/weekly-report
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/cron/weekly-report -H "Authorization: Bearer wrong-secret-value"
```

Expected: `401` for both (no `CRON_SECRET` is configured in this environment, and neither request carries a valid admin session token, so both fall through to the 401 branch).

- [ ] **Step 5: Commit**

```bash
git add "app/api/cron/weekly-report/route.ts" vercel.json
git commit -m "feat: add weekly sales report cron route"
```

---

## Deferred Manual Verification (human, authenticated admin session required)

- Obtain a real admin bearer token (e.g. from the browser's session after logging into `/admin`) and run: `curl http://localhost:3000/api/cron/weekly-report -H "Authorization: Bearer <admin-token>"` — confirm a `200` response with `sent: true` and numbers that look right against current DB state (or `sent: false, reason: ...` if the toggle is off / no recipient is configured at test time).
- With the "Weekly Sales Report" toggle on and a notification email configured in Settings, trigger the endpoint manually and confirm the email actually arrives, with the stat grid and top-products table rendering correctly.
- Toggle "Weekly Sales Report" off and confirm the endpoint responds `{ sent: false, reason: 'disabled' }` without sending anything.
- Once deployed to Vercel: add the `CRON_SECRET` environment variable in the Vercel project settings, confirm the scheduled cron entry appears under the project's Cron Jobs tab, and optionally trigger it manually from the Vercel dashboard to confirm end-to-end delivery.
