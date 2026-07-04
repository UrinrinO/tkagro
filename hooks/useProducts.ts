'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/types/product';

const API_URL = '';

export interface UseProductsOptions {
  category?: string;
  concern?: string;
  sort?: string;
  page?: number;
  limit?: number;
  search?: string;
  bestSeller?: boolean;
}

interface UseProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsState {
  const { category, concern, sort, page = 1, limit = 20, bestSeller } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.set('category', category);
      if (concern) params.set('concern', concern);
      if (sort) params.set('sort', sort);
      if (bestSeller) params.set('bestSeller', 'true');
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);

      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? 'Failed to fetch products');

      setProducts(json.data.products as Product[]);
      setTotal(json.meta?.total ?? json.data.products.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [category, concern, sort, page, limit, bestSeller]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    total,
    isLoading: loading,
    isLoadingMore: false,
    hasMore: false,
    loadMore: () => {},
  };
}
