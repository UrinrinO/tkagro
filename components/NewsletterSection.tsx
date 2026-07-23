'use client';
/**
 * NewsletterSection — immersive dark-green editorial signup section.
 */

import React, { useState, useId } from 'react';
import type { NewsletterContent } from '@/hooks/useHomepageContent';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PERKS = [
  { icon: '🌿', label: 'Skincare rituals' },
  { icon: '✨', label: 'New drop access' },
  { icon: '🎁', label: 'Member discounts' },
  { icon: '📖', label: 'Ingredient guides' },
];

const NewsletterSection: React.FC<{ content?: Partial<NewsletterContent> }> = ({ content }) => {
  const heading = content?.heading;
  const subtext =
    content?.subtext ||
    'Weekly skincare rituals, ingredient spotlights, and first access to every T.kays drop — straight to your inbox. No noise. No spam.';
  const placeholder = content?.placeholder || 'Your email address';
  const buttonText = content?.buttonText || 'Subscribe Free →';

  const [email, setEmail] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const emailInputId = useId();

  const validateEmail = (value: string): string => {
    if (!value.trim()) return 'Please enter your email address.';
    if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const msg = validateEmail(email);
    if (msg) { setValidationError(msg); return; }
    setSubmitState('submitting');
    setErrorMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) throw new Error(`Subscription failed (${res.status})`);
      setSubmitState('success');
      setEmail('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitState('error');
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-primary py-28 px-6 lg:px-16"
      aria-labelledby="newsletter-heading"
    >
      {/* ── Decorative depth layers ── */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/[0.04] pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/10 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/[0.06] pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.05] pointer-events-none" aria-hidden="true" />

      {/* ── Big background text ── */}
      <p className="absolute inset-0 flex items-center justify-center font-heading text-[18vw] font-bold text-white/[0.03] leading-none select-none pointer-events-none whitespace-nowrap" aria-hidden="true">
        Wellness
      </p>

      <div className="relative z-10 max-w-3xl mx-auto text-center">

        {/* Social proof pill */}
        <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-full px-5 py-2.5 mb-8">
          <div className="flex -space-x-2" aria-hidden="true">
            {['bg-accent', 'bg-white/40', 'bg-primary-pale'].map((c, i) => (
              <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-primary/80`} />
            ))}
          </div>
          <span className="text-white/80 text-xs font-semibold tracking-wide">
            5,000+ skincare lovers already inside
          </span>
        </div>

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

        {/* Perk chips */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-12" aria-label="Newsletter benefits">
          {PERKS.map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-4 py-2 rounded-full"
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </span>
          ))}
        </div>

        {/* Form / success */}
        {submitState === 'success' ? (
          <div className="inline-flex flex-col items-center gap-4" role="status" aria-live="polite">
            <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-white mb-1">Welcome to the family!</p>
              <p className="text-white/60 text-sm">Check your inbox for a welcome gift from T.kays.</p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Newsletter subscription"
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <div className="flex-1">
              <label htmlFor={emailInputId} className="sr-only">Email address</label>
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
                disabled={submitState === 'submitting'}
                autoComplete="email"
                aria-invalid={!!validationError}
                className={`w-full bg-white/10 border ${
                  validationError ? 'border-red-400' : 'border-white/25'
                } rounded-full px-6 py-4 text-white placeholder-white/40 text-sm focus:outline-none focus:border-accent transition-colors backdrop-blur-sm`}
              />
              {validationError && (
                <p className="text-red-400 text-xs mt-2 text-left pl-4" role="alert">{validationError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitState === 'submitting'}
              aria-busy={submitState === 'submitting'}
              className="flex-shrink-0 bg-accent hover:bg-accent-light text-brand-dark font-bold text-sm tracking-wide px-8 py-4 rounded-full transition-all duration-200 disabled:opacity-60 whitespace-nowrap shadow-lg shadow-accent/20"
            >
              {submitState === 'submitting' ? 'Subscribing…' : buttonText}
            </button>
          </form>
        )}

        {submitState === 'error' && errorMessage && (
          <div className="mt-4 inline-flex items-center gap-3 bg-red-500/20 border border-red-400/30 rounded-full px-5 py-2.5" role="alert">
            <p className="text-red-300 text-xs">{errorMessage}</p>
            <button
              type="button"
              onClick={() => { setSubmitState('idle'); setErrorMessage(''); }}
              className="text-red-300 text-xs underline"
            >
              Try again
            </button>
          </div>
        )}

        <p className="text-white/30 text-xs mt-6">
          By subscribing you agree to our{' '}
          <a href="/privacy" className="underline hover:text-white/60 transition-colors">Privacy Policy</a>.
          Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;
