'use client';
/**
 * ProductCard.tsx
 * TKAG-8: Responsive product card with 1:1 aspect ratio image,
 * mobile-first typography, and 44px minimum touch targets.
 */

import React, { useState } from "react";
import { useCart } from "../hooks/useCart";
import styles from "./ProductCard.module.css";
import type { Product } from "./ProductGrid";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
      });
      // Brief visual feedback
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      setAdding(false);
    }
  };

  const formattedPrice = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(product.price);

  return (
    <article className={styles.card}>
      {/* Product image — 1:1 aspect ratio at all breakpoints */}
      <a
        href={`/products/${product.id}`}
        className={styles.imageLink}
        tabIndex={0}
        aria-label={`View ${product.name}`}
      >
        <div className={styles.imageWrapper}>
          {!imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={styles.image}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            /* Fallback placeholder when image fails to load */
            <div className={styles.imageFallback} aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}

          {/* Out of stock badge */}
          {product.inStock === false && (
            <span className={styles.outOfStockBadge}>Out of Stock</span>
          )}

          {/* Category chip */}
          {product.category && (
            <span className={styles.categoryChip}>{product.category}</span>
          )}
        </div>
      </a>

      {/* Card body */}
      <div className={styles.body}>
        <a href={`/products/${product.id}`} className={styles.nameLink}>
          <h3 className={styles.name}>{product.name}</h3>
        </a>

        <p className={styles.description}>{product.description}</p>

        <div className={styles.footer}>
          <span className={styles.price}>{formattedPrice}</span>

          {/* Add to cart — minimum 44×44px touch target */}
          <button
            className={styles.addToCart}
            onClick={handleAddToCart}
            disabled={adding || product.inStock === false}
            aria-label={`Add ${product.name} to cart`}
            aria-busy={adding}
          >
            {adding ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : (
              "Add to cart"
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;