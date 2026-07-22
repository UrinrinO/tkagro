'use client';
import { useState, useEffect } from 'react';

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaUrl: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
}

export interface TrustItem {
  id: string;
  icon: string;
  text: string;
}

export interface WhyItem {
  id: string;
  heading: string;
  text: string;
}

export interface NewsletterContent {
  heading: string;
  subtext: string;
  placeholder: string;
  buttonText: string;
}

export interface HomepageContent {
  hero?: Partial<HeroContent>;
  trustStrip?: TrustItem[];
  whyTkays?: WhyItem[];
  newsletter?: Partial<NewsletterContent>;
}

export function useHomepageContent(): HomepageContent {
  const [content, setContent] = useState<HomepageContent>({});

  useEffect(() => {
    fetch('/api/content?keys=homepage.hero,homepage.trust_strip,homepage.why_tkays,homepage.newsletter')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const data = json?.data;
        if (!data) return;
        setContent({
          hero: data['homepage.hero'],
          trustStrip: data['homepage.trust_strip'],
          whyTkays: data['homepage.why_tkays'],
          newsletter: data['homepage.newsletter'],
        });
      })
      .catch(() => {
        // Keep defaults — this is a non-critical enhancement fetch for a
        // marketing page, not something that should block or error it.
      });
  }, []);

  return content;
}
