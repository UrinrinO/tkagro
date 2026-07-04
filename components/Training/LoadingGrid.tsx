'use client';
/**
 * TKAG-28: Training Academy — Skeleton loading grid
 */

import React from 'react';
import styles from './LoadingGrid.module.css';

interface LoadingGridProps {
  count?: number;
  variant?: 'workshop' | 'course';
}

const LoadingGrid: React.FC<LoadingGridProps> = ({ count = 3, variant = 'course' }) => {
  return (
    <div className={styles.grid} aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${styles.skeleton} ${styles[variant]}`}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} style={{ width: '60%' }} />
            <div className={styles.skeletonLine} style={{ width: '90%' }} />
            <div className={styles.skeletonLine} style={{ width: '75%' }} />
            <div className={styles.skeletonLine} style={{ width: '40%', marginTop: 'var(--space-4)' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingGrid;