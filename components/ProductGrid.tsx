'use client';
/**
 * ProductGrid.tsx
 * TKAG-8: Responsive product grid — 1 column (mobile) → 2 (tablet) → 3 (desktop).
 * Uses CSS Grid with mobile-first media queries defined in the module CSS.
 */

import React from "react";
import styles from "./ProductGrid.module.css";
import ProductCard from "./ProductCard";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: string;
  inStock?: boolean;
}

interface ProductGridProps {
  products: Product[];
  /** Optional heading displayed above the grid */
  heading?: string;
  /** Loading state — renders skeleton cards */
  loading?: boolean;
  /** Number of skeleton cards to show while loading */
  skeletonCount?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  heading,
  loading = false,
  skeletonCount = 6,
}) => {
  if (loading) {
    return (
      <section className={styles.section} aria-busy="true" aria-label="Loading products">
        {heading && <h2 className={styles.heading}>{heading}</h2>}
        <div className={styles.grid}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className={styles.skeleton} aria-hidden="true" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className={styles.section}>
        {heading && <h2 className={styles.heading}>{heading}</h2>}
        <p className={styles.empty}>No products found.</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      {heading && <h2 className={styles.heading}>{heading}</h2>}
      <div className={styles.grid} role="list">
        {products.map((product) => (
          <div key={product.id} role="listitem">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;