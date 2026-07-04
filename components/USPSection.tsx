'use client';
/**
 * TKAG-3: USPSection component
 * Three-column grid of brand unique selling points.
 * Part of the T.kays Agrocosmetics homepage build.
 */

import React, { useState, useEffect } from 'react';

interface USP {
  id: string;
  icon: string; // SVG path or emoji placeholder
  title: string;
  description: string;
}

const USPS: USP[] = [
  {
    id: 'natural',
    icon: '🌿',
    title: 'Natural Ingredients',
    description: 'Sourced from nature, crafted with care. Every formula starts with honest, plant-based ingredients you can trust.',
  },
  {
    id: 'handmade',
    icon: '🤲',
    title: 'Handmade in Nigeria',
    description: 'Supporting local communities and traditions. Each product is lovingly made by hand, preserving artisanal quality.',
  },
  {
    id: 'cruelty-free',
    icon: '🐇',
    title: 'Cruelty-Free',
    description: 'Never tested on animals, always ethical. We believe beauty should never come at the cost of another living being.',
  },
];

const USPSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sectionStyle: React.CSSProperties = {
    padding: 'var(--space-16) var(--container-pad)',
    backgroundColor: 'var(--color-white)',
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--text-4xl)',
    fontWeight: 'var(--font-bold)',
    color: 'var(--color-dark)',
    textAlign: 'center',
    marginBottom: 'var(--space-12)',
    margin: `0 0 var(--space-12) 0`,
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: 'var(--space-8)',
  };

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'var(--space-8)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--color-accent-pale)',
    border: '1px solid transparent',
    transition: 'border-color 0.2s ease, transform 0.2s ease',
  };

  const iconWrapperStyle: React.CSSProperties = {
    width: '64px',
    height: '64px',
    backgroundColor: 'var(--color-primary-pale)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: `0 auto var(--space-4)`,
    fontSize: '1.75rem',
  };

  const cardHeadingStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--text-xl)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-dark)',
    marginBottom: 'var(--space-2)',
    textAlign: 'center',
    margin: `0 0 var(--space-2) 0`,
  };

  const cardDescStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-grey)',
    textAlign: 'center',
    lineHeight: 'var(--leading-normal)',
    margin: 0,
  };



  return (
    <section style={sectionStyle} aria-labelledby="usp-heading">
      <div style={innerStyle}>
        <h2 id="usp-heading" style={headingStyle}>
          Why Choose T.kays
        </h2>

        <div style={gridStyle} role="list">
          {USPS.map((usp) => (
            <article
              key={usp.id}
              style={cardStyle}
              role="listitem"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  'var(--color-accent)';
                (e.currentTarget as HTMLElement).style.transform =
                  'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  'transparent';
                (e.currentTarget as HTMLElement).style.transform =
                  'translateY(0)';
              }}
            >
              {/* Icon placeholder — replace with SVG icons when available */}
              <div style={iconWrapperStyle} aria-hidden="true">
                {usp.icon}
              </div>

              <h3 style={cardHeadingStyle}>{usp.title}</h3>
              <p style={cardDescStyle}>{usp.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default USPSection;