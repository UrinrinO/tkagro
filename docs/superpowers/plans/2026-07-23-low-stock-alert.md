# Low Stock Alert Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Email an internal recipient (not a customer) whenever a product's stock genuinely crosses below 5 units, on both product creation and product edit, gated by an explicit opt-in toggle.

**Architecture:** Two new exports in `lib/resend.ts` — `getNotificationRecipient()` (shared recipient-resolution lookup against `content_blocks`) and `sendLowStockAlert()` (the branded HTML email, following the exact template pattern of `sendOrderConfirmation`/`sendShippingUpdate` in the same file). Both admin product routes (`POST /api/admin/products` and `PUT /api/admin/products/[id]`) call these after a successful write, gated by `content_blocks.settings.notifications.lowStock === true` (fail-closed — opposite of the fail-open pattern used for `orderConfirm`/`shipUpdate`).

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (Postgres), Resend.

## Global Constraints

- Threshold is hardcoded at `5` (stock `< 5` triggers) — no configurable field, matching the existing "below 5" convention already used elsewhere in the admin UI.
- Gate check is fail-closed: `value?.lowStock === true` (send only fires when explicitly enabled) — this is a deliberate divergence from `orderConfirm`/`shipUpdate`'s `!== false` fail-open pattern.
- Recipient resolution: `settings.notifications.notificationEmail` first (non-empty string), falling back to `settings.store_info.contactEmail` (non-empty string), else `null` — if `null`, skip the send silently, no error.
- Product creation: no "previous" stock to compare against — any `stockCount` provided at `< 5` counts as a crossing.
- Product edit: fetch `stock_count` before applying the update; only fire if the new value is `< 5` **and** the previous value was `null` or `>= 5` (transition-only — re-saving an already-low-stock product must never re-send).
- Email send is always fire-and-forget with `.catch(console.error)` — must never fail or block the parent create/update response.
- No changes to `sendOrderConfirmation` or `sendShippingUpdate`.
- This project has no automated test framework — verification is `curl` (auth-gate + compile checks) plus a manual admin-session check deferred to the human.

---

### Task 1: Recipient resolution + low stock email in `lib/resend.ts`

**Files:**
- Modify: `lib/resend.ts` (151 lines currently — add an import at the top, and two new exports at the end of the file)

**Interfaces:**
- Produces: `export async function getNotificationRecipient(): Promise<string | null>` and `export interface LowStockAlertEmailData { recipientEmail: string; productName: string; stockCount: number; productId: string }` and `export async function sendLowStockAlert(data: LowStockAlertEmailData): Promise<void>` — both consumed by Task 2 and Task 3.

- [ ] **Step 1: Add the Supabase import**

`lib/resend.ts` currently has no Supabase import (only `Resend` is imported). `getNotificationRecipient()` needs to query `content_blocks`. Find:

```typescript
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY');
```

Replace with:

```typescript
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase-server';

if (!process.env.RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY');
```

- [ ] **Step 2: Append `getNotificationRecipient()` and `sendLowStockAlert()` to the end of the file**

The file currently ends (line 149-151) with:

```typescript
</body>
</html>`,
  });
}
```

(the closing of `sendShippingUpdate`). Append this new content immediately after that closing `}` (keep a blank line before it):

```typescript

export async function getNotificationRecipient(): Promise<string | null> {
  const { data: notifRow } = await supabase
    .from('content_blocks')
    .select('value')
    .eq('key', 'settings.notifications')
    .single();
  const notificationEmail = (notifRow?.value as any)?.notificationEmail;
  if (typeof notificationEmail === 'string' && notificationEmail.trim() !== '') {
    return notificationEmail;
  }

  const { data: storeRow } = await supabase
    .from('content_blocks')
    .select('value')
    .eq('key', 'settings.store_info')
    .single();
  const contactEmail = (storeRow?.value as any)?.contactEmail;
  if (typeof contactEmail === 'string' && contactEmail.trim() !== '') {
    return contactEmail;
  }

  return null;
}

export interface LowStockAlertEmailData {
  recipientEmail: string;
  productName: string;
  stockCount: number;
  productId: string;
}

export async function sendLowStockAlert(data: LowStockAlertEmailData) {
  await resend.emails.send({
    from: FROM,
    to: data.recipientEmail,
    subject: `Low stock alert — ${data.productName} | T.kays Agrocosmetics`,
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
      <h2 style="margin:0 0 8px;color:#2d5016;font-size:22px">Low Stock Alert</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:15px">
        One of your products has dropped below 5 units in stock.
      </p>
      <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px;display:inline-block">
        <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Product</span>
        <span style="display:block;font-size:16px;font-weight:700;color:#1a1a1a;margin-top:2px">${data.productName}</span>
      </div>
      <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:24px;margin-left:12px;display:inline-block">
        <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Current stock</span>
        <span style="display:block;font-size:16px;font-weight:700;color:#1a1a1a;margin-top:2px">${data.stockCount}</span>
      </div>
      <p style="margin:24px 0 0;font-size:14px">
        <a href="https://www.tkaysagrocosmetics.com/admin/products/${data.productId}" style="color:#2d5016;font-weight:600">Update this product →</a>
      </p>
      <p style="margin:32px 0 0;font-size:13px;color:#9ca3af;line-height:1.6">
        You're receiving this because Low Stock Alerts are enabled in Admin → Settings → Notifications.
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

- [ ] **Step 3: Verify the file compiles**

Run: `npx tsc --noEmit lib/resend.ts 2>&1 | head -50` from the `app/` directory (or `cd app && npx next build --no-lint` if `tsc` alone doesn't resolve path aliases — use whichever the project already uses elsewhere; check `package.json` scripts for the existing typecheck command first and prefer that).

Expected: no new type errors introduced by this file (pre-existing unrelated errors elsewhere in the project, if any, are not this task's concern).

- [ ] **Step 4: Commit**

```bash
git add lib/resend.ts
git commit -m "feat: add low stock alert email and recipient resolution"
```

---

### Task 2: Trigger on product creation (`POST /api/admin/products`)

**Files:**
- Modify: `app/api/admin/products/route.ts`

**Interfaces:**
- Consumes: `getNotificationRecipient(): Promise<string | null>` and `sendLowStockAlert(data: LowStockAlertEmailData): Promise<void>` from `@/lib/resend` (Task 1).

- [ ] **Step 1: Add the import**

Find (top of file):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
```

Replace with:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { getNotificationRecipient, sendLowStockAlert } from '@/lib/resend';
```

- [ ] **Step 2: Add the trigger after a successful insert**

Find the end of the `POST` handler:

```typescript
  const { data, error } = await supabase.from('products').insert({
    slug: slugify(name), name, tagline: tagline ?? null, short_description: shortDescription ?? null,
    description: description ?? null, price: parseFloat(price),
    compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
    category, concern: Array.isArray(concern) ? concern : (concern ? [concern] : []),
    image_url: imageUrl ?? null, weight_grams: weightGrams ? parseInt(weightGrams, 10) : null,
    stock_count: body.stockCount !== undefined ? parseInt(body.stockCount, 10) : null,
    in_stock: inStock ?? true, is_new: isNew ?? false, is_best_seller: isBestSeller ?? false,
  }).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { product: toDTO(data) } }, { status: 201 });
}
```

Replace with:

```typescript
  const { data, error } = await supabase.from('products').insert({
    slug: slugify(name), name, tagline: tagline ?? null, short_description: shortDescription ?? null,
    description: description ?? null, price: parseFloat(price),
    compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
    category, concern: Array.isArray(concern) ? concern : (concern ? [concern] : []),
    image_url: imageUrl ?? null, weight_grams: weightGrams ? parseInt(weightGrams, 10) : null,
    stock_count: body.stockCount !== undefined ? parseInt(body.stockCount, 10) : null,
    in_stock: inStock ?? true, is_new: isNew ?? false, is_best_seller: isBestSeller ?? false,
  }).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });

  if (body.stockCount !== undefined && parseInt(body.stockCount, 10) < 5) {
    const { data: notifSettings } = await supabase
      .from('content_blocks')
      .select('value')
      .eq('key', 'settings.notifications')
      .single();
    const lowStockEnabled = (notifSettings?.value as any)?.lowStock === true;

    if (lowStockEnabled) {
      getNotificationRecipient().then((recipientEmail) => {
        if (!recipientEmail) return;
        return sendLowStockAlert({
          recipientEmail,
          productName: data.name,
          stockCount: data.stock_count,
          productId: data.id,
        });
      }).catch((err) => console.error('[resend] low stock alert failed:', err));
    }
  }

  return NextResponse.json({ success: true, data: { product: toDTO(data) } }, { status: 201 });
}
```

- [ ] **Step 3: Verify unauthenticated requests still get rejected**

Run (with local dev server running on port 3000):

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/admin/products -H "Content-Type: application/json" -d '{"name":"Test","price":10,"category":"skincare"}'
```

Expected: `403` (no auth header provided — proves the route still compiles and auth-gates before touching the new logic).

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/products/route.ts
git commit -m "feat: trigger low stock alert on product creation"
```

---

### Task 3: Trigger on product edit (`PUT /api/admin/products/[id]`)

**Files:**
- Modify: `app/api/admin/products/[id]/route.ts`

**Interfaces:**
- Consumes: `getNotificationRecipient(): Promise<string | null>` and `sendLowStockAlert(data: LowStockAlertEmailData): Promise<void>` from `@/lib/resend` (Task 1).

- [ ] **Step 1: Add the import**

Find (top of file):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
```

Replace with:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { getNotificationRecipient, sendLowStockAlert } from '@/lib/resend';
```

(Note: this file also defines its own local `requireAdmin`, `toDTO`, and `slugify` — leave those untouched.)

- [ ] **Step 2: Fetch previous stock before applying the update, and trigger after a successful update**

Find the full `PUT` handler body:

```typescript
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const body = await request.json();
  const { name, tagline, shortDescription, description, price, compareAtPrice, category, concern, imageUrl, weightGrams, inStock, isNew, isBestSeller } = body;
  const updates: Record<string, any> = {};
  if (name !== undefined) { updates.name = name; updates.slug = slugify(name); }
  if (tagline !== undefined) updates.tagline = tagline;
  if (shortDescription !== undefined) updates.short_description = shortDescription;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = parseFloat(price);
  if (compareAtPrice !== undefined) updates.compare_at_price = compareAtPrice ? parseFloat(compareAtPrice) : null;
  if (category !== undefined) updates.category = category;
  if (concern !== undefined) updates.concern = Array.isArray(concern) ? concern : (concern ? [concern] : []);
  if (imageUrl !== undefined) updates.image_url = imageUrl;
  if (weightGrams !== undefined) updates.weight_grams = weightGrams ? parseInt(weightGrams, 10) : null;
  if (body.stockCount !== undefined) updates.stock_count = body.stockCount !== null ? parseInt(body.stockCount, 10) : null;
  if (inStock !== undefined) updates.in_stock = inStock;
  if (isNew !== undefined) updates.is_new = isNew;
  if (isBestSeller !== undefined) updates.is_best_seller = isBestSeller;

  const { data, error } = await supabase.from('products').update(updates).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { product: toDTO(data) } });
}
```

Replace with:

```typescript
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const body = await request.json();
  const { name, tagline, shortDescription, description, price, compareAtPrice, category, concern, imageUrl, weightGrams, inStock, isNew, isBestSeller } = body;

  const { data: existing } = await supabase.from('products').select('stock_count').eq('id', params.id).single();
  const previousStockCount = existing?.stock_count;

  const updates: Record<string, any> = {};
  if (name !== undefined) { updates.name = name; updates.slug = slugify(name); }
  if (tagline !== undefined) updates.tagline = tagline;
  if (shortDescription !== undefined) updates.short_description = shortDescription;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = parseFloat(price);
  if (compareAtPrice !== undefined) updates.compare_at_price = compareAtPrice ? parseFloat(compareAtPrice) : null;
  if (category !== undefined) updates.category = category;
  if (concern !== undefined) updates.concern = Array.isArray(concern) ? concern : (concern ? [concern] : []);
  if (imageUrl !== undefined) updates.image_url = imageUrl;
  if (weightGrams !== undefined) updates.weight_grams = weightGrams ? parseInt(weightGrams, 10) : null;
  if (body.stockCount !== undefined) updates.stock_count = body.stockCount !== null ? parseInt(body.stockCount, 10) : null;
  if (inStock !== undefined) updates.in_stock = inStock;
  if (isNew !== undefined) updates.is_new = isNew;
  if (isBestSeller !== undefined) updates.is_best_seller = isBestSeller;

  const { data, error } = await supabase.from('products').update(updates).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });

  if (
    body.stockCount !== undefined &&
    body.stockCount !== null &&
    parseInt(body.stockCount, 10) < 5 &&
    (previousStockCount === null || previousStockCount === undefined || previousStockCount >= 5)
  ) {
    const { data: notifSettings } = await supabase
      .from('content_blocks')
      .select('value')
      .eq('key', 'settings.notifications')
      .single();
    const lowStockEnabled = (notifSettings?.value as any)?.lowStock === true;

    if (lowStockEnabled) {
      getNotificationRecipient().then((recipientEmail) => {
        if (!recipientEmail) return;
        return sendLowStockAlert({
          recipientEmail,
          productName: data.name,
          stockCount: data.stock_count,
          productId: data.id,
        });
      }).catch((err) => console.error('[resend] low stock alert failed:', err));
    }
  }

  return NextResponse.json({ success: true, data: { product: toDTO(data) } });
}
```

- [ ] **Step 3: Verify unauthenticated requests still get rejected**

Run (with local dev server running on port 3000; replace `some-id` with any string — the auth check happens before the ID is used):

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X PUT http://localhost:3000/api/admin/products/some-id -H "Content-Type: application/json" -d '{"stockCount": 2}'
```

Expected: `403`.

- [ ] **Step 4: Commit**

```bash
git add "app/api/admin/products/[id]/route.ts"
git commit -m "feat: trigger low stock alert on product edit stock crossing"
```

---

## Deferred Manual Verification (human, authenticated admin session required)

- With the Low Stock Alert toggle **on** and a notification email configured in Settings, edit a product's stock from 10 down to 3 — confirm the alert email arrives.
- Edit that same product again from 3 to 2 — confirm no second email sends (transition-only).
- Create a brand-new product with an initial stock of 1 — confirm an alert fires for that too.
- With the toggle **off**, repeat a below-5 edit — confirm no email sends.
- With the toggle on but both `notificationEmail` and `contactEmail` blank in Settings — confirm no email sends and no error is thrown (silent no-op).
