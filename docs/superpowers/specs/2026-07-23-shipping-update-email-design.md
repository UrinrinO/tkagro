# Shipping Update Email — Design

## Context

The Settings page's Notifications tab (fixed earlier this session) has a "Shipping Update" toggle that already saves correctly to `content_blocks` under the key `settings.notifications` (field `shipUpdate`), but nothing consumes it — no email currently sends when an order ships. This is the first of three notification features scoped as follow-up work when the Settings fixes were designed (the other two, Low Stock Alert and Weekly Sales Report, are separate specs).

## Goals

- Send a real "your order has shipped" email to the customer the moment an admin marks an order as Shipped, gated by the existing `shipUpdate` preference.
- Let the admin optionally attach a tracking number when marking an order Shipped, included in the email if present.
- Never re-send the email on a later, unrelated edit to an already-Shipped order (e.g. fixing a typo in the tracking number).

## Non-goals

- No carrier detection or generated tracking-link URLs — the tracking number is a plain string, included as-is in the email. Carrier-specific tracking links are a possible future enhancement, not in scope here.
- No changes to the customer-facing order-tracking experience beyond the email itself (no "track my order" page, no SMS).
- No changes to `sendOrderConfirmation` or the Order Confirmation toggle — those are already correct and untouched.

## Design

### Data model

Add one nullable column to the existing `orders` table:

```sql
ALTER TABLE orders ADD COLUMN tracking_number text;
```

No other schema changes. This will be run directly against the database via the existing pooler connection, with explicit user confirmation immediately before execution, matching how the `ingredients` table was created earlier this session.

### Admin UI

`_pages/admin/AdminOrderDetail.tsx` gains one new plain-text input, "Tracking Number," alongside the existing order-status dropdown. It's optional and has no format validation. Saving submits both the status and the tracking number together through the same existing `PATCH /api/admin/orders/[id]` call, extended to accept an optional `trackingNumber` field in its request body alongside the existing `status` field.

### Trigger logic

`app/api/admin/orders/[id]/route.ts`'s `PATCH` handler:

1. Fetches the order's current `status` and `tracking_number` before applying any update (it already fetches the order implicitly via the update call; this adds a read of the pre-update state).
2. Applies the update (`status`, and `tracking_number` if provided) exactly as it does today.
3. After a successful update, sends the shipping email only if the order's status is now `'Shipped'` **and** the status immediately before this update was NOT `'Shipped'` — i.e., only on the transition into Shipped, never on a subsequent edit to an already-Shipped order. Editing the tracking number on an order that's already Shipped updates the stored value but does not re-send the email.
4. Before sending, reads `content_blocks` for key `settings.notifications` and checks `value?.shipUpdate !== false` — defaults to sending when the row doesn't exist yet (same fail-open pattern as `orderConfirm`), since a customer expects a shipping notification just as much as an order confirmation.
5. The send is fire-and-forget with a `.catch(console.error)`, exactly matching how `sendOrderConfirmation` is called in `app/api/orders/route.ts` — an email delivery failure must never fail the status-update request itself.

### Email

New `sendShippingUpdate(data: ShippingUpdateEmailData)` in `lib/resend.ts`, where:

```typescript
interface ShippingUpdateEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  trackingNumber?: string | null;
}
```

The HTML template mirrors `sendOrderConfirmation`'s exact structure and inline styling (same header block, same brand colors `#2d5016`/`#c9a84c`, same footer) so the two emails feel like the same system, with different body content: a "Your order has shipped!" heading, the order number in the same styled box `sendOrderConfirmation` uses, and — only when `trackingNumber` is present and non-empty — an additional line showing it. No line items, no shipping address repeat (the customer already has that from the confirmation email).

## Error handling

- Missing/failed email send: caught and logged, never blocks the status-update response (matches existing `sendOrderConfirmation` call site behavior).
- `settings.notifications` row absent: treated as `shipUpdate` enabled (fail-open), matching the `orderConfirm` precedent.
- Tracking number is optional at every layer (DB column nullable, form field optional, email template conditionally renders it) — there is no "invalid" tracking number state, since there's no format to validate against.

## Testing

This project has no automated test framework. Verification:

- `curl` check that the migration applied (`SELECT tracking_number FROM orders LIMIT 1` succeeds without error).
- `curl` check that `PATCH /api/admin/orders/:id` with `{status: "Shipped", trackingNumber: "..."}` returns 403 without auth (proves the route still compiles and the new field doesn't break existing auth-gating).
- Manual check (requires an authenticated admin session, done by the human): mark a real test order as Shipped with a tracking number, confirm the email arrives with the tracking number shown; edit that same order's tracking number afterward and confirm no second email sends.
