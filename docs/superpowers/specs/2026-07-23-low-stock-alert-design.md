# Low Stock Alert — Design

## Context

The Settings page's Notifications tab has a "Low Stock Alert" toggle that saves correctly to `content_blocks` under `settings.notifications` (field `lowStock`), alongside a `notificationEmail` field — neither is consumed by anything yet. This is the second of three notification features scoped as follow-up work when the Settings fixes were designed (the first, Shipping Update, is complete; the third, Weekly Sales Report, is not yet started).

Stock is only ever changed by an admin manually editing a product through the admin form (create or edit) — there is no automatic stock decrement on order creation anywhere in this codebase. So this alert can only ever be triggered by an admin's own save, never by real order-driven depletion.

## Goals

- Email an internal recipient (not a customer) when a product's stock genuinely crosses below 5 units, whether that happens on product creation or on editing an existing product.
- Resolve who that email goes to: `settings.notifications.notificationEmail`, falling back to `settings.store_info.contactEmail` if blank — this is the first spec where that documented fallback is actually implemented (it was deferred here when the Settings fixes were built, since no low-stock sender existed at that time).
- Never spam a repeat alert for a product that's simply re-saved while still below 5 (e.g. an admin correcting its description) — only fire on the actual crossing.

## Non-goals

- No new "low stock threshold" field — 5 stays hardcoded, matching the existing convention already documented in `_pages/admin/AdminProductForm.tsx`'s stock-count field hint ("Shows 'Low stock' warning below 5") and in the Settings Notifications description.
- No visual "Low stock" badge added to the admin products list — that hint text turns out to describe a badge that was never actually built anywhere in the list view. That's a separate, pre-existing gap, not part of this spec.
- No inventory-tracking system, no automatic stock decrement on order placement — stock remains entirely admin-managed.
- No changes to `sendOrderConfirmation` or `sendShippingUpdate` — both stay exactly as they are.

## Design

### Recipient resolution

A new function in `lib/resend.ts`:

```typescript
async function getNotificationRecipient(): Promise<string | null>
```

Reads `content_blocks` for `settings.notifications` and returns `value.notificationEmail` if it's a non-empty string. If blank/absent, reads `content_blocks` for `settings.store_info` and returns `value.contactEmail` if non-empty. If both are blank/absent, returns `null`. This is deliberately a small, shared piece of logic — Weekly Sales Report (the next spec) needs this exact same lookup, so it's built once here rather than duplicated.

### Trigger logic — product creation (`POST /api/admin/products`)

After a successful insert, if `stockCount` was provided in the request and the parsed value is `< 5`, treat this as a crossing (there is no "previous" stock level to compare against for a brand-new product) and proceed to send, subject to the gate below.

### Trigger logic — product edit (`PUT /api/admin/products/[id]`)

Before applying the update, fetch the product's current `stock_count`. After a successful update, if `stockCount` was part of this request body, the new value is `< 5`, **and** the previous value was `null` or `≥ 5`, treat this as a crossing and proceed to send. A save that doesn't touch `stockCount` at all, or one where the stock was already below 5 before this save, does not trigger anything.

### Gate

Both trigger points check `content_blocks` for `settings.notifications` and require `value?.lowStock === true` — an explicit opt-in check, not the `!== false` fail-open pattern used by `orderConfirm` and `shipUpdate`. This is a deliberate divergence: those two are core, expected customer/order-facing behavior; this one is an internal convenience the admin should turn on, so it defaults to silent until they do.

If the gate passes, `getNotificationRecipient()` is called; if it returns `null` (nothing configured in either Store Info or Notifications), the send is skipped silently — no error, since there's genuinely nowhere to send it.

### Email

New `sendLowStockAlert(data: LowStockAlertEmailData)` in `lib/resend.ts`, where:

```typescript
interface LowStockAlertEmailData {
  recipientEmail: string;
  productName: string;
  stockCount: number;
  productId: string;
}
```

Follows the same HTML template structure/branding as `sendOrderConfirmation` and `sendShippingUpdate` in the same file — same header/footer, same brand colors. Body: product name, current stock count, and a link to that product's admin edit page (`/admin/products/:id`) so the admin can act immediately. Both trigger points call this the same way: fire-and-forget with `.catch(console.error)`, never allowed to fail the product-save request itself.

## Error handling

- `getNotificationRecipient()` returning `null` is a normal, silent no-op — not an error.
- Fetching the pre-update stock count (edit path) or checking the gate/recipient (both paths) never blocks or fails the underlying product create/update response, matching the precedent set by `sendOrderConfirmation`/`sendShippingUpdate`.
- No format validation on `notificationEmail`/`contactEmail` beyond "is it a non-empty string" — if an admin saves a malformed email address in Settings, that's a Settings-page concern, not something this feature re-validates.

## Testing

This project has no automated test framework. Verification:

- `curl` checks that `POST`/`PUT` on the products admin routes still compile and reject unauthenticated requests with the new logic added.
- Manual check (requires an authenticated admin session, done by the human): with the Low Stock Alert toggle on and a notification email configured, edit a product's stock from 10 down to 3 and confirm the alert email arrives; edit it again from 3 to 2 and confirm no second email sends; create a brand-new product with an initial stock of 1 and confirm an alert fires for that too.
