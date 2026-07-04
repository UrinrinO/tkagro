'use client';
/**
 * TKAG-15: ShopPage
 * Main product listing page at /shop.
 * Manages filter state via URL search params, debounces API calls,
 * and renders a responsive sidebar + product grid layout.
 */

import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterSidebar } from '../../components/Shop/FilterSidebar';
import { MobileFilterDrawer } from '../../components/Shop/MobileFilterDrawer';
import { ProductCard } from '../../components/Shop/ProductCard';
import { useProducts } from '../../hooks/useProducts';
import type {
  ProductCategory,
  ProductFilters,
  SkinConcern,
  SortOption,
} from '../../types/product';
import styles from './ShopPage.module.css';

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Safely parses a URL param into a typed value, falling back to a default.
 */
function parseParam<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T
): T {
  if (value && (allowed as readonly string[]).includes(value)) {
    return value as T;
  }
  return fallback;
}

const VALID_CATEGORIES: ProductCategory[] = [
  'all',
  'face_care',
  'body_care',
  'black_soap',
  'hair_care',
  'bundles',
  'new_arrivals',
];

const VALID_CONCERNS: SkinConcern[] = [
  'acne',
  'hyperpigmentation',
  'excess_oil',
  'dry_skin',
  'uneven_tone',
  'sensitive',
];

const VALID_SORTS: SortOption[] = [
  'bestseller',
  'newest',
  'price_asc',
  'price_desc',
];

// ── Component ──────────────────────────────────────────────────────────────

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Derive filter state from URL params — this is the single source of truth
  const selectedCategory = parseParam<ProductCategory>(
    searchParams.get('category'),
    VALID_CATEGORIES,
    'all'
  );
  const selectedConcern = parseParam<SkinConcern | ''>(
    searchParams.get('concern'),
    [...VALID_CONCERNS, ''] as (SkinConcern | '')[],
    ''
  );
  const selectedSort = parseParam<SortOption>(
    searchParams.get('sort'),
    VALID_SORTS,
    'bestseller'
  );

  const filters: ProductFilters = {
    category: selectedCategory,
    concern: selectedConcern,
    sort: selectedSort,
    page: 1, // page is managed internally by useProducts
  };

  const {
    products,
    total,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    hasMore,
  } = useProducts(filters);

  // ── Filter update handlers ───────────────────────────────────────────────

  /**
   * Updates a single URL param, removing it if it matches the default value
   * to keep URLs clean.
   */
  const updateParam = useCallback(
    (key: string, value: string, defaultValue: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === defaultValue) {
            next.delete(key);
          } else {
            next.set(key, value);
          }
          return next;
        },
        { replace: true } // avoid polluting browser history on every filter click
      );
    },
    [setSearchParams]
  );

  const handleCategoryChange = useCallback(
    (value: ProductCategory) => updateParam('category', value, 'all'),
    [updateParam]
  );

  const handleConcernChange = useCallback(
    (value: SkinConcern | '') => updateParam('concern', value, ''),
    [updateParam]
  );

  const handleSortChange = useCallback(
    (value: SortOption) => updateParam('sort', value, 'bestseller'),
    [updateParam]
  );

  const handleClearAll = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // ── Shared filter props ──────────────────────────────────────────────────

  const filterProps = {
    selectedCategory,
    selectedConcern,
    selectedSort,
    onCategoryChange: handleCategoryChange,
    onConcernChange: handleConcernChange,
    onSortChange: handleSortChange,
    onClearAll: handleClearAll,
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      {/* Page header */}
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <h1 className={styles.pageTitle}>Shop All Products</h1>
          <p className={styles.pageSubtitle}>
            Natural, botanical formulas crafted for balanced wellness.
          </p>
        </div>
      </header>

      <div className={styles.container}>
        {/* Mobile filter trigger */}
        <div className={styles.mobileFilterBar}>
          <button
            className={styles.mobileFilterBtn}
            onClick={() => setIsDrawerOpen(true)}
            aria-expanded={isDrawerOpen}
            aria-controls="mobile-filter-drawer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 4h14M5 9h8M8 14h2"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
            Filters
            {(selectedCategory !== 'all' || selectedConcern !== '') && (
              <span className={styles.filterBadge} aria-label="Active filters">
                {(selectedCategory !== 'all' ? 1 : 0) +
                  (selectedConcern !== '' ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Result count on mobile */}
          {!isLoading && (
            <span className={styles.resultCount}>
              {total} product{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Main layout */}
        <div className={styles.layout}>
          {/* Desktop sidebar */}
          <div className={styles.sidebarWrapper} aria-hidden={undefined}>
            <FilterSidebar {...filterProps} />
          </div>

          {/* Product area */}
          <main className={styles.main} id="product-grid" aria-live="polite" aria-busy={isLoading}>
            {/* Desktop result count */}
            {!isLoading && total > 0 && (
              <p className={styles.desktopResultCount}>
                Showing{' '}
                <strong>{products.length}</strong> of{' '}
                <strong>{total}</strong> product{total !== 1 ? 's' : ''}
              </p>
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <div className={styles.grid} aria-label="Loading products">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.skeleton} aria-hidden="true" />
                ))}
              </div>
            )}

            {/* Error state */}
            {!isLoading && error && (
              <div className={styles.emptyState} role="alert">
                <span className={styles.emptyIcon} aria-hidden="true">⚠️</span>
                <h2 className={styles.emptyTitle}>Something went wrong</h2>
                <p className={styles.emptyText}>{error}</p>
                <button
                  className={styles.retryBtn}
                  onClick={() => handleClearAll()}
                >
                  Clear filters and retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && products.length === 0 && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon} aria-hidden="true">🌿</span>
                <h2 className={styles.emptyTitle}>No products found</h2>
                <p className={styles.emptyText}>
                  Try adjusting your filters or browse all products.
                </p>
                <button
                  className={styles.retryBtn}
                  onClick={handleClearAll}
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Product grid */}
            {!isLoading && !error && products.length > 0 && (
              <>
                <ul className={styles.grid} role="list" aria-label="Products">
                  {products.map((product) => (
                    <li key={product.id} className={styles.gridItem}>
                      <ProductCard product={product} />
                    </li>
                  ))}
                </ul>

                {/* Load more / pagination */}
                {hasMore && (
                  <div className={styles.loadMoreWrapper}>
                    <button
                      className={styles.loadMoreBtn}
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      aria-label="Load more products"
                    >
                      {isLoadingMore ? (
                        <>
                          <span className={styles.spinner} aria-hidden="true" />
                          Loading…
                        </>
                      ) : (
                        'Load More Products'
                      )}
                    </button>
                  </div>
                )}

                {/* End of results indicator */}
                {!hasMore && products.length > 0 && (
                  <p className={styles.endOfResults}>
                    You've seen all {total} product{total !== 1 ? 's' : ''}.
                  </p>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        {...filterProps}
      />
    </div>
  );
};

export default ShopPage;