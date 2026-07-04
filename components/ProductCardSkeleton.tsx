'use client';
/**
 * TKAG-14: ProductCardSkeleton — Loading placeholder for ProductCard.
 * Matches the visual dimensions of ProductCard to prevent layout shift.
 */

import React from 'react';
import './ProductCardSkeleton.css';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="product-skeleton" aria-hidden="true">
      {/* Image placeholder */}
      <div className="product-skeleton__image skeleton-pulse" />

      {/* Body placeholders */}
      <div className="product-skeleton__body">
        <div className="product-skeleton__line skeleton-pulse" style={{ width: '80%' }} />
        <div className="product-skeleton__line skeleton-pulse" style={{ width: '50%', height: '0.75rem' }} />
        <div className="product-skeleton__line skeleton-pulse" style={{ width: '40%' }} />
        <div className="product-skeleton__btn skeleton-pulse" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;