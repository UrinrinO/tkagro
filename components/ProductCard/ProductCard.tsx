'use client';
/**
 * TKAG-24 — Reusable ProductCard component for skin concern product grids.
 */

import React from 'react';
import Link from 'next/link';
import type { Product } from '../../types/product';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;

  return (
    <article className={styles.card}>
      <Link
        href={`/products/${product.slug}`}
        className={styles.imageWrapper}
        aria-label={`View ${product.name}`}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />
        {hasDiscount && (
          <span className={styles.saleBadge} aria-label="On sale">
            Sale
          </span>
        )}
        {!product.inStock && (
          <span className={styles.outOfStockBadge}>Out of Stock</span>
        )}
      </Link>

      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className={styles.tagline}>{product.tagline}</p>

        <div className={styles.footer}>
          <div className={styles.pricing} aria-label="Price">
            {hasDiscount ? (
              <>
                <span className={styles.salePrice}>
                  GH₵{product.salePrice!.toFixed(2)}
                </span>
                <span className={styles.originalPrice}>
                  GH₵{product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className={styles.price}>GH₵{product.price.toFixed(2)}</span>
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            className={styles.ctaButton}
            aria-label={`Shop ${product.name}`}
          >
            Shop Now
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;