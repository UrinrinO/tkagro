'use client';
/**
 * TKAG-26: Balanced Wellness Hub — Loading Skeleton for Blog Cards
 */

import React from 'react';
import styles from './BlogPostSkeleton.module.css';

interface BlogPostSkeletonProps {
  count?: number;
}

const SkeletonCard: React.FC = () => (
  <div className={styles.card} aria-hidden="true">
    <div className={styles.image} />
    <div className={styles.body}>
      <div className={`${styles.line} ${styles.tag}`} />
      <div className={`${styles.line} ${styles.titleLong}`} />
      <div className={`${styles.line} ${styles.titleShort}`} />
      <div className={`${styles.line} ${styles.excerpt}`} />
      <div className={`${styles.line} ${styles.excerptShort}`} />
      <div className={styles.meta}>
        <div className={styles.avatar} />
        <div className={styles.metaLines}>
          <div className={`${styles.line} ${styles.metaName}`} />
          <div className={`${styles.line} ${styles.metaDate}`} />
        </div>
      </div>
    </div>
  </div>
);

const BlogPostSkeleton: React.FC<BlogPostSkeletonProps> = ({ count = 9 }) => {
  return (
    <div className={styles.grid} role="status" aria-label="Loading blog posts">
      <span className={styles.srOnly}>Loading articles…</span>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default BlogPostSkeleton;