'use client';
/**
 * TKAG-10: Generic placeholder page.
 * Used for routes that are defined in the router but not yet implemented.
 * Replace with real page components in subsequent tickets.
 */

import styles from "./PlaceholderPage.module.css";

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className={styles.page} aria-labelledby="placeholder-heading">
      <div className={`container ${styles.inner}`}>
        {/* Decorative botanical accent */}
        <span className={styles.leaf} aria-hidden="true">🌿</span>

        <h1 id="placeholder-heading" className={styles.title}>
          {title}
        </h1>

        <p className={styles.body}>
          This page is coming soon. We&apos;re crafting something beautiful for you.
        </p>

        <a href="/" className={styles.cta}>
          Return home
        </a>
      </div>
    </section>
  );
}