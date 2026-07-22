# CMS Wiring — Design

## Context

The site has a fully-built CMS backend: a `content_blocks` key-value table, a working public read API (`GET /api/content/:key`, `GET /api/content?keys=a,b,c`), a working admin CRUD API (`GET/PUT /api/admin/content[/:key]`), and a complete 779-line admin editor (`_pages/admin/AdminCMS.tsx`) that already targets exactly the right content keys: `homepage.hero`, `homepage.trust_strip`, `homepage.why_tkays`, `homepage.newsletter`, `about.brand_story`, `about.founder`, `about.balanced_wellness`, `about.vhon`, `about.dice`, `testimonials`, `faqs`. This surfaced during an admin dashboard documentation pass earlier this session: an admin could edit and save any of this content today and nothing would change on the live site, because none of the seven public-facing consumers actually fetch from this API — they all render hardcoded strings and arrays.

This is the second of two specs planned this session (the first, Settings page fixes, is complete). This spec wires the public side.

## Goals

- Make every one of the seven affected components/pages read from the already-working content API instead of hardcoded values.
- Never break or blank out a live marketing page — every component keeps its current hardcoded content as a fallback default, only overwritten by a successful, non-empty fetch.
- Change nothing about behavior the CMS doesn't manage — rotating hero text/product cards, the newsletter subscribe form, FAQ search/filtering, section eyebrows/headings not covered by a content key, and any hardcoded icons all stay exactly as they are.

## Non-goals

- No new content keys, no changes to the `content_blocks` schema, no changes to `AdminCMS.tsx` — the backend and the admin editor are already complete and correct.
- No rich-text/formatting support. Every admin-editable field is a plain string (as `AdminCMS.tsx` already only offers plain text/textarea inputs), so decorative inline styling in the current hardcoded JSX (line breaks, italics) is lost once a field is actually edited via the CMS — this is an inherent property of the existing admin form, not a new limitation introduced here.
- No photo/icon fields added to any admin form. Testimonials added via the CMS render with an initials circle instead of a photo (the `Testimonial` type has no photo field); trust badges and "Why T.kays" cards keep their current hardcoded icons regardless of content edits (neither `TrustItem` display nor the "Why T.kays" cards currently render an icon from data).
- No changes to sections not covered by an existing content key: the About page's hero banner and Vision & Mission cards, the homepage "Why T.kays" section's own eyebrow/heading/subtext, the Testimonials section's eyebrow/heading and trust bar, and the Newsletter section's perk chips all stay hardcoded.

## Design

### Shared wiring pattern (applies to all seven components)

- Each component's current hardcoded value(s) become the initial `useState` default(s) — visually identical to today until content actually loads.
- A `useEffect` on mount fetches from the public content API. Components whose content all renders on the same page (the four homepage components) share one bulk call via `GET /api/content?keys=homepage.hero,homepage.trust_strip,homepage.why_tkays,homepage.newsletter` (and similarly one call for the five About-page keys) rather than one fetch per component, to avoid redundant round-trips on a single page load. Components that stand alone (`FAQPage`, `TestimonialsSection`) use the single-key endpoint `GET /api/content/:key`.
- On a successful response, only fields that are actually present and non-empty are applied over the defaults — a partial edit (e.g. only one CTA button's text was changed via the admin) never blanks out other untouched fields.
- On any fetch failure, or if a key doesn't exist yet in `content_blocks`, the component silently keeps its hardcoded defaults — no error UI, no loading skeleton, no layout shift. This matches the pattern already shipped in `_pages/ContactPage.tsx` earlier this session.

### Homepage components

- **`components/HeroSection.tsx`**: `headline` replaces the static "Potent African skincare for" line (`styles.headingLine1`); `subheadline`, `ctaText`/`ctaUrl`, `secondaryCtaText`/`secondaryCtaUrl` replace their hardcoded counterparts. The `ROTATING_WORDS` cycle and the rotating product-card carousel are untouched — neither is part of `homepage.hero`.
- **`components/TrustStrip.tsx`**: the hardcoded `ITEMS` string array is replaced by `trust_strip[].text` values; the existing "double the array for a seamless marquee" logic operates unchanged on whichever array it's given. `TrustItem.icon` is not rendered — this component has never displayed icons.
- **`components/WhyTkaysSection.tsx`**: `why_tkays[]` provides `heading`/`text` for the four existing cards, zipped by array index (card `id` and hardcoded icon stay fixed per index regardless of fetched array length; if the fetched array is shorter or longer than 4, only pairs up to the shorter length are overridden). The section's own eyebrow/heading/subtext are not part of this content key and stay hardcoded.
- **`components/NewsletterSection.tsx`**: `heading`/`subtext`/`placeholder`/`buttonText` replace their hardcoded counterparts. The perk chips and the subscribe form's validation/submit logic (`POST /api/newsletter`) are untouched.
- One shared fetch: `GET /api/content?keys=homepage.hero,homepage.trust_strip,homepage.why_tkays,homepage.newsletter`, made once at the point in the component tree where these four are commonly rendered (the homepage), with the result passed down or re-fetched per-component as implementation convenience dictates — the implementation plan will decide the exact mechanics (e.g. a shared parent fetch vs. each component fetching independently from the same bulk endpoint), since both satisfy this spec's requirement of "one network round trip for the homepage's CMS content," but the code structure decision belongs in planning, not design.

### About page (`_pages/AboutPage.tsx`)

- `BRAND_STORY.intro`/`BRAND_STORY.body` → `about.brand_story.intro`/`.body`. The existing `body.split('\n\n')`-into-paragraphs logic is unchanged, operating on the fetched string.
- The hardcoded founder name ("Tijesunimi Olakojo," appearing in both the H2 heading and the floating photo-card caption) and title ("Founder & Formulator," appearing in the photo-card caption and the bottom byline) plus `FOUNDER_BIO` → `about.founder.name`/`.title`/`.bio`. The shortened first-name-only pull-quote ("— Tijesunimi") stays hardcoded, not derived from `name`.
- `BALANCED_WELLNESS` → `about.balanced_wellness.quote`, direct replacement.
- `VHON`/`DICE` arrays → `about.vhon`/`about.dice` — exact 1:1 field match (`letter`/`word`/`desc`), no adaptation needed.
- The About hero section (photo + "Our Story" / "Balanced Wellness" tagline) and the Vision & Mission cards section are not covered by any content key and stay fully hardcoded.
- One fetch: `GET /api/content?keys=about.brand_story,about.founder,about.balanced_wellness,about.vhon,about.dice`.

### FAQ page (`_pages/FAQPage.tsx`)

- `constants/faq.ts`'s exported `FAQ_ITEMS` becomes the initial `useState` default instead of being imported and used directly as the source array. A `useEffect` fetches `GET /api/content/faqs` and, if the response contains a non-empty array, replaces the state. The existing `useMemo`-derived category list and search/filter logic are entirely unchanged, since they already operate generically on whatever `FAQItem[]` array they're given — this is the smallest of the seven changes.

### Testimonials (`components/TestimonialsSection.tsx`)

- `REVIEWS` (`name`/`location`/`rating`/`text`) → `testimonials[]` — direct field match except `avatar`, which has no equivalent in the admin's `Testimonial` type. Testimonials sourced from fetched content render an initials circle (derived from `name`, e.g. "AO" for "Adaeze O.") in place of a photo; testimonials still showing the hardcoded defaults (before any CMS save) keep their existing photos.
- The section eyebrow/heading ("Real Results" / "What Our Customers Say") and the trust bar ("4.9 / 5", "Based on 200+ verified customer reviews") are not part of `testimonials[]` and stay hardcoded.
- Fetch: `GET /api/content/testimonials`.

## Error handling

No new error paths. Every fetch targets the existing, already-functional, unauthenticated public content API. Every component catches fetch failures silently and falls back to its hardcoded defaults — no error UI, no loading skeleton, no layout shift, matching the precedent set in `_pages/ContactPage.tsx`.

## Testing

This project has no automated test framework (no jest/vitest/playwright anywhere in the repo). Verification matches this session's established approach:

- `curl` checks confirming each of the relevant `GET /api/content/...` calls returns the expected `{success, data}` shape for each key.
- Manual browser checks that each of the seven components/pages renders correctly with the `content_blocks` table in its current state.
- A bonus manual check per component: with a given key's row temporarily absent (or the dev server pointed at a state where it's never been saved), confirm the component still renders its original hardcoded content rather than blanking out or erroring.
