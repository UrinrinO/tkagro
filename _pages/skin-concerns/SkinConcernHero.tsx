'use client';
/**
 * SkinConcernHero.tsx
 * TKAG-9: Reusable hero component for skin concern landing pages
 */

import React from "react";
import "../../styles/skin-concerns.css";

interface SkinConcernHeroProps {
  title: string;
  description: string;
  backgroundImage?: string;
}

const SkinConcernHero: React.FC<SkinConcernHeroProps> = ({
  title,
  description,
  backgroundImage,
}) => {
  const hasImage = Boolean(backgroundImage);

  return (
    <section
      className={`sc-hero${hasImage ? " sc-hero--with-image" : ""}`}
      aria-label={`${title} hero section`}
    >
      {/* Background image rendered as <img> for better LCP performance */}
      {hasImage && (
        <>
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="sc-hero__bg-image"
            loading="eager"
          />
          <div className="sc-hero__overlay" aria-hidden="true" />
        </>
      )}

      <div className="sc-hero__content">
        {/* Decorative accent bar above title */}
        <div className="sc-hero__accent-bar" aria-hidden="true" />
        <h1 className="sc-hero__title">{title}</h1>
        <p className="sc-hero__description">{description}</p>
      </div>
    </section>
  );
};

export default SkinConcernHero;