'use client';
/**
 * TKAG-32: Footer component with links, newsletter, and social icons
 * Site-wide footer integrated into MainLayout.tsx
 */

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NewsletterState {
  email: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

// ─── Social Icons (inline SVGs) ──────────────────────────────────────────────

const InstagramIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const TikTokIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
  </svg>
);

const WhatsAppIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const YouTubeIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// ─── Navigation Data ──────────────────────────────────────────────────────────

const shopLinks = [
  { label: 'All Products', to: '/shop' },
  { label: 'Skincare', to: '/skincare' },
  { label: 'Hair Care', to: '/hair-body' },
  { label: 'Accessories', to: '/accessories' },
  { label: 'Skin Concerns', to: '/skin-concerns' },
];

const infoLinks = [
  { label: 'About', to: '/about' },
  { label: 'Ingredients', to: '/ingredients' },
  { label: 'Skin Concerns', to: '/skin-concerns' },
  { label: 'Results', to: '/results' },
  { label: 'Community', to: '/community' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
];

const legalLinks = [
  { label: 'Privacy Notice', to: '/privacy-policy' },
  { label: 'Cookie Policy', to: '/cookies' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Copyright', to: '/copyright' },
  { label: 'Shipping Policy', to: '/shipping-policy' },
  { label: 'Returns Policy', to: '/returns-policy' },
];

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/tkaysagrocosmetics',
    icon: <InstagramIcon />,
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@tkaysagrocosmetics',
    icon: <TikTokIcon />,
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/2340000000000',
    icon: <WhatsAppIcon />,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@tkaysagrocosmetics',
    icon: <YouTubeIcon />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Footer: React.FC = () => {
  const [newsletter, setNewsletter] = useState<NewsletterState>({
    email: '',
    status: 'idle',
    message: '',
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewsletter((prev) => ({ ...prev, email: e.target.value, message: '' }));
  };

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = newsletter.email.trim();

    // Basic email validation before hitting the API
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletter((prev) => ({
        ...prev,
        status: 'error',
        message: 'Please enter a valid email address.',
      }));
      return;
    }

    setNewsletter((prev) => ({ ...prev, status: 'loading', message: '' }));

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        // Surface server-side error messages when available
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Subscription failed. Please try again.');
      }

      setNewsletter({
        email: '',
        status: 'success',
        message: 'You\'re subscribed! Welcome to the T.kays community 🌿',
      });
    } catch (err) {
      setNewsletter((prev) => ({
        ...prev,
        status: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong.',
      }));
    }
  };

  return (
    <footer className={styles.footer} aria-label="Site footer">
      {/* ── Main grid ── */}
      <div className={styles.container}>
        <div className={styles.grid}>

          {/* Column 1 — Brand */}
          <div className={styles.column}>
            <Link href="/" className={styles.logoLink} aria-label="T.kays Agrocosmetics home">
              <span className={styles.logoText}>T.kays</span>
              <span className={styles.logoSub}>Agrocosmetics</span>
            </Link>

            <p className={styles.tagline}>Balanced Wellness</p>

            <p className={styles.brandDescription}>
              We craft plant-powered skincare rooted in African botanicals,
              designed to restore your skin's natural balance.{' '}
              Every product is handmade with intention — because what you put
              on your skin matters as much as what you put in your body.
            </p>

            {/* Social icons */}
            <div className={styles.socialRow} role="list" aria-label="Social media links">
              {socialLinks.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIcon}
                  aria-label={`Follow us on ${label}`}
                  role="listitem"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Shop */}
          <div className={styles.column}>
            <h3 className={styles.columnHeading}>Shop</h3>
            <nav aria-label="Shop navigation">
              <ul className={styles.linkList}>
                {shopLinks.map(({ label, to }) => (
                  <li key={to}>
                    <Link href={to} className={styles.navLink}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 3 — Info */}
          <div className={styles.column}>
            <h3 className={styles.columnHeading}>Info</h3>
            <nav aria-label="Info navigation">
              <ul className={styles.linkList}>
                {infoLinks.map(({ label, to }) => (
                  <li key={to}>
                    <Link href={to} className={styles.navLink}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 4 — Newsletter */}
          <div className={styles.column}>
            <h3 className={styles.columnHeading}>Stay in the loop</h3>
            <p className={styles.newsletterSubtext}>
              Get skincare tips, new launches, and exclusive offers straight to your inbox.
            </p>

            <form
              className={styles.newsletterForm}
              onSubmit={handleNewsletterSubmit}
              noValidate
              aria-label="Newsletter signup"
            >
              <label htmlFor="footer-newsletter-email" className={styles.srOnly}>
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                name="email"
                value={newsletter.email}
                onChange={handleEmailChange}
                placeholder="your@email.com"
                className={styles.newsletterInput}
                disabled={newsletter.status === 'loading' || newsletter.status === 'success'}
                autoComplete="email"
                aria-describedby="newsletter-status"
              />
              <button
                type="submit"
                className={styles.newsletterButton}
                disabled={newsletter.status === 'loading' || newsletter.status === 'success'}
                aria-busy={newsletter.status === 'loading'}
              >
                {newsletter.status === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>

            {/* Status message */}
            {newsletter.message && (
              <p
                id="newsletter-status"
                className={
                  newsletter.status === 'success'
                    ? styles.successMessage
                    : styles.errorMessage
                }
                role={newsletter.status === 'error' ? 'alert' : 'status'}
                aria-live="polite"
              >
                {newsletter.message}
              </p>
            )}

          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className={styles.bottomBar}>
        {/* Copyright row */}
        <div className={styles.bottomBarInner}>
          <p className={styles.copyright}>
            © 2026 T.kays Agrocosmetics. All rights reserved.
          </p>
          <p className={styles.madeIn}>Handmade with love 🌿</p>
        </div>

        {/* Legal links strip */}
        <nav className={styles.legalStrip} aria-label="Legal links">
          <ul className={styles.legalLinks}>
            {legalLinks.map(({ label, to }, i) => (
              <li key={to} className={styles.legalItem}>
                {i > 0 && <span className={styles.legalDivider} aria-hidden="true">·</span>}
                <Link href={to} className={styles.legalLink}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;