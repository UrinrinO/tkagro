'use client';
import { useEffect } from 'react';
import { useSEO, type SEOProps } from '@/hooks/useSEO';

type PageSEOProps = SEOProps;

const PageSEO: React.FC<PageSEOProps> = (props) => {
  const { fullTitle, safeDescription, canonicalUrl } = useSEO(props);

  useEffect(() => {
    document.title = fullTitle;
    let desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!desc) {
      desc = document.createElement('meta');
      desc.setAttribute('name', 'description');
      document.head.appendChild(desc);
    }
    desc.setAttribute('content', safeDescription);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  }, [fullTitle, safeDescription, canonicalUrl]);

  return null;
};

export default PageSEO;
