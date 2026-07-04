'use client';
/**
 * index.tsx — Skin Concerns Hub Page
 * TKAG-9: SEO-optimized skin concern landing pages
 *
 * Lists all five skin concern pages in a 2-column grid with descriptions
 * and links to individual concern pages.
 */

import React from "react";
import "../../styles/skin-concerns.css";

// ─── Concern data ─────────────────────────────────────────────────────────────

const SKIN_CONCERNS = [
  {
    slug: "acne",
    label: "Acne & Breakouts",
    emoji: "🌿",
    description:
      "Struggling with persistent breakouts, blackheads, or oily skin? Our natural, plant-based formulas target the root causes of acne without stripping your skin's protective barrier. Discover gentle yet effective solutions rooted in botanical science.",
  },
  {
    slug: "dryness",
    label: "Dryness & Dehydration",
    emoji: "💧",
    description:
      "Dry, tight, or flaky skin needs deep, lasting moisture — not just a surface fix. Our rich botanical blends lock in hydration and restore your skin's natural lipid barrier, leaving it soft, supple, and comfortable all day long.",
  },
  {
    slug: "aging",
    label: "Aging & Fine Lines",
    emoji: "✨",
    description:
      "Embrace graceful aging with formulas that support your skin's natural renewal process. Packed with antioxidant-rich botanicals and nourishing plant oils, our anti-aging range helps visibly firm, plump, and smooth the appearance of fine lines.",
  },
  {
    slug: "sensitivity",
    label: "Sensitivity & Redness",
    emoji: "🌸",
    description:
      "Reactive skin deserves extra care. Our fragrance-free, hypoallergenic formulations are crafted with the gentlest botanicals to calm irritation, reduce redness, and strengthen your skin's natural defences over time.",
  },
  {
    slug: "hyperpigmentation",
    label: "Hyperpigmentation & Dark Spots",
    emoji: "☀️",
    description:
      "Uneven skin tone, dark spots, and post-blemish marks can be addressed naturally. Our brightening range harnesses the power of vitamin C, turmeric, and other proven botanicals to reveal a more radiant, even complexion.",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

const SkinConcernsHubPage: React.FC = () => {
  // Update document metadata on mount
  React.useEffect(() => {
    document.title = "Skin Concerns | T.kays Agrocosmetics";

    let metaDesc = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content =
      "Explore natural, organic skincare solutions for acne, dryness, aging, sensitivity, and hyperpigmentation. Find the right T.kays Agrocosmetics products for your skin concerns.";
  }, []);

  return (
    <main>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="sc-hub-hero" aria-labelledby="hub-hero-heading">
        <div className="sc-container">
          <h1 id="hub-hero-heading" className="sc-hub-hero__heading">
            Find Solutions for Your Skin Concerns
          </h1>
          <p className="sc-hub-hero__subheading">
            Every skin concern deserves a thoughtful, natural answer. Explore
            our curated guides and discover botanical formulas crafted for your
            unique skin needs.
          </p>
        </div>
      </section>

      {/* ── Concern Grid ───────────────────────────────────────────────────── */}
      <section aria-label="Skin concern categories">
        <div className="sc-container">
          <div className="sc-hub-grid" role="list">
            {SKIN_CONCERNS.map((concern) => (
              <article
                key={concern.slug}
                className="sc-hub-card"
                role="listitem"
                aria-label={concern.label}
              >
                <span
                  className="sc-hub-card__icon"
                  aria-hidden="true"
                  role="img"
                >
                  {concern.emoji}
                </span>
                <h2 className="sc-hub-card__heading">{concern.label}</h2>
                <p className="sc-hub-card__description">{concern.description}</p>
                <a
                  href={`/skin-concerns/${concern.slug}`}
                  className="btn-secondary"
                  aria-label={`Learn more about ${concern.label}`}
                >
                  Learn More
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
      <section className="sc-cta" aria-labelledby="hub-cta-heading">
        <div className="sc-container">
          <h2 id="hub-cta-heading" className="sc-cta__heading">
            Not Sure Where to Start?
          </h2>
          <p className="sc-cta__body">
            Browse our full product catalogue and filter by skin type, concern,
            or ingredient to find your perfect match.
          </p>
          <a href="/catalog" className="btn-accent">
            Shop All Products
          </a>
        </div>
      </section>
    </main>
  );
};

export default SkinConcernsHubPage;