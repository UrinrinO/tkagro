'use client';
/**
 * HairBodyPage — T.kays Agrocosmetics
 * Hair & Body category page
 *
 * Sections:
 *   1. Hero — full-bleed image, left-aligned heading
 *   2. Hair concern cards — 4-column grid
 *   3. Featured products — 4 product cards
 *   4. Ritual section — split layout: image + numbered steps
 *   5. Ingredients strip — 3 botanicals on accent-pale
 *   6. CTA — to catalog
 */

import React from 'react';
import Link from 'next/link';
import PageSEO from '@/components/SEO/PageSEO';
import { useProducts } from '@/hooks/useProducts';

// Hero
import heroImg from '../assets/images/hair/black-woman-natural.jpg';

// Concern card images
import afroDryImg from '../assets/images/hair/afro-dry-hair.jpg';
import dryScalpImg from '../assets/images/hair/dry-flaky-scalp.jpg';
import hairGrowthImg from '../assets/images/hair/smiling-natural-afro.jpg';
import stylingImg from '../assets/images/hair/curly-updo-portrait.jpg';


// Ritual image
import ritualImg from '../assets/images/hair/coconut-hydrating-beauty.jpg';

// ─── Data ─────────────────────────────────────────────────────────────────────

const concernCards = [
  {
    label: 'Dryness & Breakage',
    img: afroDryImg,
    alt: 'Close-up of dry afro hair showing breakage and dryness',
  },
  {
    label: 'Scalp Health',
    img: dryScalpImg,
    alt: 'Close-up of a dry, flaky scalp needing treatment',
  },
  {
    label: 'Hair Growth',
    img: hairGrowthImg,
    alt: 'Smiling woman with a full, healthy natural afro',
  },
  {
    label: 'Styling & Definition',
    img: stylingImg,
    alt: 'Woman with a defined curly updo hairstyle',
  },
];


const ritualSteps = [
  {
    step: '01',
    title: 'Cleanse',
    description:
      'Begin with a gentle herbal shampoo or black soap wash to clear buildup and open the scalp for treatment.',
  },
  {
    step: '02',
    title: 'Nourish',
    description:
      'Apply our deep conditioning mask or scalp serum to replenish moisture, strengthen strands, and stimulate growth.',
  },
  {
    step: '03',
    title: 'Seal',
    description:
      'Lock everything in with our nourishing hair oil or whipped body butter for long-lasting hydration from root to tip.',
  },
];

const ingredientStrip = [
  {
    emoji: '🥥',
    name: 'Coconut Oil',
    description: 'Penetrates the hair shaft to reduce protein loss and add deep lustre.',
  },
  {
    emoji: '🌿',
    name: 'Black Castor Oil',
    description: 'Thickens and strengthens hair while stimulating scalp circulation for growth.',
  },
  {
    emoji: '🌱',
    name: 'Shea Butter',
    description: 'An ultra-rich moisturiser that seals the cuticle and tames frizz naturally.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const HairBodyPage: React.FC = () => {
  const { products: featuredProducts, loading: productsLoading } = useProducts({ category: 'haircare', limit: 4 });

  return (
    <>
      <PageSEO
        title="Hair & Body"
        description="Discover T.kays Agrocosmetics natural hair care and body products — nourishing oils, butters, scalp serums, and deep conditioning treatments crafted from botanical ingredients for every hair type."
        canonicalPath="/hair-body"
      />

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section
        className="relative h-[60vh] min-h-[400px] overflow-hidden"
        aria-label="Hair Care hero"
      >
        <img
          src={heroImg}
          alt="Black woman with beautifully defined natural hair, looking confident"
          className="absolute inset-0 w-full h-full object-cover object-center"
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/75" />

        {/* Breadcrumb */}
        <nav className="absolute top-24 left-6 lg:left-16 z-10" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-white/70 text-xs font-medium">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li aria-hidden="true" className="opacity-40">/</li>
            <li className="text-white" aria-current="page">Hair</li>
          </ol>
        </nav>

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 px-6 text-center">
          <span className="inline-block text-accent font-body text-xs font-bold tracking-[0.18em] uppercase mb-4">
            Natural Hair Care
          </span>
          <h1 className="font-heading text-white text-5xl sm:text-6xl md:text-7xl leading-[1.1] mb-4">
            Hair Care
          </h1>
          <p className="font-accent italic text-accent text-xl sm:text-2xl">
            From root to tip, from scalp to crown
          </p>
        </div>
      </section>

      {/* ── 2. Hair concern cards ────────────────────────────────────────── */}
      <section
        className="py-20 px-6 bg-white"
        aria-labelledby="concerns-heading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block font-body text-accent text-xs font-bold tracking-[0.18em] uppercase mb-3">
              Shop by Concern
            </span>
            <h2
              id="concerns-heading"
              className="font-heading text-brand-dark text-4xl sm:text-5xl"
            >
              What does your hair need?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {concernCards.map(({ label, img, alt }) => (
              <Link
                key={label}
                href="/skin-concerns/hair-care"
                className="group relative h-[340px] sm:h-[420px] overflow-hidden rounded-sm block"
                aria-label={`Shop for ${label}`}
              >
                <img
                  src={img}
                  alt={alt}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-heading text-white text-lg leading-tight">{label}</p>
                  <span className="mt-2 inline-flex items-center gap-1 font-body text-accent text-xs font-bold tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Featured products ─────────────────────────────────────────── */}
      <section
        className="py-20 px-6 bg-brand-light"
        aria-labelledby="hair-featured-heading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block font-body text-accent text-xs font-bold tracking-[0.18em] uppercase mb-3">
              Bestsellers
            </span>
            <h2
              id="hair-featured-heading"
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
                    {product.concern?.[0]?.replace(/-/g, ' ') ?? 'Hair & Body'}
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

      {/* ── 4. Ritual section ────────────────────────────────────────────── */}
      <section
        className="py-20 px-6 bg-white"
        aria-labelledby="ritual-heading"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* left — image */}
          <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-sm">
            <img
              src={ritualImg}
              alt="Coconut oil and natural hair care ingredients laid out beautifully"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>

          {/* right — steps */}
          <div className="flex flex-col gap-10">
            <div>
              <span className="inline-block font-body text-accent text-xs font-bold tracking-[0.18em] uppercase mb-3">
                The Ritual
              </span>
              <h2
                id="ritual-heading"
                className="font-heading text-brand-dark text-4xl sm:text-5xl leading-tight"
              >
                Your three-step routine
              </h2>
            </div>

            {ritualSteps.map(({ step, title, description }) => (
              <div key={step} className="flex gap-6 items-start">
                {/* step number */}
                <span className="font-heading text-primary-pale text-5xl leading-none font-bold select-none flex-shrink-0 w-14">
                  {step}
                </span>
                <div>
                  <h3 className="font-heading text-brand-dark text-2xl mb-2">{title}</h3>
                  <p className="font-body text-brand-grey text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Ingredients strip ─────────────────────────────────────────── */}
      <section
        className="bg-accent-pale py-16 px-6"
        aria-labelledby="hair-ingredients-heading"
      >
        <div className="max-w-5xl mx-auto">
          <h2
            id="hair-ingredients-heading"
            className="font-heading text-brand-dark text-3xl text-center mb-12"
          >
            Powered by Nature
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {ingredientStrip.map(({ emoji, name, description }) => (
              <div key={name} className="flex flex-col items-center text-center gap-3">
                <span className="text-4xl" role="img" aria-label={name}>
                  {emoji}
                </span>
                <h3 className="font-heading text-brand-dark text-xl">{name}</h3>
                <p className="font-body text-brand-grey text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CTA ───────────────────────────────────────────────────────── */}
      <section
        className="bg-white py-20 px-6 text-center"
        aria-labelledby="hair-cta-heading"
      >
        <div className="max-w-2xl mx-auto">
          <span className="inline-block font-body text-accent text-xs font-bold tracking-[0.18em] uppercase mb-4">
            Explore the Full Range
          </span>
          <h2
            id="hair-cta-heading"
            className="font-heading text-brand-dark text-4xl sm:text-5xl mb-5"
          >
            Ready to transform your routine?
          </h2>
          <p className="font-body text-brand-grey text-base leading-relaxed mb-8">
            Browse our complete hair and body collection — every product formulated with
            natural botanicals, free from harsh chemicals.
          </p>
          <Link
            href="/catalog"
            className="inline-block font-body font-bold text-sm tracking-wide uppercase bg-primary text-white px-8 py-4 hover:bg-primary-light transition-colors duration-200"
          >
            Shop All Hair & Body
          </Link>
        </div>
      </section>
    </>
  );
};

export default HairBodyPage;
