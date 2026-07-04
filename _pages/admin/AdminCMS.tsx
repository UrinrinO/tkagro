'use client';
/**
 * AdminCMS — Content Management System
 * Route: /admin/cms
 *
 * Tabs:
 *   1. Homepage   — hero, trust strip, why T.kays, newsletter copy
 *   2. About      — brand story, founder bio, balanced wellness, VHON/DICE
 *   3. Testimonials — CRUD list of customer reviews
 *   4. FAQs        — CRUD list of Q&A items
 *
 * Persists to the content_blocks table via:
 *   GET /api/admin/content      → loads all blocks
 *   PUT /api/admin/content/:key → upserts one block
 */

import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/apiFetch';

const API_URL = '';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaUrl: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
}

interface TrustItem {
  id: string;
  icon: string;
  text: string;
}

interface WhyItem {
  id: string;
  heading: string;
  text: string;
}

interface NewsletterContent {
  heading: string;
  subtext: string;
  placeholder: string;
  buttonText: string;
}

interface BrandStory {
  intro: string;
  body: string;
}

interface FounderContent {
  name: string;
  title: string;
  bio: string;
}

interface BalancedWellness {
  quote: string;
}

interface VHONItem {
  letter: string;
  word: string;
  desc: string;
}

interface DICEItem {
  letter: string;
  word: string;
  desc: string;
}

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

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

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</label>
    {hint && <p className="text-xs text-gray-400 -mt-1">{hint}</p>}
    {children}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors ${props.className ?? ''}`}
  />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-y min-h-[80px] ${props.className ?? ''}`}
  />
);

const SaveBar: React.FC<{
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  onReset: () => void;
}> = ({ saving, saved, onSave, onReset }) => (
  <div className="flex items-center gap-3 pt-2">
    <button
      onClick={onSave}
      disabled={saving}
      className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
    >
      {saving ? 'Saving…' : 'Save changes'}
    </button>
    <button
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

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h3 className="text-sm font-semibold text-gray-900 mb-5">{title}</h3>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

// ─── Tab: Homepage ────────────────────────────────────────────────────────────

const HomepageTab: React.FC<{ allContent: Record<string, unknown> }> = ({ allContent }) => {
  const [hero, setHero] = useState<HeroContent>(
    (allContent['homepage.hero'] as HeroContent) ?? {
      headline: '', subheadline: '', ctaText: '', ctaUrl: '', secondaryCtaText: '', secondaryCtaUrl: '',
    }
  );
  const [trust, setTrust] = useState<TrustItem[]>(
    (allContent['homepage.trust_strip'] as TrustItem[]) ?? []
  );
  const [why, setWhy] = useState<WhyItem[]>(
    (allContent['homepage.why_tkays'] as WhyItem[]) ?? []
  );
  const [newsletter, setNewsletter] = useState<NewsletterContent>(
    (allContent['homepage.newsletter'] as NewsletterContent) ?? {
      heading: '', subtext: '', placeholder: '', buttonText: '',
    }
  );

  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-6">

      {/* Hero */}
      <SectionCard title="Hero Section">
        <Field label="Main Headline" hint="The large bold text — keep it short and punchy.">
          <Input value={hero.headline} onChange={e => setHero(h => ({ ...h, headline: e.target.value }))} placeholder="Balanced Wellness" />
        </Field>
        <Field label="Subheadline">
          <Textarea value={hero.subheadline} onChange={e => setHero(h => ({ ...h, subheadline: e.target.value }))} rows={2} placeholder="Potent African skincare…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary CTA Text">
            <Input value={hero.ctaText} onChange={e => setHero(h => ({ ...h, ctaText: e.target.value }))} placeholder="Shop Now" />
          </Field>
          <Field label="Primary CTA URL">
            <Input value={hero.ctaUrl} onChange={e => setHero(h => ({ ...h, ctaUrl: e.target.value }))} placeholder="/catalog" />
          </Field>
          <Field label="Secondary CTA Text">
            <Input value={hero.secondaryCtaText} onChange={e => setHero(h => ({ ...h, secondaryCtaText: e.target.value }))} placeholder="Find Your Routine" />
          </Field>
          <Field label="Secondary CTA URL">
            <Input value={hero.secondaryCtaUrl} onChange={e => setHero(h => ({ ...h, secondaryCtaUrl: e.target.value }))} placeholder="/skin-concerns" />
          </Field>
        </div>
        <SaveBar
          saving={saving === 'homepage.hero'}
          saved={saved === 'homepage.hero'}
          onSave={() => save('homepage.hero', hero)}
          onReset={() => setHero((allContent['homepage.hero'] as HeroContent) ?? hero)}
        />
      </SectionCard>

      {/* Trust Strip */}
      <SectionCard title="Trust Strip Badges">
        <p className="text-xs text-gray-400 -mt-2">The four trust badges shown below the hero.</p>
        {trust.map((item, i) => (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-400 font-mono w-4">{i + 1}</span>
            <Input
              className="flex-1"
              value={item.text}
              onChange={e => setTrust(t => t.map((x, j) => j === i ? { ...x, text: e.target.value } : x))}
              placeholder="Badge text"
            />
          </div>
        ))}
        <SaveBar
          saving={saving === 'homepage.trust_strip'}
          saved={saved === 'homepage.trust_strip'}
          onSave={() => save('homepage.trust_strip', trust)}
          onReset={() => setTrust((allContent['homepage.trust_strip'] as TrustItem[]) ?? trust)}
        />
      </SectionCard>

      {/* Why T.kays */}
      <SectionCard title="Why T.kays Section">
        <p className="text-xs text-gray-400 -mt-2">Four brand value cards shown on the homepage.</p>
        {why.map((item, i) => (
          <div key={item.id} className="p-4 border border-gray-100 rounded-lg flex flex-col gap-3">
            <Field label={`Point ${i + 1} — Heading`}>
              <Input value={item.heading} onChange={e => setWhy(w => w.map((x, j) => j === i ? { ...x, heading: e.target.value } : x))} />
            </Field>
            <Field label="Body text">
              <Textarea rows={3} value={item.text} onChange={e => setWhy(w => w.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
            </Field>
          </div>
        ))}
        <SaveBar
          saving={saving === 'homepage.why_tkays'}
          saved={saved === 'homepage.why_tkays'}
          onSave={() => save('homepage.why_tkays', why)}
          onReset={() => setWhy((allContent['homepage.why_tkays'] as WhyItem[]) ?? why)}
        />
      </SectionCard>

      {/* Newsletter */}
      <SectionCard title="Newsletter Section">
        <Field label="Heading">
          <Input value={newsletter.heading} onChange={e => setNewsletter(n => ({ ...n, heading: e.target.value }))} />
        </Field>
        <Field label="Subtext">
          <Textarea rows={2} value={newsletter.subtext} onChange={e => setNewsletter(n => ({ ...n, subtext: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Input Placeholder">
            <Input value={newsletter.placeholder} onChange={e => setNewsletter(n => ({ ...n, placeholder: e.target.value }))} />
          </Field>
          <Field label="Button Text">
            <Input value={newsletter.buttonText} onChange={e => setNewsletter(n => ({ ...n, buttonText: e.target.value }))} />
          </Field>
        </div>
        <SaveBar
          saving={saving === 'homepage.newsletter'}
          saved={saved === 'homepage.newsletter'}
          onSave={() => save('homepage.newsletter', newsletter)}
          onReset={() => setNewsletter((allContent['homepage.newsletter'] as NewsletterContent) ?? newsletter)}
        />
      </SectionCard>

    </div>
  );
};

// ─── Tab: About ───────────────────────────────────────────────────────────────

const AboutTab: React.FC<{ allContent: Record<string, unknown> }> = ({ allContent }) => {
  const [story, setStory] = useState<BrandStory>(
    (allContent['about.brand_story'] as BrandStory) ?? { intro: '', body: '' }
  );
  const [founder, setFounder] = useState<FounderContent>(
    (allContent['about.founder'] as FounderContent) ?? { name: '', title: '', bio: '' }
  );
  const [bw, setBw] = useState<BalancedWellness>(
    (allContent['about.balanced_wellness'] as BalancedWellness) ?? { quote: '' }
  );
  const [vhon, setVhon] = useState<VHONItem[]>(
    (allContent['about.vhon'] as VHONItem[]) ?? []
  );
  const [dice, setDice] = useState<DICEItem[]>(
    (allContent['about.dice'] as DICEItem[]) ?? []
  );

  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-6">

      <SectionCard title="Brand Story">
        <Field label="Opening paragraph" hint="Short, compelling intro — shown in a larger typeface.">
          <Textarea rows={4} value={story.intro} onChange={e => setStory(s => ({ ...s, intro: e.target.value }))} />
        </Field>
        <Field label="Full story" hint="The longer body copy below the intro.">
          <Textarea rows={10} value={story.body} onChange={e => setStory(s => ({ ...s, body: e.target.value }))} />
        </Field>
        <SaveBar
          saving={saving === 'about.brand_story'}
          saved={saved === 'about.brand_story'}
          onSave={() => save('about.brand_story', story)}
          onReset={() => setStory((allContent['about.brand_story'] as BrandStory) ?? story)}
        />
      </SectionCard>

      <SectionCard title="Founder">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name">
            <Input value={founder.name} onChange={e => setFounder(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Title / Role">
            <Input value={founder.title} onChange={e => setFounder(f => ({ ...f, title: e.target.value }))} />
          </Field>
        </div>
        <Field label="Bio">
          <Textarea rows={5} value={founder.bio} onChange={e => setFounder(f => ({ ...f, bio: e.target.value }))} />
        </Field>
        <SaveBar
          saving={saving === 'about.founder'}
          saved={saved === 'about.founder'}
          onSave={() => save('about.founder', founder)}
          onReset={() => setFounder((allContent['about.founder'] as FounderContent) ?? founder)}
        />
      </SectionCard>

      <SectionCard title="Balanced Wellness Philosophy">
        <Field label="Quote / Statement" hint='The paragraph that explains the "Balanced Wellness" philosophy.'>
          <Textarea rows={5} value={bw.quote} onChange={e => setBw({ quote: e.target.value })} />
        </Field>
        <SaveBar
          saving={saving === 'about.balanced_wellness'}
          saved={saved === 'about.balanced_wellness'}
          onSave={() => save('about.balanced_wellness', bw)}
          onReset={() => setBw((allContent['about.balanced_wellness'] as BalancedWellness) ?? bw)}
        />
      </SectionCard>

      <SectionCard title="VHON Values">
        <p className="text-xs text-gray-400 -mt-2">Descriptions for Vegan, Herbal, Organic, Natural.</p>
        {vhon.map((item, i) => (
          <div key={item.letter} className="p-4 border border-gray-100 rounded-lg flex flex-col gap-2">
            <p className="text-xs font-bold text-primary uppercase">{item.letter} — {item.word}</p>
            <Textarea
              rows={3}
              value={item.desc}
              onChange={e => setVhon(v => v.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))}
            />
          </div>
        ))}
        <SaveBar
          saving={saving === 'about.vhon'}
          saved={saved === 'about.vhon'}
          onSave={() => save('about.vhon', vhon)}
          onReset={() => setVhon((allContent['about.vhon'] as VHONItem[]) ?? vhon)}
        />
      </SectionCard>

      <SectionCard title="DICE Values">
        <p className="text-xs text-gray-400 -mt-2">Descriptions for Diversity, Inclusivity, Community, Equality.</p>
        {dice.map((item, i) => (
          <div key={item.letter} className="p-4 border border-gray-100 rounded-lg flex flex-col gap-2">
            <p className="text-xs font-bold text-primary uppercase">{item.letter} — {item.word}</p>
            <Textarea
              rows={3}
              value={item.desc}
              onChange={e => setDice(d => d.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))}
            />
          </div>
        ))}
        <SaveBar
          saving={saving === 'about.dice'}
          saved={saved === 'about.dice'}
          onSave={() => save('about.dice', dice)}
          onReset={() => setDice((allContent['about.dice'] as DICEItem[]) ?? dice)}
        />
      </SectionCard>

    </div>
  );
};

// ─── Tab: Testimonials ────────────────────────────────────────────────────────

const TestimonialsTab: React.FC<{ allContent: Record<string, unknown> }> = ({ allContent }) => {
  const [items, setItems] = useState<Testimonial[]>(
    (allContent['testimonials'] as Testimonial[]) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function add() {
    setItems(prev => [...prev, { id: uid(), name: '', location: '', rating: 5, text: '' }]);
  }

  function remove(id: string) {
    if (!window.confirm('Remove this testimonial?')) return;
    setItems(prev => prev.filter(x => x.id !== id));
  }

  function update(id: string, field: keyof Testimonial, val: string | number) {
    setItems(prev => prev.map(x => x.id === id ? { ...x, [field]: val } : x));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await saveBlock('testimonials', items);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} testimonial{items.length !== 1 ? 's' : ''}</p>
        <button
          onClick={add}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add testimonial
        </button>
      </div>

      {items.map((item, i) => (
        <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">#{i + 1}</span>
            <button
              onClick={() => remove(item.id)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Customer Name">
              <Input value={item.name} onChange={e => update(item.id, 'name', e.target.value)} placeholder="Adaeze O." />
            </Field>
            <Field label="Location">
              <Input value={item.location} onChange={e => update(item.id, 'location', e.target.value)} placeholder="Lagos, Nigeria" />
            </Field>
          </div>
          <Field label="Star Rating">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => update(item.id, 'rating', n)}
                  className="transition-colors"
                  aria-label={`${n} stars`}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24"
                    fill={n <= item.rating ? '#c9973a' : 'none'}
                    stroke="#c9973a" strokeWidth={1.5}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
              <span className="text-xs text-gray-400 ml-1">{item.rating}/5</span>
            </div>
          </Field>
          <Field label="Review Text">
            <Textarea rows={4} value={item.text} onChange={e => update(item.id, 'text', e.target.value)} placeholder="Share what the customer said…" />
          </Field>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm bg-white border border-dashed border-gray-200 rounded-xl">
          No testimonials yet. Click "Add testimonial" to get started.
        </div>
      )}

      <SaveBar
        saving={saving}
        saved={saved}
        onSave={save}
        onReset={() => setItems((allContent['testimonials'] as Testimonial[]) ?? [])}
      />
    </div>
  );
};

// ─── Tab: FAQs ────────────────────────────────────────────────────────────────

const FAQ_CATEGORIES = ['Shipping', 'Returns', 'Ingredients', 'Skin Concerns', 'VHON', 'Products', 'General'];

const FAQsTab: React.FC<{ allContent: Record<string, unknown> }> = ({ allContent }) => {
  const [items, setItems] = useState<FAQItem[]>(
    (allContent['faqs'] as FAQItem[]) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function add() {
    setItems(prev => [...prev, { id: uid(), category: 'General', question: '', answer: '' }]);
  }

  function remove(id: string) {
    if (!window.confirm('Delete this FAQ?')) return;
    setItems(prev => prev.filter(x => x.id !== id));
  }

  function update(id: string, field: keyof FAQItem, val: string) {
    setItems(prev => prev.map(x => x.id === id ? { ...x, [field]: val } : x));
  }

  function moveUp(i: number) {
    if (i === 0) return;
    setItems(prev => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  }

  function moveDown(i: number) {
    setItems(prev => {
      if (i >= prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await saveBlock('faqs', items);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // Group by category for display
  const categories = Array.from(new Set(items.map(x => x.category)));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} FAQ{items.length !== 1 ? 's' : ''} across {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</p>
        <button
          onClick={add}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add FAQ
        </button>
      </div>

      {items.map((item, i) => (
        <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">#{i + 1}</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{item.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => moveUp(i)} disabled={i === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors" title="Move up">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
              </button>
              <button onClick={() => moveDown(i)} disabled={i === items.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors" title="Move down">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <button onClick={() => remove(item.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
            </div>
          </div>

          <Field label="Category">
            <select
              value={item.category}
              onChange={e => update(item.id, 'category', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors bg-white"
            >
              {FAQ_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Question">
            <Input value={item.question} onChange={e => update(item.id, 'question', e.target.value)} placeholder="What is…?" />
          </Field>
          <Field label="Answer">
            <Textarea rows={4} value={item.answer} onChange={e => update(item.id, 'answer', e.target.value)} placeholder="The answer to the question…" />
          </Field>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm bg-white border border-dashed border-gray-200 rounded-xl">
          No FAQs yet. Click "Add FAQ" to get started.
        </div>
      )}

      <SaveBar
        saving={saving}
        saved={saved}
        onSave={save}
        onReset={() => setItems((allContent['faqs'] as FAQItem[]) ?? [])}
      />
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'homepage' | 'about' | 'testimonials' | 'faqs';

const TABS: { id: Tab; label: string }[] = [
  { id: 'homepage',     label: 'Homepage' },
  { id: 'about',        label: 'About' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'faqs',         label: 'FAQs' },
];

const AdminCMS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('homepage');
  const [allContent, setAllContent] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`${API_URL}/api/admin/content`);
      if (!res.ok) throw new Error('Failed to load content');
      const json = await res.json();
      setAllContent(json.data ?? {});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">
        <svg className="w-4 h-4 animate-spin mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
        </svg>
        Loading content…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        Failed to load content: {error}
        <button onClick={load} className="ml-3 underline hover:no-underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Page intro */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          Edit the site's copy and content. Each section saves independently — click <strong>Save changes</strong> after editing.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'homepage'     && <HomepageTab     allContent={allContent} />}
      {activeTab === 'about'        && <AboutTab         allContent={allContent} />}
      {activeTab === 'testimonials' && <TestimonialsTab  allContent={allContent} />}
      {activeTab === 'faqs'         && <FAQsTab          allContent={allContent} />}

    </div>
  );
};

export default AdminCMS;
