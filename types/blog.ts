/**
 * TKAG-26: Balanced Wellness Hub — Blog Type Definitions
 */

export type BlogCategory =
  | 'skincare_tips'
  | 'mental_wellness'
  | 'self_care_guides'
  | 'brand_story';

export interface BlogAuthor {
  name: string;
  avatar?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // HTML or markdown content
  featuredImage: string;
  category: BlogCategory;
  author: BlogAuthor;
  publishedAt: string; // ISO date string
  published: boolean;
  tags?: string[];
}

export interface BlogListResponse {
  data: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogPostResponse {
  data: BlogPost | null;
}

export interface CategoryTab {
  label: string;
  value: BlogCategory | 'all';
}