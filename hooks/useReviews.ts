'use client';
/**
 * TKAG-27 — Custom hook for fetching paginated, approved reviews from the API.
 */

import { useState, useEffect, useCallback } from 'react';

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;          // 1–5
  comment: string;
  date: string;            // ISO date string
  productName: string;
  productSlug: string;     // used to build PDP link
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  averageRating: number;
}

interface UseReviewsOptions {
  limit?: number;
  productId?: string;
}

interface UseReviewsReturn {
  reviews: Review[];
  averageRating: number;
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

const API_BASE = '' ?? '';

export function useReviews({ limit = 12, productId }: UseReviewsOptions = {}): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(
    async (pageNum: number, append: boolean) => {
      try {
        const params = new URLSearchParams({
          status: 'APPROVED',
          limit: String(limit),
          page: String(pageNum),
        });

        if (productId) {
          params.set('productId', productId);
        }

        const res = await fetch(`${API_BASE}/api/reviews?${params.toString()}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch reviews (${res.status})`);
        }

        const data: ReviewsResponse = await res.json();

        setReviews((prev) => (append ? [...prev, ...data.reviews] : data.reviews));
        setAverageRating(data.averageRating);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
    },
    [limit, productId],
  );

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    fetchReviews(1, false).finally(() => setIsLoading(false));
  }, [fetchReviews]);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    await fetchReviews(nextPage, true);
    setPage(nextPage);
    setIsLoadingMore(false);
  }, [page, fetchReviews]);

  const hasMore = reviews.length < total;

  return { reviews, averageRating, total, isLoading, isLoadingMore, error, hasMore, loadMore };
}