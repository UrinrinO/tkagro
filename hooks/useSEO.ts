'use client';
/**
 * TKAG-35 — useSEO hook
 * Centralises SEO metadata construction so every page gets consistent,
 * well-formed tags without duplicating logic.
 */

export interface SEOProps {
  /** Page-specific title — will be suffixed with the brand name. */
  title: string;
  /** Unique meta description, max 160 characters. */
  description: string;
  /** Canonical path (e.g. "/about"). The hook prepends the base URL. */
  canonicalPath: string;
  /** Open Graph image URL — required for product pages. */
  ogImage?: string;
  /** Open Graph type — defaults to "website". */
  ogType?: 'website' | 'article' | 'product';
}

const SITE_NAME = "T.kays Agrocosmetics";
const BASE_URL = "https://www.tkaysagrocosmetics.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.jpg`;

/**
 * Builds a fully-resolved SEO metadata object from the provided props.
 * Consumers pass this to <PageSEO /> or use the values directly.
 */
export function useSEO(props: SEOProps) {
  const { title, description, canonicalPath, ogImage, ogType = 'website' } = props;

  // Enforce 160-char description limit — truncate with ellipsis if needed
  const safeDescription =
    description.length > 160
      ? `${description.slice(0, 157)}…`
      : description;

  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  const resolvedOgImage = ogImage ?? DEFAULT_OG_IMAGE;

  return {
    fullTitle,
    safeDescription,
    canonicalUrl,
    resolvedOgImage,
    ogType,
    siteName: SITE_NAME,
  };
}