'use client';
import React from 'react';
import Link from 'next/link';
import { useProducts } from '../hooks/useProducts';

const BestSellersSection: React.FC = () => {
  const { products, loading } = useProducts({ bestSeller: true, limit: 4 });

  return (
    <section className="py-20 px-6 lg:px-16 bg-white" aria-labelledby="bestsellers-heading">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="block text-xs font-bold tracking-widest uppercase text-accent mb-2">
              Top Picks
            </span>
            <h2
              id="bestsellers-heading"
              className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark"
            >
              Best Sellers
            </h2>
          </div>
          <Link
            href="/catalog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-light transition-colors"
          >
            View all
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-gray-100 mb-4" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </li>
            ))}
          </ul>
        )}

        {!loading && (
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6" role="list">
            {products.map((product) => (
              <li key={product.id} role="listitem">
                <article className="group flex flex-col h-full">
                  <Link
                    href={`/catalog/${product.slug}`}
                    className="relative block overflow-hidden rounded-2xl bg-accent-pale aspect-square mb-4"
                    aria-label={`View ${product.name}`}
                    tabIndex={0}
                  >
                    <span className="absolute top-3 left-3 z-10 text-xs font-semibold bg-primary text-white px-2.5 py-1 rounded-full">
                      Best Seller
                    </span>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-pale flex items-center justify-center">
                        <span className="text-primary/30 text-4xl">🌿</span>
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-col flex-1">
                    {product.shortDescription && (
                      <p className="text-xs text-brand-grey mb-1 line-clamp-1">{product.shortDescription}</p>
                    )}
                    <h3 className="font-heading text-base font-semibold text-brand-dark leading-tight mb-3 flex-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-dark">£{product.price.toFixed(2)}</span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-primary border border-primary/30 hover:bg-primary hover:text-white hover:border-primary px-3 py-1.5 rounded-full transition-all duration-200"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        {!loading && products.length === 0 && (
          <p className="text-center text-brand-grey py-10 text-sm">
            No bestsellers yet — mark products as Best Seller in the admin.
          </p>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/catalog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            View all products →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellersSection;
