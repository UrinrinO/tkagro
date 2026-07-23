# Weekly Sales Report — Design

## Context

The Settings page's Notifications tab already has a "Weekly Sales Report" toggle (`weeklyReport`, default `false`) that saves correctly to `content_blocks` under `settings.notifications`, described in the UI as "Receive a weekly email summary of sales, revenue, and top products" — but nothing consumes it. This is the third and final of three notification features scoped as follow-up work when the Settings fixes were designed (Shipping Update and Low Stock Alert are both complete).

Unlike the other two, this feature has no existing trigger point (no order or product write to hook into) — it needs its own scheduled entry point and its own aggregation query, since no per-period sales aggregation currently exists anywhere in the codebase (the admin dashboard's "top products" is simply products flagged `is_best_seller`, not a real sales ranking).

## Goals

- Send a weekly email to an internal recipient summarizing the trailing 7 days of sales: orders count, total revenue, average order value, new customers, and the top 5 products by revenue.
- Run automatically on a schedule (Vercel Cron, matching the project's confirmed deployment target) and be independently triggerable on demand (by an authenticated admin) for testing, without waiting a week.
- Reuse the existing `getNotificationRecipient()` (from the Low Stock Alert work) for recipient resolution — no new lookup logic.
- Gate sending on `settings.notifications.weeklyReport === true`, matching Low Stock Alert's fail-closed convention (an internal convenience the admin opts into, not a customer-facing default).

## Non-goals

- No new Settings UI — the `weeklyReport` toggle and `notificationEmail` field already exist and already save correctly.
- No historical report archive or admin-viewable report history — this is fire-and-check-your-inbox only, same as the other two email features.
- No configurable window length or schedule — 7 days rolling, one weekly cron entry, hardcoded.
- No changes to the admin dashboard's existing (unrelated, `is_best_seller`-based) "top products" widget.

## Design

### Trigger & authorization

New route: `app/api/cron/weekly-report/route.ts`, exporting `GET`.

Two valid authorization paths, checked in this order:
1. `Authorization: Bearer <CRON_SECRET>` where `CRON_SECRET` is a new environment variable — Vercel Cron automatically attaches this header to its scheduled requests when `CRON_SECRET` is set in the project's environment. This project does not yet have this env var; it must be added to Vercel's project settings at deploy time (not something this implementation can set itself).
2. A valid admin session bearer token, verified with the same `requireAdmin(request)` pattern duplicated in every other admin route in this codebase — lets an admin manually trigger a real run via `curl` with their own login, for testing without waiting for the scheduled fire.

Any request satisfying neither returns `401`.

A `vercel.json` is added at the project root:

```json
{
  "crons": [
    { "path": "/api/cron/weekly-report", "schedule": "0 8 * * 1" }
  ]
}
```

(Monday 08:00 UTC — arbitrary but sensible; the window is rolling from fire time, not calendar-aligned, so the exact day/time has no functional effect on correctness.)

### Window

Rolling 7 days anchored to the request's execution time: `windowStart = now - 7 days`, `windowEnd = now`. Not calendar-aligned. The report always sends when the gate/recipient checks pass, even if the window contains zero qualifying orders — a "0 orders this week" report is itself a useful signal (e.g. it surfaces a broken checkout) rather than something to hide by skipping silently.

### Aggregation

Query orders in the window, excluding the same categories the existing admin dashboard route (`app/api/admin/dashboard/route.ts`) already excludes from its revenue figure:

```typescript
const { data: orders, error } = await supabase
  .from('orders')
  .select('total, customer_email, items, created_at')
  .gte('created_at', windowStart.toISOString())
  .lt('created_at', windowEnd.toISOString())
  .neq('status', 'Cancelled')
  .neq('payment_status', 'Refunded');
```

From `orders`, computed in application code:

- **`ordersCount`** — `orders.length`
- **`totalRevenue`** — sum of `parseFloat(total)` across `orders`
- **`averageOrderValue`** — `ordersCount > 0 ? totalRevenue / ordersCount : 0`
- **`newCustomers`** — count of distinct `customer_email` values among `orders` whose *earliest-ever* order (queried separately, unfiltered by status/payment_status — a customer's first order counts as their "first" even if it was later cancelled) falls within `[windowStart, windowEnd)`:

  ```typescript
  const emails = [...new Set(orders.map(o => o.customer_email))];
  const { data: firstOrders } = await supabase
    .from('orders')
    .select('customer_email, created_at')
    .in('customer_email', emails)
    .order('created_at', { ascending: true });
  const firstOrderByEmail = new Map<string, string>();
  for (const o of firstOrders ?? []) {
    if (!firstOrderByEmail.has(o.customer_email)) firstOrderByEmail.set(o.customer_email, o.created_at);
  }
  const newCustomers = emails.filter(e => {
    const first = firstOrderByEmail.get(e);
    return first && new Date(first) >= windowStart && new Date(first) < windowEnd;
  }).length;
  ```

- **`topProducts`** — parse the `items` JSONB array on every order in `orders`. Each item has the shape `{ id, name, qty, price, subtotal }` (confirmed against live data). Group by item `id`, summing `subtotal` (→ `revenue`) and `qty` (→ `unitsSold`) per product. Sort by summed `revenue` descending, take the top 5. Product `name` is read from the item entry itself (denormalized at time of sale) — no join to the `products` table, so a since-renamed or deleted product still displays under the name it had when it sold. If an order's `items` value is missing, not an array, or an entry is malformed (missing `id`/`name`/`subtotal`), skip that entry defensively rather than throwing — `items` is unconstrained JSONB with no schema enforcement.

### Gate & recipient

After a successful authorization check:

```typescript
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
```

Both "skipped" cases return `200`, not an error — so Vercel Cron's own execution logs show a clean run whether or not the report was actually sent.

### Email

New `sendWeeklySalesReport(data: WeeklySalesReportEmailData)` in `lib/resend.ts`:

```typescript
interface WeeklySalesReportEmailData {
  recipientEmail: string;
  windowStart: string;
  windowEnd: string;
  ordersCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  newCustomers: number;
  topProducts: { name: string; unitsSold: number; revenue: number }[];
}
```

Follows the same HTML template structure/branding as the other three functions in the file (same header/footer, same `#2d5016`/`#c9a84c` colors). Subject: `Weekly Sales Report — <windowStart> to <windowEnd> | T.kays Agrocosmetics` (dates formatted as e.g. `Jul 16` for display). Body: a stat grid of the four headline numbers (orders, revenue, AOV, new customers) styled like the existing stat boxes in the other templates, followed by a simple ranked list of the top products (name, units sold, revenue) — or "No sales this week" text in that section when `topProducts` is empty.

### Response & error handling

Unlike the other three email features (which fire-and-forget inside an unrelated create/update request and must never block that response), this route's entire purpose is sending the email, so the send is **awaited** and its outcome reported in the JSON response:

```typescript
try {
  await sendWeeklySalesReport({ ...computedData, recipientEmail });
  return NextResponse.json({ success: true, data: { sent: true, ...computedData } });
} catch (err) {
  console.error('[cron] weekly sales report send failed:', err);
  return NextResponse.json({ success: false, message: 'Failed to send report email' }, { status: 500 });
}
```

A database query failure during aggregation (e.g. the orders `select` itself erroring) returns `500` with the error message — there's no parent request to protect here.

## Testing

This project has no automated test framework. Verification:

- `curl` check: request with no `Authorization` header → `401`.
- `curl` check: request with `Authorization: Bearer wrong-secret` → `401`.
- `curl` check: request with a real admin bearer token → `200`, with `sent: true` and real numbers from current DB state (or `sent: false, reason: ...` if the toggle is off / no recipient configured at test time).
- Manual check (requires an authenticated admin session, done by the human): with the toggle on and a notification email configured, trigger the endpoint manually and confirm the email arrives with correct-looking numbers matching what's in the database; toggle off and confirm the endpoint responds `sent: false, reason: 'disabled'` without sending anything.
