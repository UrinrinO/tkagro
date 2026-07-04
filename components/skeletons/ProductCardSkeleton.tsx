'use client';
/**
 * TKAG-24 — Loading skeleton for ProductCard, used while fetching concern products.
 */

import React from 'react';
import styles from './ProductCardSkeleton.module.css';

const ProductCardSkeleton: React.FC = () => (
  <div className={styles.card} aria-hidden="true">
    <div className={styles.imagePlaceholder} />
    <div className={styles.body}>
      <div className={`${styles.line} ${styles.lineName}`} />
      <div className={`${styles.line} ${styles.lineTagline}`} />
      <div className={`${styles.line} ${styles.lineTaglineShort}`} />
      <div className={styles.footer}>
        <div className={`${styles.line} ${styles.linePrice}`} />
        <div className={`${styles.line} ${styles.lineButton}`} />
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;