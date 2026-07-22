# Settings Page Fixes — Design

## Context

`_pages/admin/AdminSettings.tsx` (213 lines) is a pure visual mockup: all four tabs (Store Info, Payment, Shipping, Notifications) render forms with no API calls anywhere, and every "Save" button just calls `alert('...saved')`. This surfaced during the live admin dashboard guide research earlier this session. This spec covers making the page honest: two tabs are removed because wiring them up for real would be actively wrong to build, and two tabs are wired to real, persisted data.

This is the first of two specs. A second, separate spec (not covered here) will build three new automated email features — Shipping Update, Low Stock Alert, and a Weekly Sales Report with Vercel Cron — that consult the notification preferences this spec persists. Splitting these was a deliberate scope decision: this spec is "make the Settings UI stop lying," the second is genuinely new feature development with its own design questions (email templates, cron scheduling, stock-alert thresholds).

## Goals

- Remove the two tabs that should never be wired up as designed (Payment, Shipping), replacing each with an honest, minimal alternative.
- Make Store Info persist for real, and have the live Contact page consume it — fixing the placeholder phone number (`+233 XX XXX XXXX`) flagged in an earlier review this session.
- Make Notification preferences persist for real, and gate the one notification that already has a real feature behind it (Order Confirmation emails, which currently send unconditionally).

## Non-goals

- Building the three new notification features themselves (Shipping Update trigger, Low Stock Alert trigger, Weekly Sales Report + cron) — that's the second spec.
- Any real save functionality for Stripe keys through a web form — this is a deliberate architectural decision, not a deferred one. Secret keys stay in `.env.local`, managed by a developer.
- A second, competing flat-rate shipping system — the existing zone-based system at `/admin/shipping` remains the only real shipping configuration.
- Changing Footer.tsx — it displays static brand identity (name, tagline), not operational contact info, so it isn't a consumer of Store Info.

## Design

### Payment tab → removed, replaced with a status card

Replace the current form (Publishable Key / Secret Key / Webhook Secret inputs, Test/Live toggle) with a small read-only card: a "Stripe — Active" status line and one sentence: "Payment keys are configured on the server by your developer — not editable here." No inputs, no save button, no API call.

### Shipping tab → removed, replaced with a redirect note

Replace the current flat-rate form (thresholds, rates, region checkboxes) with a short note and a link to `/admin/shipping`: "Shipping rates are managed on the Shipping page." No inputs, no save button, no API call.

The Settings tab bar goes from four tabs to two: **Store Info** and **Notifications**.

### Store Info tab → wired to `content_blocks`

New content key: `settings.store_info`, holding:

```json
{
  "storeName": "T.kays Agrocosmetics",
  "contactEmail": "hello@tkaysagrocosmetics.com",
  "contactPhone": "",
  "address": "London, United Kingdom",
  "currency": "GBP (£)"
}
```

- Add `'settings.store_info'` to the `ALLOWED_KEYS` set in `app/api/admin/content/[key]/route.ts` — this single line is the actual reason saving doesn't work today; the PUT endpoint itself already works correctly for any allowed key.
- The tab's Save button calls the existing `PUT /api/admin/content/settings.store_info` (no new endpoint needed).
- On load, the tab fetches via the existing `GET /api/admin/content` (which already returns all blocks keyed by name) and reads the `settings.store_info` entry, the same pattern `AdminCMS.tsx` already uses for its sections.
- `_pages/ContactPage.tsx` changes from hardcoded email/phone strings to fetching `GET /api/content/settings.store_info` (the existing public read endpoint, already unauthenticated) and rendering `contactEmail` / `contactPhone` from the response. This is what fixes the placeholder phone number.

### Notifications tab → wired to `content_blocks`

New content key: `settings.notifications`, holding:

```json
{
  "orderConfirm": true,
  "shipUpdate": false,
  "lowStock": false,
  "weeklyReport": false,
  "notificationEmail": ""
}
```

- Add `'settings.notifications'` to the same `ALLOWED_KEYS` set.
- Save button calls `PUT /api/admin/content/settings.notifications`; load reads it the same way as Store Info, via `GET /api/admin/content`.
- `notificationEmail` starts empty (`""`). When empty, anything that needs to send an admin notification (this spec: none directly; future spec: the three new features) falls back to `settings.store_info.contactEmail`. This spec does not need to implement that fallback anywhere itself, since it introduces no sender — it's documented here so the second spec doesn't have to re-derive it.
- The hardcoded mockup default (the site owner's personal Gmail address) is removed entirely — it was never a real default, just a leftover placeholder value in the UI code.
- `app/api/orders/route.ts`'s existing unconditional call to `sendOrderConfirmation(...)` is wrapped: before calling it, read `settings.notifications` from `content_blocks` and only send if `orderConfirm` is `true`. This is the one toggle in this spec with a real, already-existing feature to gate.
- `shipUpdate`, `lowStock`, and `weeklyReport` save and load correctly in this spec but trigger nothing yet — there is no misleading UI state to manage, since nothing in this spec's UI claims they're active. They simply behave like normal settings that happen to not be consulted by anything yet, exactly as they'll continue to look once the second spec makes them meaningful.

## Error handling

No new validation logic. Both new keys reuse the admin content API's existing checks verbatim: unknown key → 400 (`Unknown content key: "..."`), missing `value` in the request body → 400 (`` `value` is required ``), not-admin → 403. There is nothing content-specific to validate beyond what the existing endpoint already enforces generically.

## Testing

This project has no automated test framework (confirmed: no jest/vitest/playwright anywhere in the repo). Verification, matching how every other change this session was verified:

- `curl` checks that `PUT /api/admin/content/settings.store_info` and `.../settings.notifications` succeed and that `GET /api/admin/content` reflects the saved values.
- `curl` check that `GET /api/content/settings.store_info` (public, unauthenticated) returns the same data.
- Manual browser check: Store Info's saved phone/email actually render on the live `/contact` page.
- Manual browser check: with `orderConfirm` set to `false`, placing a real test order does not trigger a confirmation email; with it set to `true`, it does.
