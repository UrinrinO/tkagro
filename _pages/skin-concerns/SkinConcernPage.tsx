'use client';
/**
 * SkinConcernPage.tsx
 * TKAG-9: Generic layout component shared by all individual concern pages.
 *
 * Accepts all concern-specific content as props so each concern page
 * is a thin wrapper — keeping the layout DRY and easy to maintain.
 */

import React from "react";
import SkinConcernHero from "./SkinConcernHero";
import RecommendedProducts from "./RecommendedProducts";
import "../../styles/skin-concerns.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Ingredient {
  name: string;
  description: string;
}

export interface SkinConcernPageProps {
  /** SEO */
  pageTitle: string;
  metaDescription: string;
  ogImage?: string;

  /** Hero */
  heroTitle: string;
  heroDescription: string;
  heroBackgroundImage?: string;

  /** Educational section */
  educationHeading: string;
  educationParagraphs: string[];

  /** Ingredients */
  ingredients: Ingredient[];

  /** Products */
  concernTag: string;

  /** Breadcrumb label */
  concernLabel: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SkinConcernPage: React.FC<SkinConcernPageProps> = ({
  pageTitle,
  metaDescription,
  ogImage,
  heroTitle,
  heroDescription,
  heroBackgroundImage,
  educationHeading,
  educationParagraphs,
  ingredients,
  concernTag,
  concernLabel,
}) => {
  // Update document title on mount (Astro/SSR would handle this via <head>)
  React.useEffect(() => {
    document.title = pageTitle;

    // Update meta description
    let metaDesc = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = metaDescription;

    // Open Graph tags
    const ogTags: Record<string, string> = {
      "og:title": pageTitle,
      "og:description": metaDescription,
      "og:type": "website",
      ...(ogImage ? { "og:image": ogImage } : {}),
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector<HTMLMetaElement>(
        `meta[property="${property}"]`
      );
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    });
  }, [pageTitle, metaDescription, ogImage]);

  return (
    <main>
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="sc-breadcrumb sc-container">
        <a href="/">Home</a>
        <span className="sc-breadcrumb__separator" aria-hidden="true">
          /
        </span>
        <a href="/skin-concerns">Skin Concerns</a>
        <span className="sc-breadcrumb__separator" aria-hidden="true">
          /
        </span>
        <span aria-current="page">{concernLabel}</span>
      </div>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <SkinConcernHero
        title={heroTitle}
        description={heroDescription}
        backgroundImage={heroBackgroundImage}
      />

      {/* ── Educational Section ─────────────────────────────────────────────── */}
      <section className="sc-section" aria-labelledby="education-heading">
        <div className="sc-container">
          <h2 id="education-heading" className="sc-section__heading">
            {educationHeading}
          </h2>
          <div className="sc-education__body">
            {educationParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Ingredients Section ─────────────────────────────────────────── */}
      <section
        className="sc-section"
        style={{ backgroundColor: "var(--color-light-grey)" }}
        aria-labelledby="ingredients-heading"
      >
        <div className="sc-container">
          <h2 id="ingredients-heading" className="sc-section__heading">
            Key Botanical Ingredients
          </h2>
          <div className="sc-ingredients-grid">
            {ingredients.map((ingredient) => (
              <div key={ingredient.name} className="sc-ingredient-card">
                <h3 className="sc-ingredient-card__name">{ingredient.name}</h3>
                <p className="sc-ingredient-card__description">
                  {ingredient.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recommended Products Section ────────────────────────────────────── */}
      <section className="sc-section" aria-labelledby="products-heading">
        <div className="sc-container">
          <h2 id="products-heading" className="sc-section__heading">
            Recommended Products for {concernLabel}
          </h2>
          <RecommendedProducts concernTag={concernTag} />
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────────────────── */}
      <section className="sc-cta" aria-labelledby="cta-heading">
        <div className="sc-container">
          <h2 id="cta-heading" className="sc-cta__heading">
            Explore Our Full Range
          </h2>
          <p className="sc-cta__body">
            Discover our complete collection of natural, organic skincare
            products crafted to support every skin type and concern.
          </p>
          <a href="/catalog" className="btn-accent">
            Shop All Products
          </a>
        </div>
      </section>
    </main>
  );
};

export default SkinConcernPage;