'use client';
/**
 * TKAG-26: Balanced Wellness Hub — Blog Post Grid
 */

import React from 'react';
import type { BlogPost } from '../../types/blog';
import BlogCard from './BlogCard';
import styles from './BlogGrid.module.css';

interface BlogGridProps {
  posts: BlogPost[];
}

const BlogGrid: React.FC<BlogGridProps> = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>No articles found in this category yet.</p>
        <p className={styles.emptySubtext}>Check back soon for new content.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid} role="list" aria-label="Blog posts">
      {posts.map((post) => (
        <div key={post.id} role="listitem">
          <BlogCard post={post} />
        </div>
      ))}
    </div>
  );
};

export default BlogGrid;