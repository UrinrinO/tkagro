'use client';
/**
 * TKAG-26: Balanced Wellness Hub — Blog Post Card Component
 */

import React from 'react';
import Link from 'next/link';
import type { BlogPost } from '../../types/blog';
import { formatBlogDate } from '../../utils/blogHelpers';
import CategoryTag from './CategoryTag';
import styles from './BlogCard.module.css';

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const { slug, title, excerpt, featuredImage, category, author, publishedAt } = post;
  const articleUrl = `/balanced-wellness/${slug}`;
  const formattedDate = formatBlogDate(publishedAt);

  return (
    <article className={styles.card}>
      {/* Featured Image */}
      <Link href={articleUrl} className={styles.imageWrapper} tabIndex={-1} aria-hidden="true">
        <img
          src={featuredImage}
          alt={title}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.imageOverlay} />
      </Link>

      {/* Card Body */}
      <div className={styles.body}>
        {/* Category Tag */}
        <div className={styles.tagRow}>
          <CategoryTag category={category} size="sm" />
        </div>

        {/* Title */}
        <h3 className={styles.title}>
          <Link href={articleUrl} className={styles.titleLink}>
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className={styles.excerpt}>{excerpt}</p>

        {/* Meta: author + date */}
        <div className={styles.meta}>
          {author.avatar && (
            <img
              src={author.avatar}
              alt={author.name}
              className={styles.authorAvatar}
            />
          )}
          <div className={styles.metaText}>
            <span className={styles.authorName}>{author.name}</span>
            <time className={styles.date} dateTime={publishedAt}>
              {formattedDate}
            </time>
          </div>
        </div>

        {/* Read More CTA */}
        <Link href={articleUrl} className={styles.readMore} aria-label={`Read more about ${title}`}>
          Read More
          <svg
            className={styles.readMoreIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;