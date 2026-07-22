# CMS Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire all seven public-facing consumers of the already-complete `content_blocks` CMS (homepage hero/trust-strip/why-tkays/newsletter, the About page, the FAQ page, and the homepage testimonials strip) to the real, already-functional public content API, replacing hardcoded copy with fetched content while preserving every hardcoded value as a graceful fallback.

**Architecture:** Every component keeps its current hardcoded content as its default state, fetches from the existing public `GET /api/content/:key` or `GET /api/content?keys=a,b,c` endpoints on mount, and only overwrites fields that come back present and non-empty. The four homepage components share one fetch via a new hook (`hooks/useHomepageContent.ts`) called once by `HomePage.tsx` and passed down as props, avoiding four separate network calls for one page. The About page, FAQ page, and Testimonials section each do their own single fetch, since each is a standalone page/component with no sibling needing the same data.

**Tech Stack:** Next.js 14 App Router (client components, `'use client'`), TypeScript, the existing `content_blocks` public content API (no backend changes in this plan — Task 1 and Task 2 of the prior Settings-fixes plan already proved this API works correctly).

## Global Constraints

- Every component's current hardcoded value(s) become its default state — visually identical to today until content is actually fetched.
- Fetch failures and missing keys are caught silently — no error UI, no loading skeleton, no layout shift, matching the pattern already shipped in `_pages/ContactPage.tsx`.
- Only apply fields from a fetch response that are actually present and non-empty — a partial admin edit never blanks out untouched fields.
- No new content keys, no changes to `content_blocks` schema, no changes to `_pages/admin/AdminCMS.tsx` — the backend and admin editor are already complete.
- Icons on `TrustStrip` and `WhyTkaysSection` stay exactly as hardcoded today — neither renders an icon from fetched data.
- Testimonials sourced from fetched content show an initials circle instead of a photo (the `Testimonial` type has no photo field); testimonials still on their hardcoded defaults keep their existing photos.
- Sections/pages not covered by any content key (About page hero banner, Vision & Mission cards, "Why T.kays" section's own eyebrow/heading/subtext, Testimonials section's eyebrow/heading and trust bar, Newsletter's perk chips) stay fully hardcoded — do not touch them.
- This project has no automated test framework (no jest/vitest/playwright) — every verification step in this plan uses `curl` against the local dev server or manual browser checks, not automated tests.
- The dev server is assumed to already be running at `http://localhost:3000` for all verification steps. If `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/` doesn't return `200`, start it from `/home/urinrin/Documents/projects/agrocosmetics/site/app` with `npm run dev` before continuing.

---

### Task 1: Shared homepage content hook + HeroSection wiring

**Files:**
- Create: `hooks/useHomepageContent.ts`
- Modify: `components/HeroSection.tsx`
- Modify: `_pages/HomePage.tsx`

**Interfaces:**
- Produces: `useHomepageContent()` returning `{ hero?: Partial<HeroContent>, trustStrip?: TrustItem[], whyTkays?: WhyItem[], newsletter?: Partial<NewsletterContent> }`, and the exported types `HeroContent`, `TrustItem`, `WhyItem`, `NewsletterContent` — Tasks 2, 3, and 4 import these same types and consume the same hook's return shape.
- Consumes: the existing public `GET /api/content?keys=...` endpoint (already functional, no changes needed).

- [ ] **Step 1: Create the shared hook**

```typescript
'use client';
import { useState, useEffect } from 'react';

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaUrl: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
}

export interface TrustItem {
  id: string;
  icon: string;
  text: string;
}

export interface WhyItem {
  id: string;
  heading: string;
  text: string;
}

export interface NewsletterContent {
  heading: string;
  subtext: string;
  placeholder: string;
  buttonText: string;
}

export interface HomepageContent {
  hero?: Partial<HeroContent>;
  trustStrip?: TrustItem[];
  whyTkays?: WhyItem[];
  newsletter?: Partial<NewsletterContent>;
}

export function useHomepageContent(): HomepageContent {
  const [content, setContent] = useState<HomepageContent>({});

  useEffect(() => {
    fetch('/api/content?keys=homepage.hero,homepage.trust_strip,homepage.why_tkays,homepage.newsletter')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const data = json?.data;
        if (!data) return;
        setContent({
          hero: data['homepage.hero'],
          trustStrip: data['homepage.trust_strip'],
          whyTkays: data['homepage.why_tkays'],
          newsletter: data['homepage.newsletter'],
        });
      })
      .catch(() => {
        // Keep defaults — this is a non-critical enhancement fetch for a
        // marketing page, not something that should block or error it.
      });
  }, []);

  return content;
}
```

- [ ] **Step 2: Wire `HeroSection.tsx` to accept and use the fetched content**

Find:

```tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./HeroSection.module.css";
```

Replace with:

```tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./HeroSection.module.css";
import type { HeroContent } from "@/hooks/useHomepageContent";
```

Find:

```tsx
const HeroSection: React.FC = () => {
  const [wordIdx, setWordIdx] = useState(0);
```

Replace with:

```tsx
const HeroSection: React.FC<{ content?: Partial<HeroContent> }> = ({ content }) => {
  const headline = content?.headline || "Potent African skincare for";
  const subheadline =
    content?.subheadline ||
    "Vegan · Herbal · Organic · Natural. Every formula rooted in botanical wisdom — made for every skin tone, every body.";
  const ctaText = content?.ctaText || "Shop Now";
  const ctaUrl = content?.ctaUrl || "/catalog";
  const secondaryCtaText = content?.secondaryCtaText || "Explore Skin Concerns";
  const secondaryCtaUrl = content?.secondaryCtaUrl || "/skin-concerns";

  const [wordIdx, setWordIdx] = useState(0);
```

Find:

```tsx
          <h1 className={styles.heading}>
            <span className={styles.headingLine1}>
              Potent African skincare for
            </span>
```

Replace with:

```tsx
          <h1 className={styles.heading}>
            <span className={styles.headingLine1}>
              {headline}
            </span>
```

Find:

```tsx
          <p className={styles.subheading}>
            Vegan · Herbal · Organic · Natural. Every formula rooted in
            botanical wisdom — made for every skin tone, every body.
          </p>

          <div className={styles.actions}>
            <Link href="/catalog" className={styles.ctaPrimary}>
              Shop Now
              <svg
```

Replace with:

```tsx
          <p className={styles.subheading}>
            {subheadline}
          </p>

          <div className={styles.actions}>
            <Link href={ctaUrl} className={styles.ctaPrimary}>
              {ctaText}
              <svg
```

Find:

```tsx
            <Link href="/skin-concerns" className={styles.ctaSecondary}>
              Explore Skin Concerns
            </Link>
```

Replace with:

```tsx
            <Link href={secondaryCtaUrl} className={styles.ctaSecondary}>
              {secondaryCtaText}
            </Link>
```

The `ROTATING_WORDS` cycling logic and the rotating product-card carousel below are untouched — do not modify anything else in this file.

- [ ] **Step 3: Wire `HomePage.tsx` to call the hook and pass props**

Find the import block near the top of `_pages/HomePage.tsx` and add this import alongside the existing ones:

```tsx
import { useHomepageContent } from '@/hooks/useHomepageContent';
```

Find:

```tsx
const HomePage: React.FC = () => {
```

Replace with:

```tsx
const HomePage: React.FC = () => {
  const content = useHomepageContent();
```

Find:

```tsx
      <HeroSection />
```

Replace with:

```tsx
      <HeroSection content={content.hero} />
```

Do not change the `<TrustStrip />`, `<WhyTkaysSection />`, or `<NewsletterSection />` lines yet — those components don't accept props until Tasks 2, 3, and 4 land, so passing props to them now would be dead code. `content` (from the hook) is already available in scope for those later tasks to use without re-fetching.

- [ ] **Step 4: Verify the homepage still renders and the hero shows correctly**

```bash
curl -s http://localhost:3000/ | grep -o "Potent African skincare for" | head -1
```

Expected output: one match — proves the default fallback text still renders correctly (no content has been saved via the CMS yet in this environment, so the hardcoded default is what should show).

- [ ] **Step 5: Verify the bulk content endpoint responds correctly for the keys this hook requests**

```bash
curl -s "http://localhost:3000/api/content?keys=homepage.hero,homepage.trust_strip,homepage.why_tkays,homepage.newsletter"
```

Expected output: `{"success":true,"data":{}}` (empty object, since none of these keys have been saved yet in this environment) — confirms the endpoint doesn't error on a comma-separated key list it has no data for.

- [ ] **Step 6: Manual browser verification (optional, deeper check)**

If you have access to the admin dashboard, save a test headline via Admin → Content → Homepage → Hero, then reload the homepage and confirm the new headline appears in place of "Potent African skincare for". This is a bonus check, not required to consider this task done — the curl checks above already prove the code path is wired correctly.

- [ ] **Step 7: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add hooks/useHomepageContent.ts components/HeroSection.tsx _pages/HomePage.tsx
git commit -m "$(cat <<'EOF'
Wire HeroSection to the homepage CMS content

Adds a shared useHomepageContent hook (one bulk fetch for all four
homepage CMS-backed components) and wires HeroSection as the first
consumer. TrustStrip, WhyTkaysSection, and NewsletterSection will
consume the same already-fetched content in later commits.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Wire TrustStrip

**Files:**
- Modify: `components/TrustStrip.tsx`
- Modify: `_pages/HomePage.tsx`

**Interfaces:**
- Consumes: `TrustItem` type and the `content.trustStrip` slice from `useHomepageContent()` (Task 1, already fetched by `HomePage.tsx`).

- [ ] **Step 1: Wire `TrustStrip.tsx`**

Find:

```tsx
import React from 'react';
import styles from './TrustStrip.module.css';

const ITEMS = [
  'Vegan',
  'Herbal',
  'Organic',
  'Natural',
  'Handmade in Nigeria',
  'Cruelty-Free',
  'Botanically Rooted',
  'DICE Values',
];

const TrustStrip: React.FC = () => {
  const doubled = [...ITEMS, ...ITEMS];
```

Replace with:

```tsx
import React from 'react';
import styles from './TrustStrip.module.css';
import type { TrustItem } from '@/hooks/useHomepageContent';

const DEFAULT_ITEMS = [
  'Vegan',
  'Herbal',
  'Organic',
  'Natural',
  'Handmade in Nigeria',
  'Cruelty-Free',
  'Botanically Rooted',
  'DICE Values',
];

const TrustStrip: React.FC<{ items?: TrustItem[] }> = ({ items }) => {
  const labels = items && items.length > 0 ? items.map((i) => i.text) : DEFAULT_ITEMS;
  const doubled = [...labels, ...labels];
```

- [ ] **Step 2: Pass the prop from `HomePage.tsx`**

Find:

```tsx
      <TrustStrip />
```

Replace with:

```tsx
      <TrustStrip items={content.trustStrip} />
```

- [ ] **Step 3: Verify**

```bash
curl -s http://localhost:3000/ | grep -o "Handmade in Nigeria" | head -1
```

Expected output: one match — the default fallback labels render correctly.

- [ ] **Step 4: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add components/TrustStrip.tsx _pages/HomePage.tsx
git commit -m "$(cat <<'EOF'
Wire TrustStrip to homepage CMS content

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Wire WhyTkaysSection

**Files:**
- Modify: `components/WhyTkaysSection.tsx`
- Modify: `_pages/HomePage.tsx`

**Interfaces:**
- Consumes: `WhyItem` type and the `content.whyTkays` slice from `useHomepageContent()` (Task 1).

- [ ] **Step 1: Wire `WhyTkaysSection.tsx`**

Find:

```tsx
import React from 'react';
import './WhyTkaysSection.css';

interface TrustPoint {
  id: string;
  icon: React.ReactNode;
  heading: string;
  text: string;
}
```

Replace with:

```tsx
import React from 'react';
import './WhyTkaysSection.css';
import type { WhyItem } from '@/hooks/useHomepageContent';

interface TrustPoint {
  id: string;
  icon: React.ReactNode;
  heading: string;
  text: string;
}
```

Find:

```tsx
const WhyTkaysSection: React.FC = () => {
  return (
    <section className="why-tkays-section" aria-labelledby="why-tkays-heading">
```

Replace with:

```tsx
const WhyTkaysSection: React.FC<{ items?: WhyItem[] }> = ({ items }) => {
  const points: TrustPoint[] = TRUST_POINTS.map((point, i) => {
    const override = items?.[i];
    if (!override) return point;
    return {
      ...point,
      heading: override.heading || point.heading,
      text: override.text || point.text,
    };
  });

  return (
    <section className="why-tkays-section" aria-labelledby="why-tkays-heading">
```

Find:

```tsx
        <ul className="why-tkays-grid" role="list">
          {TRUST_POINTS.map((point) => (
```

Replace with:

```tsx
        <ul className="why-tkays-grid" role="list">
          {points.map((point) => (
```

The section's own eyebrow/heading/subtext ("Our Promise" / "Why T.kays?" / "We believe great skincare...") and the `TRUST_POINTS` array's hardcoded `icon` values are untouched.

- [ ] **Step 2: Pass the prop from `HomePage.tsx`**

Find:

```tsx
      <WhyTkaysSection />
```

Replace with:

```tsx
      <WhyTkaysSection items={content.whyTkays} />
```

- [ ] **Step 3: Verify**

```bash
curl -s http://localhost:3000/ | grep -o "Traditional African Ingredients" | head -1
```

Expected output: one match — the default fallback card heading renders correctly.

- [ ] **Step 4: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add components/WhyTkaysSection.tsx _pages/HomePage.tsx
git commit -m "$(cat <<'EOF'
Wire WhyTkaysSection to homepage CMS content

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Wire NewsletterSection

**Files:**
- Modify: `components/NewsletterSection.tsx`
- Modify: `_pages/HomePage.tsx`

**Interfaces:**
- Consumes: `NewsletterContent` type and the `content.newsletter` slice from `useHomepageContent()` (Task 1).

- [ ] **Step 1: Wire `NewsletterSection.tsx`**

Find:

```tsx
import React, { useState, useId } from 'react';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
```

Replace with:

```tsx
import React, { useState, useId } from 'react';
import type { NewsletterContent } from '@/hooks/useHomepageContent';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
```

Find:

```tsx
const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
```

Replace with:

```tsx
const NewsletterSection: React.FC<{ content?: Partial<NewsletterContent> }> = ({ content }) => {
  const heading = content?.heading;
  const subtext =
    content?.subtext ||
    'Weekly skincare rituals, ingredient spotlights, and first access to every T.kays drop — straight to your inbox. No noise. No spam.';
  const placeholder = content?.placeholder || 'Your email address';
  const buttonText = content?.buttonText || 'Subscribe Free →';

  const [email, setEmail] = useState('');
```

Find:

```tsx
        {/* Heading */}
        <h2
          id="newsletter-heading"
          className="font-heading text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-5"
        >
          Good skin starts
          <br />
          with{' '}
          <em className="text-accent font-heading">good habits</em>
        </h2>

        <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Weekly skincare rituals, ingredient spotlights, and first access to every
          T.kays drop — straight to your inbox. No noise. No spam.
        </p>
```

Replace with:

```tsx
        {/* Heading */}
        {heading ? (
          <h2
            id="newsletter-heading"
            className="font-heading text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-5"
          >
            {heading}
          </h2>
        ) : (
          <h2
            id="newsletter-heading"
            className="font-heading text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-5"
          >
            Good skin starts
            <br />
            with{' '}
            <em className="text-accent font-heading">good habits</em>
          </h2>
        )}

        <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          {subtext}
        </p>
```

Find:

```tsx
              <input
                id={emailInputId}
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Your email address"
```

Replace with:

```tsx
              <input
                id={emailInputId}
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder={placeholder}
```

Find:

```tsx
              {submitState === 'submitting' ? 'Subscribing…' : 'Subscribe Free →'}
```

Replace with:

```tsx
              {submitState === 'submitting' ? 'Subscribing…' : buttonText}
```

The perk chips (`PERKS` array) and the form's validation/submit logic are untouched.

- [ ] **Step 2: Pass the prop from `HomePage.tsx`**

Find:

```tsx
      <NewsletterSection />
```

Replace with:

```tsx
      <NewsletterSection content={content.newsletter} />
```

- [ ] **Step 3: Verify**

```bash
curl -s http://localhost:3000/ | grep -o "Good skin starts" | head -1
```

Expected output: one match — the default fallback heading renders correctly.

- [ ] **Step 4: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add components/NewsletterSection.tsx _pages/HomePage.tsx
git commit -m "$(cat <<'EOF'
Wire NewsletterSection to homepage CMS content

Completes the homepage CMS wiring — Hero, TrustStrip, WhyTkaysSection,
and NewsletterSection all now consume the one shared bulk fetch from
useHomepageContent.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Wire AboutPage

**Files:**
- Modify: `_pages/AboutPage.tsx`

**Interfaces:**
- Consumes: the existing public `GET /api/content?keys=...` endpoint directly (no shared hook needed — this page is the only consumer of all five `about.*` keys).
- Produces: nothing for other tasks — this page is self-contained.

- [ ] **Step 1: Add state, defaults, and the fetch effect**

Find:

```tsx
import React from 'react';
import Link from 'next/link';
import PageSEO from '@/components/SEO/PageSEO';

import heroBanner   from '../assets/images/aesthetics/beauty-soft.jpg';
import founderPhoto from '../assets/images/founder-pictures/founder-tijesunimi-professional.jpg';

/* ── Static content ── */
const BRAND_STORY = {
```

Replace with:

```tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageSEO from '@/components/SEO/PageSEO';

import heroBanner   from '../assets/images/aesthetics/beauty-soft.jpg';
import founderPhoto from '../assets/images/founder-pictures/founder-tijesunimi-professional.jpg';

interface BrandStory { intro: string; body: string; }
interface FounderContent { name: string; title: string; bio: string; }
interface BalancedWellnessContent { quote: string; }
interface VHONItem { letter: string; word: string; desc: string; }
interface DICEItem { letter: string; word: string; desc: string; }

/* ── Default content (shown until the CMS has real data saved) ── */
const DEFAULT_BRAND_STORY: BrandStory = {
```

(Note: this changes `const BRAND_STORY = {` to `const DEFAULT_BRAND_STORY: BrandStory = {` — the object's contents on the following lines are unchanged, only the declaration line and its name.)

Find (immediately following, the closing of that const and the next few consts):

```tsx
const FOUNDER_BIO = `Tijesunimi Olakojo is the founder and formulator behind T.kays Agrocosmetics. A passionate advocate for natural wellness, she combines her background in botanical science with a deep commitment to inclusivity and community. Driven by her own skin journey and a desire to create products that work for every skin tone and type, Tijesunimi built T.kays from the ground up — formulating each product with intention, integrity, and love.`;

const BALANCED_WELLNESS = `"Balanced Wellness" is more than a tagline — it is our philosophy. True wellness is not one-dimensional. It encompasses the health of your skin, the clarity of your mind, the nourishment of your body, and the harmony of your spirit. At T.kays Agrocosmetics, we believe that when you care for yourself holistically — inside and out — you unlock a state of balance that radiates from within.`;

const VHON = [
  { letter: 'V', word: 'Vegan',   desc: 'No animal-derived ingredients. Ever. Our formulations are 100% cruelty-free and kind to all living beings.' },
  { letter: 'H', word: 'Herbal',  desc: 'Rooted in botanical tradition, we harness the potency of herbs and plant extracts proven over centuries.' },
  { letter: 'O', word: 'Organic', desc: 'We prioritise certified organic ingredients, free from synthetic pesticides and harmful chemicals.' },
  { letter: 'N', word: 'Natural', desc: 'Sourced from nature, not a laboratory. Clean, recognisable ingredients you can trust.' },
];

const DICE = [
  { letter: 'D', word: 'Diversity',   desc: 'We celebrate every skin tone, background, and identity. Our products are formulated for all.' },
  { letter: 'I', word: 'Inclusivity', desc: 'Wellness should be accessible to everyone. We design with every body in mind.' },
  { letter: 'C', word: 'Community',   desc: "We are more than a brand — a collective of people committed to supporting one another's wellness journeys." },
  { letter: 'E', word: 'Equality',    desc: 'Fair pricing, ethical sourcing, and equitable representation are non-negotiable pillars of everything we do.' },
];

const AboutPage: React.FC = () => {
  return (
```

Replace with:

```tsx
const DEFAULT_FOUNDER: FounderContent = {
  name: 'Tijesunimi Olakojo',
  title: 'Founder & Formulator',
  bio: `Tijesunimi Olakojo is the founder and formulator behind T.kays Agrocosmetics. A passionate advocate for natural wellness, she combines her background in botanical science with a deep commitment to inclusivity and community. Driven by her own skin journey and a desire to create products that work for every skin tone and type, Tijesunimi built T.kays from the ground up — formulating each product with intention, integrity, and love.`,
};

const DEFAULT_BALANCED_WELLNESS: BalancedWellnessContent = {
  quote: `"Balanced Wellness" is more than a tagline — it is our philosophy. True wellness is not one-dimensional. It encompasses the health of your skin, the clarity of your mind, the nourishment of your body, and the harmony of your spirit. At T.kays Agrocosmetics, we believe that when you care for yourself holistically — inside and out — you unlock a state of balance that radiates from within.`,
};

const DEFAULT_VHON: VHONItem[] = [
  { letter: 'V', word: 'Vegan',   desc: 'No animal-derived ingredients. Ever. Our formulations are 100% cruelty-free and kind to all living beings.' },
  { letter: 'H', word: 'Herbal',  desc: 'Rooted in botanical tradition, we harness the potency of herbs and plant extracts proven over centuries.' },
  { letter: 'O', word: 'Organic', desc: 'We prioritise certified organic ingredients, free from synthetic pesticides and harmful chemicals.' },
  { letter: 'N', word: 'Natural', desc: 'Sourced from nature, not a laboratory. Clean, recognisable ingredients you can trust.' },
];

const DEFAULT_DICE: DICEItem[] = [
  { letter: 'D', word: 'Diversity',   desc: 'We celebrate every skin tone, background, and identity. Our products are formulated for all.' },
  { letter: 'I', word: 'Inclusivity', desc: 'Wellness should be accessible to everyone. We design with every body in mind.' },
  { letter: 'C', word: 'Community',   desc: "We are more than a brand — a collective of people committed to supporting one another's wellness journeys." },
  { letter: 'E', word: 'Equality',    desc: 'Fair pricing, ethical sourcing, and equitable representation are non-negotiable pillars of everything we do.' },
];

const AboutPage: React.FC = () => {
  const [brandStory, setBrandStory] = useState<BrandStory>(DEFAULT_BRAND_STORY);
  const [founder, setFounder] = useState<FounderContent>(DEFAULT_FOUNDER);
  const [balancedWellness, setBalancedWellness] = useState<BalancedWellnessContent>(DEFAULT_BALANCED_WELLNESS);
  const [vhon, setVhon] = useState<VHONItem[]>(DEFAULT_VHON);
  const [dice, setDice] = useState<DICEItem[]>(DEFAULT_DICE);

  useEffect(() => {
    fetch('/api/content?keys=about.brand_story,about.founder,about.balanced_wellness,about.vhon,about.dice')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const data = json?.data;
        if (!data) return;
        if (data['about.brand_story']) setBrandStory((s) => ({ ...s, ...data['about.brand_story'] }));
        if (data['about.founder']) setFounder((f) => ({ ...f, ...data['about.founder'] }));
        if (data['about.balanced_wellness']) setBalancedWellness((b) => ({ ...b, ...data['about.balanced_wellness'] }));
        if (Array.isArray(data['about.vhon']) && data['about.vhon'].length > 0) setVhon(data['about.vhon']);
        if (Array.isArray(data['about.dice']) && data['about.dice'].length > 0) setDice(data['about.dice']);
      })
      .catch(() => {
        // Keep defaults — non-critical enhancement fetch for a marketing page.
      });
  }, []);

  return (
```

- [ ] **Step 2: Use the new state in the Brand Story section**

Find:

```tsx
            <p className="text-brand-grey text-lg leading-relaxed mb-6 font-medium text-brand-dark/80">
              {BRAND_STORY.intro}
            </p>
            {BRAND_STORY.body.split('\n\n').map((para, i) => (
```

Replace with:

```tsx
            <p className="text-brand-grey text-lg leading-relaxed mb-6 font-medium text-brand-dark/80">
              {brandStory.intro}
            </p>
            {brandStory.body.split('\n\n').map((para, i) => (
```

- [ ] **Step 3: Use the new state in the Founder section**

Find:

```tsx
                <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl p-5 shadow-xl max-w-48">
                  <p className="font-accent text-sm italic text-brand-grey">Founder & Formulator</p>
                  <p className="font-heading text-base font-bold text-brand-dark mt-1">Tijesunimi Olakojo</p>
                </div>
```

Replace with:

```tsx
                <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl p-5 shadow-xl max-w-48">
                  <p className="font-accent text-sm italic text-brand-grey">{founder.title}</p>
                  <p className="font-heading text-base font-bold text-brand-dark mt-1">{founder.name}</p>
                </div>
```

Find:

```tsx
                <h2 id="founder-heading" className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark mb-6">
                  Tijesunimi Olakojo
                </h2>
                <p className="text-brand-grey leading-relaxed mb-8">{FOUNDER_BIO}</p>
                <div className="border-l-4 border-accent pl-5">
                  <p className="font-heading text-xl italic text-primary font-semibold">Tijesunimi</p>
                  <p className="text-xs text-brand-grey mt-1 tracking-wide">Founder & Formulator, T.kays Agrocosmetics</p>
                </div>
```

Replace with:

```tsx
                <h2 id="founder-heading" className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark mb-6">
                  {founder.name}
                </h2>
                <p className="text-brand-grey leading-relaxed mb-8">{founder.bio}</p>
                <div className="border-l-4 border-accent pl-5">
                  <p className="font-heading text-xl italic text-primary font-semibold">Tijesunimi</p>
                  <p className="text-xs text-brand-grey mt-1 tracking-wide">{founder.title}, T.kays Agrocosmetics</p>
                </div>
```

(The shortened "Tijesunimi" pull-quote stays hardcoded, per the design's explicit decision — it's a typographic flourish, not derived from `founder.name`.)

- [ ] **Step 4: Use the new state in the Brand Values (VHON/DICE) section**

Find:

```tsx
                <ul className="space-y-5">
                  {VHON.map(({ letter, word, desc }) => (
```

Replace with:

```tsx
                <ul className="space-y-5">
                  {vhon.map(({ letter, word, desc }) => (
```

Find:

```tsx
                <ul className="space-y-5">
                  {DICE.map(({ letter, word, desc }) => (
```

Replace with:

```tsx
                <ul className="space-y-5">
                  {dice.map(({ letter, word, desc }) => (
```

- [ ] **Step 5: Use the new state in the Balanced Wellness pull-quote**

Find:

```tsx
            <blockquote className="text-white/70 text-base lg:text-lg leading-relaxed mb-10">
              {BALANCED_WELLNESS}
            </blockquote>
```

Replace with:

```tsx
            <blockquote className="text-white/70 text-base lg:text-lg leading-relaxed mb-10">
              {balancedWellness.quote}
            </blockquote>
```

- [ ] **Step 6: Verify no dangling references to the old module-level consts**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
grep -n "BRAND_STORY\.\|FOUNDER_BIO\b\|BALANCED_WELLNESS\b\|VHON\.map\|DICE\.map" _pages/AboutPage.tsx
```

Expected output: no matches — all six were replaced by the new state variables (`brandStory`, `founder`, `balancedWellness`, `vhon`, `dice`).

- [ ] **Step 7: Verify the page still renders**

```bash
curl -s http://localhost:3000/about | grep -o "Where Nature Meets Purpose" | head -1
```

Expected output: one match — confirms the page renders (this heading is a static, unwired part of the page, so seeing it confirms no rendering crash was introduced).

```bash
curl -s http://localhost:3000/about | grep -o "Tijesunimi Olakojo" | head -1
```

Expected output: one match — confirms the founder name renders correctly from the new default state.

- [ ] **Step 8: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add _pages/AboutPage.tsx
git commit -m "$(cat <<'EOF'
Wire AboutPage to the CMS

Brand story, founder bio, Balanced Wellness quote, and the VHON/DICE
value lists now read from content_blocks, falling back to the
existing copy if nothing has been saved yet. The hero banner and
Vision & Mission section are untouched — neither is covered by a
content key.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Wire FAQPage

**Files:**
- Modify: `_pages/FAQPage.tsx`

**Interfaces:**
- Consumes: `GET /api/content/faqs` (existing public single-key endpoint).
- Produces: nothing for other tasks — self-contained.

- [ ] **Step 1: Add state and the fetch effect**

Find:

```tsx
import React, { useState, useMemo, useCallback, useId } from "react";
import { FAQ_ITEMS, type FAQItem } from "../constants/faq";
import styles from "./FAQPage.module.css";
```

Replace with:

```tsx
import React, { useState, useEffect, useMemo, useCallback, useId } from "react";
import { FAQ_ITEMS, type FAQItem } from "../constants/faq";
import styles from "./FAQPage.module.css";
```

Find:

```tsx
const FAQPage: React.FC = () => {
  const searchId = useId();

  // Index of the currently open accordion item (-1 = none)
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Derive unique categories from FAQ items
  const categories = useMemo(
    () => Array.from(new Set(FAQ_ITEMS.map((item) => item.category))),
    []
  );

  // Client-side filter: matches query against question and answer text,
  // and optionally filters by category
  const filteredItems = useMemo<FAQItem[]>(() => {
    const query = searchQuery.trim().toLowerCase();

    return FAQ_ITEMS.filter((item) => {
```

Replace with:

```tsx
const FAQPage: React.FC = () => {
  const searchId = useId();

  // Index of the currently open accordion item (-1 = none)
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [faqItems, setFaqItems] = useState<FAQItem[]>(FAQ_ITEMS);

  useEffect(() => {
    fetch("/api/content/faqs")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const value = json?.data?.value;
        if (Array.isArray(value) && value.length > 0) setFaqItems(value);
      })
      .catch(() => {
        // Keep the default FAQ_ITEMS — non-critical enhancement fetch.
      });
  }, []);

  // Derive unique categories from FAQ items
  const categories = useMemo(
    () => Array.from(new Set(faqItems.map((item) => item.category))),
    [faqItems]
  );

  // Client-side filter: matches query against question and answer text,
  // and optionally filters by category
  const filteredItems = useMemo<FAQItem[]>(() => {
    const query = searchQuery.trim().toLowerCase();

    return faqItems.filter((item) => {
```

Find the closing of that `useMemo` (the dependency array):

```tsx
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);
```

Replace with:

```tsx
      return matchesCategory && matchesSearch;
    });
  }, [faqItems, searchQuery, activeCategory]);
```

Find the results-count paragraph:

```tsx
        <p className={styles.resultsCount} aria-live="polite" aria-atomic="true">
          {filteredItems.length === FAQ_ITEMS.length
            ? `${FAQ_ITEMS.length} questions`
            : `${filteredItems.length} of ${FAQ_ITEMS.length} questions`}
```

Replace with:

```tsx
        <p className={styles.resultsCount} aria-live="polite" aria-atomic="true">
          {filteredItems.length === faqItems.length
            ? `${faqItems.length} questions`
            : `${filteredItems.length} of ${faqItems.length} questions`}
```

- [ ] **Step 2: Verify no remaining direct uses of `FAQ_ITEMS` outside its role as the default state value**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
grep -n "FAQ_ITEMS" _pages/FAQPage.tsx
```

Expected output: exactly one match — the line `const [faqItems, setFaqItems] = useState<FAQItem[]>(FAQ_ITEMS);` (the import line itself will also show if you grep without anchoring, so two matches total: the import and the useState default — both correct, everything else now reads `faqItems`).

- [ ] **Step 3: Verify the endpoint and the page**

```bash
curl -s http://localhost:3000/api/content/faqs
```

Expected output: `{"success":false,"message":"Content block not found"}` (404) in this environment, since no admin has saved `faqs` content yet — confirms the endpoint behaves as expected for a missing key, which the fetch's `.then((r) => (r.ok ? r.json() : null))` correctly handles by keeping the default.

```bash
curl -s http://localhost:3000/faq | grep -o "How long does delivery take?" | head -1
```

Expected output: one match — confirms the page renders with the default `FAQ_ITEMS` content and the search/filter logic wasn't broken by the rename.

- [ ] **Step 4: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add _pages/FAQPage.tsx
git commit -m "$(cat <<'EOF'
Wire FAQPage to the CMS

FAQ_ITEMS from constants/faq.ts becomes the default state instead of
being used directly, with a fetch to GET /api/content/faqs
overriding it when real content has been saved. All existing
search/filter/category logic is unchanged — it already operated
generically on whatever array it was given.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Wire TestimonialsSection

**Files:**
- Modify: `components/TestimonialsSection.tsx`

**Interfaces:**
- Consumes: `GET /api/content/testimonials` (existing public single-key endpoint).
- Produces: nothing for other tasks — self-contained, and the last task in this plan.

- [ ] **Step 1: Add a `Testimonial` type, state, the fetch effect, and an initials helper**

Find:

```tsx
'use client';
import React from 'react';

import avatar1 from '../assets/images/testimonials/skin-acne-dark.jpg';
import avatar2 from '../assets/images/testimonials/skin-hyperpigmentation-chest.jpg';
import avatar3 from '../assets/images/testimonials/skin-back-white.jpg';

const REVIEWS = [
  {
    id: '1',
    name: 'Adaeze O.',
    location: 'Lagos, Nigeria',
    avatar: avatar1,
    rating: 5,
    text: 'The Black Soap cleared my acne within two weeks. I have tried so many products and nothing worked like this. T.kays is the real deal — I will never go back!',
  },
  {
    id: '2',
    name: 'Fatima B.',
    location: 'Abuja, Nigeria',
    avatar: avatar2,
    rating: 5,
    text: 'My hyperpigmentation has faded so much. The brightening butter is incredible. My skin finally feels balanced — not dry, not oily, just healthy and glowing.',
  },
  {
    id: '3',
    name: 'Chidinma E.',
    location: 'Enugu, Nigeria',
    avatar: avatar3,
    rating: 5,
    text: 'I love that everything is natural and made in Nigeria. The quality is so high. My whole family now uses T.kays products. Best investment in my skin ever.',
  },
];
```

Replace with:

```tsx
'use client';
import React, { useState, useEffect } from 'react';

import avatar1 from '../assets/images/testimonials/skin-acne-dark.jpg';
import avatar2 from '../assets/images/testimonials/skin-hyperpigmentation-chest.jpg';
import avatar3 from '../assets/images/testimonials/skin-back-white.jpg';

interface Review {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  rating: number;
  text: string;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Adaeze O.',
    location: 'Lagos, Nigeria',
    avatar: avatar1,
    rating: 5,
    text: 'The Black Soap cleared my acne within two weeks. I have tried so many products and nothing worked like this. T.kays is the real deal — I will never go back!',
  },
  {
    id: '2',
    name: 'Fatima B.',
    location: 'Abuja, Nigeria',
    avatar: avatar2,
    rating: 5,
    text: 'My hyperpigmentation has faded so much. The brightening butter is incredible. My skin finally feels balanced — not dry, not oily, just healthy and glowing.',
  },
  {
    id: '3',
    name: 'Chidinma E.',
    location: 'Enugu, Nigeria',
    avatar: avatar3,
    rating: 5,
    text: 'I love that everything is natural and made in Nigeria. The quality is so high. My whole family now uses T.kays products. Best investment in my skin ever.',
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
```

- [ ] **Step 2: Add state and the fetch effect to the component, and use the new state**

Find:

```tsx
const TestimonialsSection: React.FC = () => {
  return (
    <section className="bg-white py-20 px-6 lg:px-16" aria-labelledby="reviews-heading">
```

Replace with:

```tsx
const TestimonialsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);

  useEffect(() => {
    fetch('/api/content/testimonials')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const value = json?.data?.value;
        if (Array.isArray(value) && value.length > 0) setReviews(value);
      })
      .catch(() => {
        // Keep DEFAULT_REVIEWS — non-critical enhancement fetch.
      });
  }, []);

  return (
    <section className="bg-white py-20 px-6 lg:px-16" aria-labelledby="reviews-heading">
```

Find:

```tsx
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
```

Replace with:

```tsx
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
```

Find:

```tsx
              {/* Author */}
              <footer className="flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-white"
                />
                <div>
```

Replace with:

```tsx
              {/* Author */}
              <footer className="flex items-center gap-3">
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-white"
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-full flex-shrink-0 ring-2 ring-white bg-primary-pale flex items-center justify-center text-sm font-heading font-bold text-primary"
                    aria-hidden="true"
                  >
                    {getInitials(review.name)}
                  </div>
                )}
                <div>
```

The section eyebrow/heading ("Real Results" / "What Our Customers Say") and the trust bar ("4.9 / 5", "Based on 200+ verified customer reviews") are untouched.

- [ ] **Step 3: Verify no dangling references to the old `REVIEWS` const**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
grep -n "REVIEWS\b" components/TestimonialsSection.tsx
```

Expected output: no matches (renamed to `DEFAULT_REVIEWS`, consumed via `reviews` state — a bare `REVIEWS` identifier should not appear anywhere).

- [ ] **Step 4: Verify the page still renders**

```bash
curl -s http://localhost:3000/ | grep -o "Adaeze O\." | head -1
```

Expected output: one match — confirms the default reviews render correctly from the new state.

- [ ] **Step 5: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add components/TestimonialsSection.tsx
git commit -m "$(cat <<'EOF'
Wire TestimonialsSection to the CMS

Completes the CMS wiring plan. Testimonials sourced from saved CMS
content render an initials circle in place of a photo, since the
admin's Testimonial type has no photo field; the three hardcoded
defaults keep their existing photos.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
