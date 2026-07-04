'use client';
/**
 * TKAG-26: Balanced Wellness Hub — Article Detail Page
 * Route: /balanced-wellness/:slug
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useBlogPost, useRelatedPosts } from '@/hooks/useBlog';
import { formatBlogDate, CATEGORY_LABELS } from '../utils/blogHelpers';
import CategoryTag from '@/components/Blog/CategoryTag';
import BlogCard from '@/components/Blog/BlogCard';
import SocialShare from '@/components/Blog/SocialShare';
import styles from './BalancedWellnessArticlePage.module.css';

// ─── Article Skeleton ─────────────────────────────────────────────────────────

const ArticleSkeleton: React.FC = () => (
  <div className={styles.skeleton} aria-hidden="true" role="status">
    <div className={`${styles.skeletonBlock} ${styles.skeletonHero}`} />
    <div className={styles.skeletonBody}>
      <div className={`${styles.skeletonBlock} ${styles.skeletonTag}`} />
      <div className={`${styles.skeletonBlock} ${styles.skeletonTitleLg}`} />
      <div className={`${styles.skeletonBlock} ${styles.skeletonTitleSm}`} />
      <div className={`${styles.skeletonBlock} ${styles.skeletonMeta}`} />
      <div className={styles.skeletonLines}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`${styles.skeletonBlock} ${styles.skeletonLine}`}
            style={{ width: i % 3 === 2 ? '70%' : '100%' }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── 404 State ────────────────────────────────────────────────────────────────

const NotFoundState: React.FC = () => (
  <div className={styles.notFound}>
    <div className={styles.notFoundInner}>
      <span className={styles.notFoundCode}>404</span>
      <h1 className={styles.notFoundTitle}>Article Not Found</h1>
      <p className={styles.notFoundText}>
        The article you're looking for doesn't exist or may have been removed.
      </p>
      <Link href="/balanced-wellness" className={styles.notFoundCta}>
        ← Back to Balanced Wellness Hub
      </Link>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const BalancedWellnessArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const { post, isLoading, notFound, error } = useBlogPost(slug ?? '');
  const { posts: relatedPosts, isLoading: relatedLoading } = useRelatedPosts(
    post?.category,
    slug ?? ''
  );

  // Update document title when post loads
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Balanced Wellness Hub — T.kays Agrocosmetics`;
    }
    return () => {
      document.title = 'T.kays Agrocosmetics';
    };
  }, [post]);

  // Redirect to 404 state if slug is missing
  useEffect(() => {
    if (!slug) {
      router.replace('/balanced-wellness');
    }
  }, [slug, router]);

  if (isLoading) {
    return (
      <main className={styles.page}>
        <ArticleSkeleton />
      </main>
    );
  }

  if (notFound || (!isLoading && !post && !error)) {
    return (
      <main className={styles.page}>
        <NotFoundState />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <div className={styles.errorState} role="alert">
          <p>Unable to load this article. Please try again later.</p>
          <Link href="/balanced-wellness" className={styles.backLink}>
            ← Back to Balanced Wellness Hub
          </Link>
        </div>
      </main>
    );
  }

  if (!post) return null;

  const formattedDate = formatBlogDate(post.publishedAt);
  const categoryLabel = CATEGORY_LABELS[post.category];

  return (
    <main className={styles.page}>
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <div className={styles.breadcrumbInner}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
          <Link href="/balanced-wellness" className={styles.breadcrumbLink}>
            Balanced Wellness Hub
          </Link>
          <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
          <span className={styles.breadcrumbCurrent} aria-current="page">
            {post.title}
          </span>
        </div>
      </nav>

      {/* ── Hero Image ──────────────────────────────────────────── */}
      <div className={styles.heroImageWrapper}>
        <img
          src={post.featuredImage}
          alt={post.title}
          className={styles.heroImage}
        />
        <div className={styles.heroImageOverlay} aria-hidden="true" />
      </div>

      {/* ── Article Layout ──────────────────────────────────────── */}
      <div className={styles.articleLayout}>
        {/* Article Header */}
        <header className={styles.articleHeader}>
          <CategoryTag category={post.category} size="md" />

          <h1 className={styles.articleTitle}>{post.title}</h1>

          {/* Author + Date meta */}
          <div className={styles.articleMeta}>
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className={styles.authorAvatar}
              />
            )}
            <div className={styles.metaDetails}>
              <span className={styles.authorName}>By {post.author.name}</span>
              <time
                className={styles.publishDate}
                dateTime={post.publishedAt}
              >
                {formattedDate}
              </time>
            </div>
          </div>

          {/* Excerpt / lead paragraph */}
          {post.excerpt && (
            <p className={styles.articleExcerpt}>{post.excerpt}</p>
          )}
        </header>

        {/* Article Body — renders HTML content safely */}
        <div
          className={styles.articleBody}
          // The backend is trusted to sanitise HTML before storing.
          // In production, consider DOMPurify for additional client-side sanitisation.
          dangerouslySetInnerHTML={{ __html: post.body }}
          aria-label="Article content"
        />

        {/* Divider */}
        <hr className={styles.divider} />

        {/* Social Share */}
        <div className={styles.shareSection}>
          <SocialShare title={post.title} />
        </div>

        {/* Back link */}
        <div className={styles.backLinkRow}>
          <Link href="/balanced-wellness" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Balanced Wellness Hub
          </Link>
        </div>
      </div>

      {/* ── Related Articles ─────────────────────────────────────── */}
      {(relatedPosts.length > 0 || relatedLoading) && (
        <section className={styles.relatedSection} aria-label="Related articles">
          <div className={styles.relatedInner}>
            <div className={styles.relatedHeader}>
              <h2 className={styles.relatedTitle}>More from {categoryLabel}</h2>
              <Link
                href={`/balanced-wellness?category=${post.category}`}
                className={styles.relatedViewAll}
              >
                View all →
              </Link>
            </div>

            {relatedLoading ? (
              <div className={styles.relatedGrid}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.relatedSkeletonCard} aria-hidden="true">
                    <div className={styles.relatedSkeletonImg} />
                    <div className={styles.relatedSkeletonBody}>
                      <div className={styles.relatedSkeletonLine} style={{ width: '40%', height: '16px' }} />
                      <div className={styles.relatedSkeletonLine} style={{ width: '90%', height: '20px' }} />
                      <div className={styles.relatedSkeletonLine} style={{ width: '70%', height: '20px' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.relatedGrid}>
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
};

export default BalancedWellnessArticlePage;