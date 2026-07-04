'use client';
/**
 * TKAG-15: FilterSidebar component
 * Renders category, skin concern, and sort filters.
 * Used both in the desktop sidebar and the mobile drawer.
 */

import React from 'react';
import type {
  ProductCategory,
  SkinConcern,
  SortOption,
} from '../../types/product';
import styles from './FilterSidebar.module.css';

// ── Filter option definitions ──────────────────────────────────────────────

interface CategoryOption {
  value: ProductCategory;
  label: string;
}

interface ConcernOption {
  value: SkinConcern;
  label: string;
}

interface SortOptionDef {
  value: SortOption;
  label: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'all', label: 'All Products' },
  { value: 'face_care', label: 'Face Care' },
  { value: 'body_care', label: 'Body Care' },
  { value: 'black_soap', label: 'Black Soap' },
  { value: 'hair_care', label: 'Hair Care' },
  { value: 'bundles', label: 'Bundles' },
  { value: 'new_arrivals', label: 'New Arrivals' },
];

const CONCERN_OPTIONS: ConcernOption[] = [
  { value: 'acne', label: 'Acne' },
  { value: 'hyperpigmentation', label: 'Hyperpigmentation' },
  { value: 'excess_oil', label: 'Excess Oil' },
  { value: 'dry_skin', label: 'Dry Skin' },
  { value: 'uneven_tone', label: 'Uneven Tone' },
  { value: 'sensitive', label: 'Sensitive Skin' },
];

const SORT_OPTIONS: SortOptionDef[] = [
  { value: 'bestseller', label: 'Best Sellers' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

// ── Component ──────────────────────────────────────────────────────────────

interface FilterSidebarProps {
  selectedCategory: ProductCategory;
  selectedConcern: SkinConcern | '';
  selectedSort: SortOption;
  onCategoryChange: (value: ProductCategory) => void;
  onConcernChange: (value: SkinConcern | '') => void;
  onSortChange: (value: SortOption) => void;
  onClearAll: () => void;
  /** When true, renders in a compact style suitable for the mobile drawer */
  compact?: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategory,
  selectedConcern,
  selectedSort,
  onCategoryChange,
  onConcernChange,
  onSortChange,
  onClearAll,
  compact = false,
}) => {
  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedConcern !== '' ||
    selectedSort !== 'bestseller';

  return (
    <aside
      className={`${styles.sidebar} ${compact ? styles.compact : ''}`}
      aria-label="Product filters"
    >
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Filters</h2>
        {hasActiveFilters && (
          <button
            className={styles.clearBtn}
            onClick={onClearAll}
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <FilterSection title="Sort By">
        <div className={styles.radioGroup} role="radiogroup" aria-label="Sort by">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className={styles.radioLabel}>
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={selectedSort === opt.value}
                onChange={() => onSortChange(opt.value)}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        <ul className={styles.chipList} role="list">
          {CATEGORY_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                className={`${styles.chip} ${
                  selectedCategory === opt.value ? styles.chipActive : ''
                }`}
                onClick={() => onCategoryChange(opt.value)}
                aria-pressed={selectedCategory === opt.value}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Skin Concern */}
      <FilterSection title="Skin Concern">
        <ul className={styles.chipList} role="list">
          {CONCERN_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                className={`${styles.chip} ${
                  selectedConcern === opt.value ? styles.chipActive : ''
                }`}
                onClick={() =>
                  onConcernChange(
                    selectedConcern === opt.value ? '' : opt.value
                  )
                }
                aria-pressed={selectedConcern === opt.value}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>
    </aside>
  );
};

// ── Helper sub-component ───────────────────────────────────────────────────

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => (
  <div className={styles.section}>
    <h3 className={styles.sectionTitle}>{title}</h3>
    {children}
  </div>
);