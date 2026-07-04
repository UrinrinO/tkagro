'use client';
/**
 * TKAG-26: Balanced Wellness Hub — Category Tag Component
 */

import React from 'react';
import type { BlogCategory } from '../../types/blog';
import { CATEGORY_LABELS, getCategoryModifier } from '../../utils/blogHelpers';
import styles from './CategoryTag.module.css';

interface CategoryTagProps {
  category: BlogCategory;
  size?: 'sm' | 'md';
}

const CategoryTag: React.FC<CategoryTagProps> = ({ category, size = 'md' }) => {
  const modifier = getCategoryModifier(category);
  const label = CATEGORY_LABELS[category] ?? category;

  return (
    <span
      className={`${styles.tag} ${styles[`tag--${modifier}`]} ${styles[`tag--${size}`]}`}
      aria-label={`Category: ${label}`}
    >
      {label}
    </span>
  );
};

export default CategoryTag;