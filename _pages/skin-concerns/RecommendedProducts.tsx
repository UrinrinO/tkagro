'use client';
/**
 * RecommendedProducts.tsx
 * TKAG-9: Filtered product grid component for skin concern pages
 *
 * Filters the product catalogue by skinConcerns tag and renders
 * a responsive 3-column product grid following the brand card pattern.
 */

import React from "react";
import "../../styles/skin-concerns.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  price: number;
  currency: string;
  category: string;
  skinConcerns: string[];
  image: string;
  slug: string;
}

interface RecommendedProductsProps {
  concernTag: string;
  /** Optional pre-filtered product list; if omitted the component uses the
   *  static catalogue defined below. In a real app this would be fetched
   *  from an API or CMS. */
  products?: Product[];
}

// ─── Static catalogue (placeholder — replace with API/CMS fetch) ──────────────

const ALL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Clarifying Clay Mask",
    shortDescription:
      "Deep-cleansing kaolin clay mask that draws out impurities and unclogs pores.",
    price: 28,
    currency: "GHS",
    category: "Skincare",
    skinConcerns: ["acne", "oiliness"],
    image: "/images/products/clarifying-clay-mask.jpg",
    slug: "clarifying-clay-mask",
  },
  {
    id: "2",
    name: "Tea Tree Spot Serum",
    shortDescription:
      "Targeted blemish serum with organic tea tree and neem to calm breakouts fast.",
    price: 35,
    currency: "GHS",
    category: "Skincare",
    skinConcerns: ["acne"],
    image: "/images/products/tea-tree-spot-serum.jpg",
    slug: "tea-tree-spot-serum",
  },
  {
    id: "3",
    name: "Shea Butter Moisture Cream",
    shortDescription:
      "Rich, whipped shea butter cream that restores moisture to dry, flaky skin.",
    price: 32,
    currency: "GHS",
    category: "Skincare",
    skinConcerns: ["dryness"],
    image: "/images/products/shea-butter-moisture-cream.jpg",
    slug: "shea-butter-moisture-cream",
  },
  {
    id: "4",
    name: "Baobab Hydrating Serum",
    shortDescription:
      "Lightweight serum packed with baobab oil and hyaluronic acid for deep hydration.",
    price: 42,
    currency: "GHS",
    category: "Skincare",
    skinConcerns: ["dryness", "aging"],
    image: "/images/products/baobab-hydrating-serum.jpg",
    slug: "baobab-hydrating-serum",
  },
  {
    id: "5",
    name: "Rosehip Renewal Oil",
    shortDescription:
      "Cold-pressed rosehip oil rich in vitamins A and C to visibly reduce fine lines.",
    price: 48,
    currency: "GHS",
    category: "Skincare",
    skinConcerns: ["aging", "hyperpigmentation"],
    image: "/images/products/rosehip-renewal-oil.jpg",
    slug: "rosehip-renewal-oil",
  },
  {
    id: "6",
    name: "Collagen Boost Night Cream",
    shortDescription:
      "Overnight repair cream with moringa and marula to firm and plump mature skin.",
    price: 55,
    currency: "GHS",
    category: "Skincare",
    skinConcerns: ["aging"],
    image: "/images/products/collagen-boost-night-cream.jpg",
    slug: "collagen-boost-night-cream",
  },
  {
    id: "7",
    name: "Oat & Calendula Soothing Lotion",
    shortDescription:
      "Fragrance-free lotion formulated for reactive skin with colloidal oat and calendula.",
    price: 30,
    currency: "GHS",
    category: "Skincare",
    skinConcerns: ["sensitivity"],
    image: "/images/products/oat-calendula-lotion.jpg",
    slug: "oat-calendula-soothing-lotion",
  },
  {
    id: "8",
    name: "Aloe Vera Rescue Gel",
    shortDescription:
      "Pure organic aloe vera gel that instantly soothes redness and irritation.",
    price: 22,
    currency: "GHS",
    category: "Skincare",
    skinConcerns: ["sensitivity", "acne"],
    image: "/images/products/aloe-vera-rescue-gel.jpg",
    slug: "aloe-vera-rescue-gel",
  },
  {
    id: "9",
    name: "Turmeric Brightening Mask",
    shortDescription:
      "Weekly brightening mask with organic turmeric and licorice root to even skin tone.",
    price: 38,
    currency: "GHS",
    category: "Skincare",
    skinConcerns: ["hyperpigmentation"],
    image: "/images/products/turmeric-brightening-mask.jpg",
    slug: "turmeric-brightening-mask",
  },
  {
    id: "10",
    name: "Vitamin C Glow Serum",
    shortDescription:
      "Stabilised vitamin C serum with kojic acid to fade dark spots and boost radiance.",
    price: 50,
    currency: "GHS",
    category: "Skincare",
    skinConcerns: ["hyperpigmentation", "aging"],
    image: "/images/products/vitamin-c-glow-serum.jpg",
    slug: "vitamin-c-glow-serum",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  concernTag,
  products,
}) => {
  const catalogue = products ?? ALL_PRODUCTS;

  // Filter products whose skinConcerns array includes the given tag
  const filtered = catalogue.filter((p) =>
    p.skinConcerns.map((c) => c.toLowerCase()).includes(concernTag.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    // TODO: wire up to CartContext once TKAG-9 backend integration is complete
    console.info(`Add to cart: ${product.name}`);
  };

  if (filtered.length === 0) {
    return (
      <div className="sc-products-grid" role="status">
        <p className="sc-products-empty">
          More products coming soon — check back shortly!
        </p>
      </div>
    );
  }

  return (
    <div
      className="sc-products-grid"
      role="list"
      aria-label={`Products for ${concernTag}`}
    >
      {filtered.map((product) => (
        <article
          key={product.id}
          className="sc-product-card"
          role="listitem"
          aria-label={product.name}
        >
          {/* Product image */}
          <a href={`/products/${product.slug}`} tabIndex={-1} aria-hidden="true">
            <div className="sc-product-card__image-wrapper">
              <img
                src={product.image}
                alt={product.name}
                className="sc-product-card__image"
                loading="lazy"
                width={400}
                height={400}
              />
            </div>
          </a>

          <div className="sc-product-card__body">
            {/* Category chip */}
            <span className="sc-product-card__tag">{product.category}</span>

            {/* Product name */}
            <h3 className="sc-product-card__name">
              <a
                href={`/products/${product.slug}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {product.name}
              </a>
            </h3>

            {/* Short description */}
            <p className="sc-product-card__description">
              {product.shortDescription}
            </p>

            {/* Price + CTA */}
            <div className="sc-product-card__footer">
              <span className="sc-product-card__price">
                {product.currency} {product.price.toFixed(2)}
              </span>
              <button
                className="btn-primary"
                onClick={() => handleAddToCart(product)}
                aria-label={`Add ${product.name} to cart`}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default RecommendedProducts;