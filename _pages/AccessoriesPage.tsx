'use client';
/**
 * AccessoriesPage — T.kays Agrocosmetics
 * Accessories & Gifts category page
 *
 * Sections:
 *   1. Hero — full-bleed image, centered heading
 *   2. 3-column category cards
 *   3. Featured items — 4-product grid
 *   4. Gift section — dark green banner
 *   5. CTA — back to catalog
 */

import React from 'react';
import Link from 'next/link';
import PageSEO from '@/components/SEO/PageSEO';

// Hero
import heroImg from '../assets/images/product-mockups/tote-boardwalk.png';

// Category card images
import giftSetImg from '../assets/images/product-mockups/tkays-gift-box.png';
import toteBagImg from '../assets/images/product-mockups/tkays-tote-bag.png';
import essentialsImg from '../assets/images/product-mockups/minimal-display-modern.png';

// Featured item images
import giftBoxWatchImg from '../assets/images/product-mockups/gift-box-watch.png';
import toteBoardwalkImg from '../assets/images/product-mockups/tote-boardwalk.png';
import boxRocksImg from '../assets/images/product-mockups/box-rocks-pinecone.png';
import deliveryBoxImg from '../assets/images/product-mockups/tkays-delivery-box.png';

// ─── Data ─────────────────────────────────────────────────────────────────────

const categoryCards = [
  {
    label: 'Gift Sets',
    description:
      'Beautifully curated sets of our best-loved products — the perfect gift for any occasion.',
    img: giftSetImg,
    alt: 'T.kays Agrocosmetics gift box tied with ribbon',
    href: '/catalog',
  },
  {
    label: 'Tote Bags',
    description:
      'Our signature canvas tote — carry your wellness ritual in style wherever you go.',
    img: toteBagImg,
    alt: 'T.kays branded tote bag',
    href: '/catalog',
  },
  {
    label: 'Brand Essentials',
    description:
      'Branded packaging, unboxing sets, and display pieces that make every delivery a moment.',
    img: essentialsImg,
    alt: 'Minimal modern display of T.kays brand essentials',
    href: '/catalog',
  },
];

const featuredItems = [
  {
    name: 'Gift Box Set',
    concern: 'Perfect Gift',
    price: '£45.00',
    img: giftBoxWatchImg,
    alt: 'Elegant gift box set presented alongside a watch — premium gifting',
  },
  {
    name: 'Signature Tote Bag',
    concern: 'Everyday Essential',
    price: '£18.00',
    img: toteBoardwalkImg,
    alt: 'T.kays tote bag resting on a boardwalk in natural light',
  },
  {
    name: 'Unboxing Set',
    concern: 'Unboxing Experience',
    price: '£35.00',
    img: boxRocksImg,
    alt: 'Branded box styled with rocks and pine cone in a nature setting',
  },
  {
    name: 'Branded Box',
    concern: 'Branded Packaging',
    price: '£12.00',
    img: deliveryBoxImg,
    alt: 'T.kays branded delivery box ready for dispatch',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const AccessoriesPage: React.FC = () => {
  return (
    <>
      <PageSEO
        title="Accessories"
        description="Shop T.kays Agrocosmetics accessories and gift sets — signature tote bags, curated gift boxes, branded packaging, and essentials that complete your natural wellness ritual."
        canonicalPath="/accessories"
      />

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section
        className="relative h-[60vh] min-h-[400px] overflow-hidden"
        aria-label="Accessories and Gifts hero"
      >
        <img
          src={heroImg}
          alt="T.kays branded tote bag carried along a sunlit boardwalk"
          className="absolute inset-0 w-full h-full object-cover object-center"
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/75" />

        {/* Breadcrumb */}
        <nav className="absolute top-24 left-6 lg:left-16 z-10" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-white/70 text-xs font-medium">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li aria-hidden="true" className="opacity-40">/</li>
            <li className="text-white" aria-current="page">Accessories &amp; Gifts</li>
          </ol>
        </nav>

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 px-6 text-center">
          <span className="inline-block text-accent font-body text-xs font-bold tracking-[0.18em] uppercase mb-4">
            Accessories &amp; Gifts
          </span>
          <h1 className="font-heading text-white text-5xl sm:text-6xl md:text-7xl leading-[1.1] mb-4">
            Complete Your Ritual
          </h1>
          <p className="font-accent italic text-accent text-xl sm:text-2xl">
            From gift sets to branded essentials
          </p>
        </div>
      </section>

      {/* ── 2. 3-column category cards ───────────────────────────────────── */}
      <section
        className="py-20 px-6 bg-white"
        aria-labelledby="acc-categories-heading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block font-body text-accent text-xs font-bold tracking-[0.18em] uppercase mb-3">
              Browse Categories
            </span>
            <h2
              id="acc-categories-heading"
              className="font-heading text-brand-dark text-4xl sm:text-5xl"
            >
              Shop by Type
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categoryCards.map(({ label, description, img, alt, href }) => (
              <div
                key={label}
                className="group flex flex-col bg-brand-light rounded-sm overflow-hidden"
              >
                {/* image */}
                <div className="relative aspect-square overflow-hidden bg-accent-pale">
                  <img
                    src={img}
                    alt={alt}
                    className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                {/* text + cta */}
                <div className="flex flex-col flex-1 p-6">
                  <h3 className="font-heading text-brand-dark text-2xl mb-3">{label}</h3>
                  <p className="font-body text-brand-grey text-sm leading-relaxed flex-1">
                    {description}
                  </p>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 mt-5 font-body text-xs font-bold tracking-[0.14em] uppercase text-primary hover:text-primary-light transition-colors duration-200"
                    aria-label={`Shop ${label}`}
                  >
                    Shop Now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Featured items ────────────────────────────────────────────── */}
      <section
        className="py-20 px-6 bg-brand-light"
        aria-labelledby="acc-featured-heading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block font-body text-accent text-xs font-bold tracking-[0.18em] uppercase mb-3">
              Popular Picks
            </span>
            <h2
              id="acc-featured-heading"
              className="font-heading text-brand-dark text-4xl sm:text-5xl"
            >
              Featured Items
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            {featuredItems.map(({ name, concern, price, img, alt }) => (
              <article
                key={name}
                className="group flex flex-col"
                aria-label={`${name} — ${price}`}
              >
                {/* image tile */}
                <div className="relative bg-accent-pale rounded-sm overflow-hidden aspect-square mb-4">
                  <img
                    src={img}
                    alt={alt}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 p-4"
                    loading="lazy"
                  />
                </div>
                {/* concern label */}
                <span className="font-body text-accent text-[10px] font-bold tracking-[0.16em] uppercase mb-1">
                  {concern}
                </span>
                {/* name */}
                <h3 className="font-heading text-brand-dark text-lg leading-snug mb-2">{name}</h3>
                {/* price + CTA */}
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-body text-brand-dark font-semibold text-base">{price}</span>
                  <button
                    type="button"
                    className="font-body text-xs font-bold tracking-wide uppercase bg-primary text-white px-4 py-2 hover:bg-primary-light transition-colors duration-200"
                    aria-label={`Add ${name} to cart`}
                  >
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Gift section ──────────────────────────────────────────────── */}
      <section
        className="bg-primary py-24 px-6 text-center"
        aria-labelledby="gift-section-heading"
      >
        <div className="max-w-3xl mx-auto">
          <span className="inline-block font-body text-accent text-xs font-bold tracking-[0.18em] uppercase mb-4">
            Gifting Made Simple
          </span>
          <h2
            id="gift-section-heading"
            className="font-heading text-white text-4xl sm:text-5xl md:text-6xl mb-6"
          >
            Give the Gift of Wellness
          </h2>
          <p className="font-body text-white/70 text-base leading-relaxed mb-10 max-w-xl mx-auto">
            Every gift set arrives in our signature branded box with complimentary gift wrapping.
            Add a personalised message at checkout and we'll make it unforgettable.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/catalog"
              className="inline-block font-body font-bold text-sm tracking-wide uppercase bg-accent text-white px-8 py-4 hover:bg-accent-light transition-colors duration-200"
            >
              Shop Gift Sets
            </Link>
            <Link
              href="/catalog"
              className="inline-block font-body font-bold text-sm tracking-wide uppercase border border-white/50 text-white px-8 py-4 hover:bg-white/10 transition-colors duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. CTA ───────────────────────────────────────────────────────── */}
      <section
        className="bg-accent-pale py-20 px-6 text-center"
        aria-labelledby="acc-cta-heading"
      >
        <div className="max-w-2xl mx-auto">
          <span className="inline-block font-body text-accent text-xs font-bold tracking-[0.18em] uppercase mb-4">
            Explore Everything
          </span>
          <h2
            id="acc-cta-heading"
            className="font-heading text-brand-dark text-4xl sm:text-5xl mb-5"
          >
            Back to the full collection
          </h2>
          <p className="font-body text-brand-grey text-base leading-relaxed mb-8">
            Browse all skincare, hair care, and accessories in one place — your complete
            natural wellness destination.
          </p>
          <Link
            href="/catalog"
            className="inline-block font-body font-bold text-sm tracking-wide uppercase bg-primary text-white px-8 py-4 hover:bg-primary-light transition-colors duration-200"
          >
            Browse All Products
          </Link>
        </div>
      </section>
    </>
  );
};

export default AccessoriesPage;
