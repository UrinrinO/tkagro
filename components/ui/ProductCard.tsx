'use client';
/**
 * TKAG-16: ProductCard component matching brand design spec
 * Reusable card for displaying product information in shop/catalog views.
 */

import React, { useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { CartContext } from "../../context/CartContext";
import styles from "./ProductCard.module.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  /** Optional badge flags — e.g. "NEW" | "BESTSELLER" */
  badge?: "NEW" | "BESTSELLER";
  /** Category slug list — "new_arrivals" triggers the New badge */
  categories?: string[];
  currency?: string;
}

export interface ProductCardProps {
  product: Product;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determines whether the product should show the "New" badge.
 * Triggered by badge === "NEW" OR the presence of "new_arrivals" in categories.
 */
function isNew(product: Product): boolean {
  return (
    product.badge === "NEW" ||
    (product.categories?.includes("new_arrivals") ?? false)
  );
}

function isBestseller(product: Product): boolean {
  return product.badge === "BESTSELLER";
}

function formatPrice(price: number, currency = "GHS"): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const router = useRouter();
  const cartContext = useContext(CartContext);
  const [added, setAdded] = useState(false);

  // Navigate to product detail page when the card body is clicked.
  const handleCardClick = useCallback(() => {
    router.push(`/shop/${product.slug}`);
  }, [router, product.slug]);

  // Prevent card navigation when interacting with the button.
  const handleButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (!cartContext) {
        console.warn("ProductCard: CartContext is not available.");
        return;
      }

      cartContext.addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
      });

      // Show brief "Added ✓" confirmation for 1.5 s
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    },
    [cartContext, product]
  );

  const showNew = isNew(product);
  const showBestseller = isBestseller(product);

  return (
    <article
      className={[styles.card, className].filter(Boolean).join(" ")}
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      aria-label={`View ${product.name}`}
      // Allow keyboard navigation
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* ── Image container ── */}
      <div className={styles.imageWrapper}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className={styles.image}
          loading="lazy"
          draggable={false}
        />

        {/* Badges — positioned top-right, stacked if both present (edge case) */}
        <div className={styles.badgeStack}>
          {showNew && (
            <span className={`${styles.badge} ${styles.badgeNew}`}>New</span>
          )}
          {showBestseller && (
            <span className={`${styles.badge} ${styles.badgeBestseller}`}>
              Bestseller
            </span>
          )}
        </div>
      </div>

      {/* ── Card body ── */}
      <div className={styles.body}>
        {/* Category pill */}
        <span className={styles.categoryTag}>{product.category}</span>

        {/* Product name */}
        <h3 className={styles.name}>{product.name}</h3>

        {/* Short description */}
        <p className={styles.description}>{product.description}</p>

        {/* Footer: price + CTA */}
        <div className={styles.footer}>
          <span className={styles.price}>
            {formatPrice(product.price, product.currency)}
          </span>

          <button
            type="button"
            className={`${styles.addToCartBtn} ${added ? styles.addedState : ""}`}
            onClick={handleButtonClick}
            aria-label={added ? "Added to cart" : `Add ${product.name} to cart`}
            disabled={added}
          >
            {added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;