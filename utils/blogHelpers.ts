/**
 * TKAG-26: Balanced Wellness Hub — Blog Utility Functions
 */

import type { BlogCategory, CategoryTab } from '../types/blog';

/**
 * Formats an ISO date string to 'DD Month YYYY' format.
 * e.g. '2025-01-15T00:00:00.000Z' → '15 January 2025'
 */
export function formatBlogDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Maps a category slug to a human-readable label.
 */
export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  skincare_tips: 'Skincare Tips',
  mental_wellness: 'Mental Wellness',
  self_care_guides: 'Self Care Guides',
  brand_story: 'Brand Story',
};

/**
 * Category filter tabs including the 'All' option.
 */
export const CATEGORY_TABS: CategoryTab[] = [
  { label: 'All', value: 'all' },
  { label: 'Skincare Tips', value: 'skincare_tips' },
  { label: 'Mental Wellness', value: 'mental_wellness' },
  { label: 'Self Care Guides', value: 'self_care_guides' },
  { label: 'Brand Story', value: 'brand_story' },
];

/**
 * Returns a CSS class modifier for a given category (for colour coding).
 */
export function getCategoryModifier(category: BlogCategory): string {
  const map: Record<BlogCategory, string> = {
    skincare_tips: 'skincare',
    mental_wellness: 'mental',
    self_care_guides: 'selfcare',
    brand_story: 'brand',
  };
  return map[category] ?? 'default';
}

/**
 * Builds a Twitter/X share URL.
 */
export function buildTwitterShareUrl(url: string, title: string): string {
  const params = new URLSearchParams({ url, text: title });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Builds a WhatsApp share URL.
 */
export function buildWhatsAppShareUrl(url: string, title: string): string {
  const text = encodeURIComponent(`${title} ${url}`);
  return `https://wa.me/?text=${text}`;
}