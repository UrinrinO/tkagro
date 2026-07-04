'use client';
/**
 * TKAG-14: WhyTkaysSection — Static trust-building section with 4 key brand values.
 */

import React from 'react';
import './WhyTkaysSection.css';

interface TrustPoint {
  id: string;
  icon: React.ReactNode;
  heading: string;
  text: string;
}

const TRUST_POINTS: TrustPoint[] = [
  {
    id: 'ingredients',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeLinecap="round" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: 'Traditional African Ingredients',
    text: 'We harness the power of time-honoured botanicals — shea, baobab, moringa, and more — used for generations across the continent.',
  },
  {
    id: 'results',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: 'Visible Results',
    text: 'Our formulas are crafted to deliver real, measurable improvements — brighter, clearer, and healthier-looking skin you can see and feel.',
  },
  {
    id: 'wellness',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: 'Mental Wellness',
    text: 'Skincare is self-care. We design rituals that nurture not just your skin but your overall sense of wellbeing and confidence.',
  },
  {
    id: 'transparency',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: 'Safe & Transparent',
    text: 'No hidden ingredients, no greenwashing. Every product lists its full INCI, and we never use harmful chemicals or misleading claims.',
  },
];

const WhyTkaysSection: React.FC = () => {
  return (
    <section className="why-tkays-section" aria-labelledby="why-tkays-heading">
      <div className="why-tkays-container">
        <div className="why-tkays-intro">
          <p className="why-tkays-eyebrow">Our Promise</p>
          <h2 id="why-tkays-heading" className="section-heading why-tkays-heading">
            Why T.kays?
          </h2>
          <p className="why-tkays-subtext">
            We believe great skincare starts with integrity — in our ingredients,
            our process, and our relationship with you.
          </p>
        </div>

        <ul className="why-tkays-grid" role="list">
          {TRUST_POINTS.map((point) => (
            <li key={point.id} className="why-tkays-card">
              <span className="why-tkays-icon">{point.icon}</span>
              <h3 className="why-tkays-card-heading">{point.heading}</h3>
              <p className="why-tkays-card-text">{point.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default WhyTkaysSection;