'use client';
/**
 * HomePage — T.kays Agrocosmetics
 * Layout order (per brand brief):
 *   1. Hero
 *   2. Trust Strip
 *   3. Shop by Skin Concern
 *   4. Best Sellers
 *   5. Why T.kays
 *   6. Testimonials
 *   7. Community Feed
 *   8. Newsletter
 */

import React from 'react';
import PageSEO from '@/components/SEO/PageSEO';
import HeroSection from '@/components/HeroSection';
import TrustStrip from '@/components/TrustStrip';
import ConcernGrid from '@/components/ConcernGrid';
import BestSellersSection from '@/components/BestSellersSection';
import WhyTkaysSection from '@/components/WhyTkaysSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CommunityFeed from '@/components/CommunityFeed';
import NewsletterSection from '@/components/NewsletterSection';
import { useHomepageContent } from '@/hooks/useHomepageContent';

const HomePage: React.FC = () => {
  const content = useHomepageContent();
  return (
    <>
      <PageSEO
        title="Home"
        description="T.kays Agrocosmetics — natural, botanical skincare and hair care products crafted for balanced wellness. Shop our full range today."
        canonicalPath="/"
      />

      <HeroSection content={content.hero} />
      <TrustStrip items={content.trustStrip} />
      <ConcernGrid />
      <BestSellersSection />
      <WhyTkaysSection items={content.whyTkays} />
      <TestimonialsSection />

      {/* Community UGC feed */}
      <section
        style={{ padding: '5rem 1.5rem', background: '#fafaf8' }}
        aria-labelledby="community-feed-heading"
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#c9a84c',
                marginBottom: '0.6rem',
              }}
            >
              Community Feed
            </span>
            <h2
              id="community-feed-heading"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                fontWeight: 700,
                color: '#1a1a1a',
                margin: 0,
              }}
            >
              Real people, real results
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                color: '#6b7280',
                marginTop: '0.75rem',
                fontSize: '0.95rem',
              }}
            >
              Tag us <strong>@tkaysagrocosmetics</strong> to be featured
            </p>
          </div>
          <CommunityFeed />
        </div>
      </section>

      <NewsletterSection content={content.newsletter} />
    </>
  );
};

export default HomePage;
