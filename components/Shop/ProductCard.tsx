'use client';
/**
 * TKAG-15: ProductCard component
 * Displays a single product in the shop grid
 */

import React from 'react';
import Link from 'next/link';
import type { Product } from '../../types/product';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

/**
 * Formats a price number to a localised currency string
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(price);
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const hasDiscount =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;

  return (
    <article className={styles.card}>
      <Link
        href={`/shop/${product.slug}`}
        className={styles.imageWrapper}
        aria-label={`View ${product.name}`}
      >
        {/* Badges */}
        <div className={styles.badges}>
          {product.isNew && (
            <span className={`${styles.badge} ${styles.badgeNew}`}>New</span>
          )}
          {product.isBestSeller && (
            <span className={`${styles.badge} ${styles.badgeBestSeller}`}>
              Best Seller
            </span>
          )}
          {hasDiscount && (
            <span className={`${styles.badge} ${styles.badgeSale}`}>
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Product image */}
        <img
          src={product.images[0] ?? '/placeholder-product.jpg'}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className={styles.outOfStockOverlay}>
            <span>Out of Stock</span>
          </div>
        )}
      </Link>

      <div className={styles.body}>
        <Link href={`/shop/${product.slug}`} className={styles.nameLink}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>

        {product.shortDescription && (
          <p className={styles.description}>{product.shortDescription}</p>
        )}

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className={styles.rating} aria-label={`${product.rating} out of 5 stars`}>
            <span className={styles.stars} aria-hidden="true">
              {renderStars(product.rating)}
            </span>
            <span className={styles.reviewCount}>({product.reviewCount})</span>
          </div>
        )}

        {/* Pricing */}
        <div className={styles.pricing}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className={styles.compareAtPrice}>
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        <button
          className={styles.addToCartBtn}
          disabled={!product.inStock}
          aria-label={`Add ${product.name} to cart`}
          // Cart logic will be wired via CartContext in a follow-up ticket
          onClick={(e) => {
            e.preventDefault();
            // TODO: dispatch addToCart action
          }}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </article>
  );
};

/**
 * Renders filled/half/empty star characters based on a 0–5 rating
 */
function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}