'use client';
/**
 * TKAG-26: Balanced Wellness Hub — Blog Listing Page
 * Route: /balanced-wellness
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { BlogCategory } from '@/types/blog';
import { useBlogList } from '@/hooks/useBlog';
import CategoryFilterTabs from '@/components/Blog/CategoryFilterTabs';
import BlogGrid from '@/components/Blog/BlogGrid';
import BlogPostSkeleton from '@/components/Blog/BlogPostSkeleton';
import Pagination from '@/components/Blog/Pagination';
import styles from './BalancedWellnessPage.module.css';

const POSTS_PER_PAGE = 9;

const BalancedWellnessPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive state from URL search params for shareable/bookmarkable URLs
  const categoryParam = searchParams.get('category') as BlogCategory | 'all' | null;
  const pageParam = parseInt(searchParams.get('page') ?? '1', 10);

  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'all'>(
    categoryParam ?? 'all'
  );
  const [currentPage, setCurrentPage] = useState<number>(
    isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
  );

  const { posts, totalPages, isLoading, error } = useBlogList({
    category: activeCategory,
    page: currentPage,
    limit: POSTS_PER_PAGE,
  });

  // Sync state changes back to URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (activeCategory !== 'all') params.category = activeCategory;
    if (currentPage > 1) params.page = String(currentPage);
    setSearchParams(params, { replace: true });
  }, [activeCategory, currentPage, setSearchParams]);

  // Scroll to top of article grid on page change
  useEffect(() => {
    const grid = document.getElementById('blog-grid-section');
    if (grid && currentPage > 1) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  const handleCategoryChange = (category: BlogCategory | 'all') => {
    setActiveCategory(category);
    setCurrentPage(1); // Reset to first page on category change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main className={styles.page}>
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className={styles.hero} aria-label="Balanced Wellness Hub hero">
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>Our Journal</div>
          <h1 className={styles.heroHeading}>Balanced Wellness Hub</h1>
          <p className={styles.heroTagline}>
            Insights, rituals, and stories to help you live beautifully — inside and out.
            Rooted in nature, guided by science.
          </p>
        </div>

        {/* Decorative botanical element */}
        <div className={styles.heroDecor} aria-hidden="true">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.heroDecorSvg}>
            <path d="M100 10 C60 40, 20 80, 40 130 C60 180, 140 180, 160 130 C180 80, 140 40, 100 10Z" fill="currentColor" opacity="0.06" />
            <path d="M100 30 C70 55, 45 90, 60 125 C75 160, 125 160, 140 125 C155 90, 130 55, 100 30Z" fill="currentColor" opacity="0.04" />
          </svg>
        </div>
      </section>

      {/* ── Filter + Grid Section ─────────────────────────────────── */}
      <section
        id="blog-grid-section"
        className={styles.content}
        aria-label="Blog articles"
      >
        <div className={styles.container}>
          {/* Category Filter Tabs */}
          <div className={styles.filterRow}>
            <CategoryFilterTabs
              activeCategory={activeCategory}
              onChange={handleCategoryChange}
            />
          </div>

          {/* Error State */}
          {error && !isLoading && (
            <div className={styles.errorBanner} role="alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Unable to load articles. Please try again later.</span>
            </div>
          )}

          {/* Blog Grid or Skeleton */}
          {isLoading ? (
            <BlogPostSkeleton count={POSTS_PER_PAGE} />
          ) : (
            !error && <BlogGrid posts={posts} />
          )}

          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <div className={styles.paginationRow}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default BalancedWellnessPage;