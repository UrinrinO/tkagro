'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import PageSEO from '@/components/SEO/PageSEO';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';

import heroImg from '../assets/images/aesthetics/tkays-collection.jpg';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Skincare', value: 'skincare' },
  { label: 'Hair Care', value: 'haircare' },
  { label: 'Body', value: 'body' },
  { label: 'Accessories', value: 'accessories' },
];

const CatalogPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('');
  const { products, loading, error } = useProducts({ category: activeCategory || undefined, limit: 50 });
  const { addItem, openDrawer } = useCart();

  return (
    <>
      <PageSEO
        title="Shop"
        description="Browse the full T.kays Agrocosmetics shop — natural skincare, hair care, and wellness products for balanced, healthy living."
        canonicalPath="/shop"
      />

      {/* Page hero */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden" aria-label="Catalog hero">
        <img
          src={heroImg}
          alt="T.kays Agrocosmetics full product collection"
          className="absolute inset-0 w-full h-full object-cover object-center"
          fetchpriority="high"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />

        <nav className="absolute top-24 left-6 lg:left-16 z-10" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-white/70 text-xs font-medium">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li aria-hidden="true" className="opacity-40">/</li>
            <li className="text-white" aria-current="page">Shop</li>
          </ol>
        </nav>

        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-14 px-6 text-center">
          <span className="text-xs font-bold tracking-widest uppercase text-accent mb-3">Our Range</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-bold text-white leading-tight mb-3">
            The Shop
          </h1>
          <p className="font-accent text-xl lg:text-2xl text-white/80 italic">
            Vegan, herbal, organic &amp; natural
          </p>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-16 bg-white" aria-labelledby="catalog-heading">
        <div className="max-w-7xl mx-auto">

          {/* Filter bar */}
          <fieldset className="mb-10" aria-label="Filter products by category">
            <legend className="sr-only">Filter by category</legend>
            <div className="flex flex-wrap gap-2.5" role="group">
              {CATEGORIES.map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveCategory(value)}
                  aria-pressed={activeCategory === value}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeCategory === value
                      ? 'bg-primary text-white'
                      : 'bg-primary-pale text-primary hover:bg-primary hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Loading skeletons */}
          {loading && (
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" aria-busy="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="animate-pulse">
                  <div className="aspect-square rounded-2xl bg-gray-100 mb-4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p className="text-center text-red-500 py-16 text-sm">{error}</p>
          )}

          {/* Product grid */}
          {!loading && !error && (
            <ul
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
              role="list"
              aria-label="Product listing"
            >
              {products.map((product) => {
                const badge = product.isBestSeller ? 'Best Seller' : product.isNew ? 'New' : null;
                const concern = product.concern?.[0] ?? '';

                return (
                  <li key={product.id} role="listitem">
                    <article className="group flex flex-col h-full">
                      <Link
                        href={`/shop/${product.slug}`}
                        className="relative block overflow-hidden rounded-2xl bg-accent-pale aspect-square mb-4"
                        aria-label={`View ${product.name}`}
                      >
                        {badge && (
                          <span className="absolute top-3 left-3 z-10 text-xs font-semibold bg-primary text-white px-2.5 py-1 rounded-full">
                            {badge}
                          </span>
                        )}
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
                        {concern && <p className="text-xs text-accent font-medium mb-0.5 capitalize">{concern.replace(/-/g, ' ')}</p>}
                        <h2 className="font-heading text-base font-semibold text-brand-dark leading-tight mb-3 flex-1">
                          {product.name}
                        </h2>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-brand-dark">£{product.price.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              addItem({ id: product.id, name: product.name, price: product.price, image: product.imageUrl, slug: product.slug, stockCount: product.stockCount ?? null });
                              openDrawer();
                            }}
                            className="text-xs font-semibold text-primary border border-primary/30 hover:bg-primary hover:text-white hover:border-primary px-3 py-1.5 rounded-full transition-all duration-200"
                            aria-label={`Add ${product.name} to cart`}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="text-center text-brand-grey py-16" role="status" aria-live="polite">
              No products found in this category.
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default CatalogPage;
