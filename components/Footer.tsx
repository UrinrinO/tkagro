'use client';
/**
 * Footer.tsx
 * TKAG-8: Responsive footer — stacked (mobile) → 2×2 grid (tablet) → 4 columns (desktop).
 */

import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* ── Grid: 4 columns on desktop, 2×2 on tablet, stacked on mobile ── */}
        <div className={styles.grid}>
          {/* Column 1: Brand */}
          <div className={styles.column}>
            <div className={styles.brand}>
              <span className={styles.brandName}>T.kays</span>
              <span className={styles.brandSub}>Agrocosmetics</span>
            </div>
            <p className={styles.brandTagline}>Balanced Wellness</p>
            <p className={styles.brandDesc}>
              Natural, botanical skincare crafted for health-conscious individuals
              who care about what goes on their skin.
            </p>
          </div>

          {/* Column 2: Shop */}
          <div className={styles.column}>
            <h3 className={styles.columnHeading}>Shop</h3>
            <ul className={styles.linkList}>
              <li><Link href="/catalog" className={styles.link}>All Products</Link></li>
              <li><Link href="/skincare" className={styles.link}>Skincare</Link></li>
              <li><Link href="/hair-body" className={styles.link}>Hair & Body</Link></li>
              <li><Link href="/accessories" className={styles.link}>Accessories</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className={styles.column}>
            <h3 className={styles.columnHeading}>Company</h3>
            <ul className={styles.linkList}>
              <li><Link href="/about" className={styles.link}>About Us</Link></li>
              <li><Link href="/blog" className={styles.link}>Blog</Link></li>
              <li><Link href="/contact" className={styles.link}>Contact</Link></li>
              <li><Link href="/sustainability" className={styles.link}>Sustainability</Link></li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className={styles.column}>
            <h3 className={styles.columnHeading}>Connect</h3>
            <ul className={styles.linkList}>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  TikTok
                </a>
              </li>
            </ul>

            {/* Newsletter signup */}
            <div className={styles.newsletter}>
              <p className={styles.newsletterLabel}>Stay in the loop</p>
              <form
                className={styles.newsletterForm}
                onSubmit={(e) => e.preventDefault()}
                aria-label="Newsletter signup"
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  className={styles.newsletterInput}
                  aria-label="Email address"
                  required
                />
                <button type="submit" className={styles.newsletterButton}>
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {currentYear} T.kays Agrocosmetics. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <Link href="/privacy" className={styles.legalLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.legalLink}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;