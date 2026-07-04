'use client';
/**
 * TKAG-26: Balanced Wellness Hub — Blog Data Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import type { BlogPost, BlogListResponse, BlogCategory } from '@/types/blog';

const API_BASE = '' ?? '';

// ─── Listing Hook ────────────────────────────────────────────────────────────

interface UseBlogListOptions {
  category?: BlogCategory | 'all';
  page?: number;
  limit?: number;
}

interface UseBlogListReturn {
  posts: BlogPost[];
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBlogList({
  category = 'all',
  page = 1,
  limit = 9,
}: UseBlogListOptions = {}): UseBlogListReturn {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (category && category !== 'all') {
          params.set('category', category);
        }

        const res = await fetch(`${API_BASE}/api/blog?${params.toString()}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch posts (${res.status})`);
        }

        const json: BlogListResponse = await res.json();

        if (!cancelled) {
          setPosts(json.data);
          setTotalPages(json.pagination.totalPages);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [category, page, limit, fetchKey]);

  return { posts, totalPages, currentPage: page, isLoading, error, refetch };
}

// ─── Single Post Hook ─────────────────────────────────────────────────────────

interface UseBlogPostReturn {
  post: BlogPost | null;
  isLoading: boolean;
  notFound: boolean;
  error: string | null;
}

export function useBlogPost(slug: string): UseBlogPostReturn {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const res = await fetch(`${API_BASE}/api/blog/${encodeURIComponent(slug)}`);

        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch post (${res.status})`);
        }

        const json: { data: BlogPost } = await res.json();

        if (!cancelled) {
          setPost(json.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { post, isLoading, notFound, error };
}

// ─── Related Posts Hook ───────────────────────────────────────────────────────

interface UseRelatedPostsReturn {
  posts: BlogPost[];
  isLoading: boolean;
}

export function useRelatedPosts(
  category: BlogCategory | undefined,
  excludeSlug: string
): UseRelatedPostsReturn {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!category) return;

    let cancelled = false;

    const fetchRelated = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          category,
          page: '1',
          limit: '4', // fetch 4, then filter out current post to get 3
        });

        const res = await fetch(`${API_BASE}/api/blog?${params.toString()}`);

        if (!res.ok) return;

        const json: BlogListResponse = await res.json();

        if (!cancelled) {
          // Exclude the current article from related posts
          const filtered = json.data
            .filter((p) => p.slug !== excludeSlug)
            .slice(0, 3);
          setPosts(filtered);
        }
      } catch {
        // Silently fail for related posts — non-critical
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRelated();

    return () => {
      cancelled = true;
    };
  }, [category, excludeSlug]);

  return { posts, isLoading };
}