/**
 * TKAG-24 — Shared product type used across skin concern pages and product grids.
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  compareAtPrice?: number;
  imageUrl: string;
  images?: string[];
  tagline: string;
  shortDescription?: string;
  concern: string[];
  category: string;
  inStock: boolean;
  stockCount?: number | null;
  isNew?: boolean;
  isBestSeller?: boolean;
  rating?: number;
  reviewCount?: number;
}

export type ProductCategory =
  | 'all'
  | 'face_care'
  | 'body_care'
  | 'black_soap'
  | 'hair_care'
  | 'bundles'
  | 'new_arrivals';

export type SkinConcern =
  | 'acne'
  | 'hyperpigmentation'
  | 'excess_oil'
  | 'dry_skin'
  | 'uneven_tone'
  | 'sensitive';

export type SortOption =
  | 'featured'
  | 'bestseller'
  | 'price_asc'
  | 'price_desc'
  | 'newest';

export interface ProductFilters {
  category: ProductCategory;
  concern: SkinConcern | '';
  sort: SortOption;
  page?: number;
  search?: string;
}