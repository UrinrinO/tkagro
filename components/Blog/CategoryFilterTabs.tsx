'use client';
/**
 * TKAG-26: Balanced Wellness Hub — Category Filter Tabs
 */

import React from 'react';
import type { BlogCategory, CategoryTab } from '../../types/blog';
import { CATEGORY_TABS } from '../../utils/blogHelpers';
import styles from './CategoryFilterTabs.module.css';

interface CategoryFilterTabsProps {
  activeCategory: BlogCategory | 'all';
  onChange: (category: BlogCategory | 'all') => void;
}

const CategoryFilterTabs: React.FC<CategoryFilterTabsProps> = ({
  activeCategory,
  onChange,
}) => {
  return (
    <nav className={styles.nav} aria-label="Blog category filter">
      <div className={styles.tabList} role="tablist">
        {CATEGORY_TABS.map((tab: CategoryTab) => {
          const isActive = tab.value === activeCategory;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
              onClick={() => onChange(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default CategoryFilterTabs;