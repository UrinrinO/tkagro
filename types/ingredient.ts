/**
 * TKAG-25 — Ingredients transparency page
 * Type definitions for ingredient data
 */

export type IngredientType =
  | 'traditional_african'
  | 'natural'
  | 'organic'
  | 'herbal'
  | 'vegan';

export interface Ingredient {
  id: string;
  name: string;
  origin: string;
  type: IngredientType;
  description: string;
  /** Extended detail shown in modal/expanded view */
  detail?: string;
  benefits?: string[];
}

export interface IngredientsApiResponse {
  success: boolean;
  data: {
    ingredients: Ingredient[];
  };
}

export interface FilterTab {
  label: string;
  value: IngredientType | 'all';
}