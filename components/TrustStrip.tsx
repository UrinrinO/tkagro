'use client';
/**
 * TrustStrip — animated horizontal ticker of brand value pills
 * that sits immediately below the hero section.
 */

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

  return (
    <div className={styles.strip} aria-label="Brand values" role="marquee">
      <ul className={styles.track} aria-hidden="true">
        {doubled.map((item, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.dot} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrustStrip;
