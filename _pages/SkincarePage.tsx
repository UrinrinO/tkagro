'use client';
/**
 * SkincarePage — T.kays Agrocosmetics
 * Botanical Skincare category page
 *
 * Sections:
 *   1. Hero — full-bleed image, gradient overlay, serif heading
 *   2. Intro strip — 3 brand pillars
 *   3. Category cards — Face Care / Body Care
 *   4. Featured products — 4 product cards
 *   5. Ingredient spotlight — 4 key botanicals on dark green
 *   6. CTA banner — skin quiz prompt
 */

import React from 'react';
import Link from 'next/link';
import PageSEO from '@/components/SEO/PageSEO';
import { useProducts } from '@/hooks/useProducts';

// Hero
import heroImg from '../assets/images/aesthetics/beauty-shadow-face.jpg';

// Category cards
import faceCareImg from '../assets/images/aesthetics/face-herbal.jpg';
import bodyCareImg from '../assets/images/aesthetics/body-butter-jars.jpg';


// ─── SVG icon components ──────────────────────────────────────────────────────

const LeafIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const DropIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const CircleSparkIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const pillars = [
  {
    icon: LeafIcon,
    title: 'Vegan Formulas',
    body: 'Every product is 100% plant-based — free from animal-derived ingredients and never tested on animals.',
  },
  {
    icon: CircleSparkIcon,
    title: 'Skin-type Matched',
    body: 'Formulas tailored to oily, dry, combination, and sensitive skin so your routine always fits.',
  },
  {
    icon: DropIcon,
    title: 'Botanical Actives',
    body: 'We harness the proven potency of African and global botanicals — shea, moringa, baobab, and more.',
  },
];


const ingredients = [
  {
    emoji: '🌱',
    name: 'Shea Butter',
    description: 'A deeply nourishing emollient that locks in moisture and soothes irritated skin.',
  },
  {
    emoji: '🌿',
    name: 'Baobab Oil',
    description: 'Rich in omega fatty acids, it improves elasticity and repairs the skin barrier.',
  },
  {
    emoji: '🍃',
    name: 'Moringa',
    description: 'Packed with antioxidants, moringa fights free radicals and brightens uneven tone.',
  },
  {
    emoji: '✨',
    name: 'Turmeric',
    description: 'A time-honoured anti-inflammatory that calms redness and promotes a natural glow.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SkincarePage: React.FC = () => {
  const { products: featuredProducts, loading: productsLoading } = useProducts({ category: 'skincare', limit: 4 });

  return (
    <>
      <PageSEO
        title="Skincare"
        description="Explore T.kays Agrocosmetics natural botanical skincare range — serums, face creams, oils, and cleansers rooted in nature and backed by science for healthy, glowing skin."
        canonicalPath="/skincare"
      />

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section
        className="relative h-[60vh] min-h-[400px] overflow-hidden"
        aria-label="Botanical Skincare hero"
      >
        <img
          src={heroImg}
          alt="Close-up of a glowing face in soft shadow, emphasising skin texture"
          className="absolute inset-0 w-full h-full object-cover object-center"
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/75" />

        {/* Breadcrumb */}
        <nav className="absolute top-24 left-6 lg:left-16 z-10" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-white/70 text-xs font-medium">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li aria-hidden="true" className="opacity-40">/</li>
            <li className="text-white" aria-current="page">Skincare &amp; Body</li>
          </ol>
        </nav>

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 px-6 text-center">
          <span className="inline-block text-accent font-body text-xs font-bold tracking-[0.18em] uppercase mb-4">
            Skincare &amp; Body
          </span>
          <h1 className="font-heading text-white text-5xl sm:text-6xl md:text-7xl leading-[1.1] mb-4">
            Botanical Skincare
          </h1>
          <p className="font-accent italic text-accent text-xl sm:text-2xl">
            Rooted in nature, backed by science
          </p>
        </div>
      </section>

      {/* ── 2. Intro strip ───────────────────────────────────────────────── */}
      <section
        className="bg-white py-16 px-6"
        aria-labelledby="pillars-heading"
      >
        <span id="pillars-heading" className="sr-only">
          Our skincare commitments
        </span>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col items-center text-center gap-4">
              <span className="w-12 h-12 rounded-full bg-primary-pale flex items-center justify-center text-primary">
                <Icon className="w-6 h-6" />
              </span>
              <h2 className="font-heading text-brand-dark text-xl">{title}</h2>
              <p className="font-body text-brand-grey text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Category cards ────────────────────────────────────────────── */}
      <section
        className="py-16 px-6 bg-brand-light"
        aria-labelledby="category-cards-heading"
      >
        <div className="max-w-6xl mx-auto">
          <h2
            id="category-cards-heading"
            className="font-heading text-brand-dark text-4xl text-center mb-12"
          >
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Face Care */}
            <Link
              href="/catalog"
              className="group relative h-[480px] overflow-hidden rounded-sm block"
              aria-label="Shop Face Care products"
            >
              <img
                src={faceCareImg}
                alt="Herbal ingredients beside skincare jar — Face Care collection"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
                <div>
                  <p className="font-body text-accent text-xs font-bold tracking-[0.15em] uppercase mb-2">
                    Face Care
                  </p>
                  <h3 className="font-heading text-white text-3xl mb-2">Nourish Your Face</h3>
                  <p className="font-body text-white/70 text-sm leading-relaxed max-w-xs">
                    Serums, moisturisers, oils, and cleansers crafted for African and melanin-rich skin.
                  </p>
                </div>
                <span className="ml-4 flex-shrink-0 w-11 h-11 rounded-full border border-white/50 flex items-center justify-center text-white transition-colors group-hover:bg-accent group-hover:border-accent">
                  <ArrowRightIcon className="w-5 h-5" />
                </span>
              </div>
            </Link>

            {/* Body Care */}
            <Link
              href="/catalog"
              className="group relative h-[480px] overflow-hidden rounded-sm block"
              aria-label="Shop Body Care products"
            >
              <img
                src={bodyCareImg}
                alt="Arrangement of body butter jars — Body Care collection"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
                <div>
                  <p className="font-body text-accent text-xs font-bold tracking-[0.15em] uppercase mb-2">
                    Body Care
                  </p>
                  <h3 className="font-heading text-white text-3xl mb-2">Ritual-worthy Body Care</h3>
                  <p className="font-body text-white/70 text-sm leading-relaxed max-w-xs">
                    Body butters, scrubs, and lotions that hydrate deeply and leave skin satin-smooth.
                  </p>
                </div>
                <span className="ml-4 flex-shrink-0 w-11 h-11 rounded-full border border-white/50 flex items-center justify-center text-white transition-colors group-hover:bg-accent group-hover:border-accent">
                  <ArrowRightIcon className="w-5 h-5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. Featured products ─────────────────────────────────────────── */}
      <section
        className="py-20 px-6 bg-white"
        aria-labelledby="featured-products-heading"
      >
        <div className="max-w-6xl mx-auto">
          {/* section header */}
          <div className="text-center mb-14">
            <span className="inline-block font-body text-accent text-xs font-bold tracking-[0.18em] uppercase mb-3">
              Bestsellers
            </span>
            <h2
              id="featured-products-heading"
              className="font-heading text-brand-dark text-4xl sm:text-5xl"
            >
              Featured Products
            </h2>
          </div>

          {productsLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] rounded-sm bg-gray-100 mb-4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}
          {!productsLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
              {featuredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group flex flex-col"
                  aria-label={`${product.name} — £${product.price.toFixed(2)}`}
                >
                  <div className="relative bg-accent-pale rounded-sm overflow-hidden aspect-[3/4] mb-4">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-primary/30 text-4xl">🌿</span>
                      </div>
                    )}
                  </div>
                  <span className="font-body text-accent text-[10px] font-bold tracking-[0.16em] uppercase mb-1">
                    {product.concern?.[0]?.replace(/-/g, ' ') ?? 'Skincare'}
                  </span>
                  <h3 className="font-heading text-brand-dark text-lg leading-snug mb-2">{product.name}</h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-body text-brand-dark font-semibold text-base">£{product.price.toFixed(2)}</span>
                    <button
                      type="button"
                      className="font-body text-xs font-bold tracking-wide uppercase bg-primary text-white px-4 py-2 hover:bg-primary-light transition-colors duration-200"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. Ingredient spotlight ──────────────────────────────────────── */}
      <section
        className="bg-primary py-20 px-6"
        aria-labelledby="ingredients-heading"
      >
        <div className="max-w-5xl mx-auto">
          {/* header */}
          <div className="text-center mb-14">
            <span className="inline-block font-body text-accent text-xs font-bold tracking-[0.18em] uppercase mb-3">
              What's Inside
            </span>
            <h2
              id="ingredients-heading"
              className="font-heading text-white text-4xl sm:text-5xl"
            >
              Key Botanicals
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {ingredients.map(({ emoji, name, description }) => (
              <div key={name} className="flex flex-col items-center text-center gap-3">
                <span className="text-4xl" role="img" aria-label={name}>
                  {emoji}
                </span>
                <h3 className="font-heading text-white text-xl">{name}</h3>
                <p className="font-body text-white/70 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CTA banner ────────────────────────────────────────────────── */}
      <section
        className="bg-accent-pale py-20 px-6 text-center"
        aria-labelledby="skincare-cta-heading"
      >
        <div className="max-w-2xl mx-auto">
          <span className="inline-block font-body text-accent text-xs font-bold tracking-[0.18em] uppercase mb-4">
            Personalised for You
          </span>
          <h2
            id="skincare-cta-heading"
            className="font-heading text-brand-dark text-4xl sm:text-5xl mb-5"
          >
            Find your perfect routine
          </h2>
          <p className="font-body text-brand-grey text-base leading-relaxed mb-8">
            Not sure where to start? Our skin quiz matches you with the right products for your
            unique skin type and concerns in under two minutes.
          </p>
          <Link
            href="/skin-concerns"
            className="inline-block font-body font-bold text-sm tracking-wide uppercase bg-primary text-white px-8 py-4 hover:bg-primary-light transition-colors duration-200"
          >
            Take our skin quiz
          </Link>
        </div>
      </section>
    </>
  );
};

export default SkincarePage;
