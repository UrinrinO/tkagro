'use client';
/**
 * TKAG-25 — Ingredients transparency page
 * Custom hook for fetching ingredients with optional type filter
 */

import { useState, useEffect, useCallback } from 'react';
import type { Ingredient, IngredientType, IngredientsApiResponse } from '@/types/ingredient';

interface UseIngredientsReturn {
  ingredients: Ingredient[];
  loading: boolean;
  error: string | null;
  refetch: (type?: IngredientType | 'all') => void;
}

const BASE_URL = '' ?? '';

export function useIngredients(type?: IngredientType | 'all'): UseIngredientsReturn {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = useCallback(async (filterType?: IngredientType | 'all') => {
    setLoading(true);
    setError(null);

    try {
      // Build query string — omit param when 'all' is selected
      const params = new URLSearchParams();
      if (filterType && filterType !== 'all') {
        params.set('type', filterType);
      }

      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${BASE_URL}/api/ingredients${query}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ingredients (${response.status})`);
      }

      const json: IngredientsApiResponse = await response.json();

      if (!json.success) {
        throw new Error('API returned unsuccessful response');
      }

      setIngredients(json.data.ingredients);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients(type);
  }, [type, fetchIngredients]);

  return {
    ingredients,
    loading,
    error,
    refetch: fetchIngredients,
  };
}