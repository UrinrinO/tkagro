'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageSEO from '@/components/SEO/PageSEO';

import heroImg           from '../assets/images/aesthetics/diverse-hands-tones.jpg';
import imgAcne           from '../assets/images/testimonials/acne-result.jpg';
import imgHyperpig       from '../assets/images/testimonials/progress-hyperpigmentation-glowing.jpg';
import imgOil            from '../assets/images/aesthetics/face-herbal.jpg';
import imgDry            from '../assets/images/aesthetics/beauty-soft.jpg';
import imgUneven         from '../assets/images/aesthetics/face-skin.jpg';
import imgSensitive      from '../assets/images/testimonials/sensitivity-testimonial.jpg';
import imgHair           from '../assets/images/hair/black-woman-natural.jpg';

const LOCAL_IMAGES: Record<string, string> = {
  acne: imgAcne,
  hyperpigmentation: imgHyperpig,
  excess_oil: imgOil,
  dry_skin: imgDry,
  dryness: imgDry,
  'dry-skin': imgDry,
  uneven_tone: imgUneven,
  sensitive: imgSensitive,
  sensitivity: imgSensitive,
  'hair-care': imgHair,
  'hair-scalp': imgHair,
};

const DEFAULT_IMAGE = imgDry;

const API_URL = '';

interface Concern {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  imageUrl: string;
  icon: string;
}

const SkinConcernsIndexPage: React.FC = () => {
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/concerns`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setConcerns(json.data.concerns); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageSEO
        title="Shop by Skin Concern"
        description="Find the right T.kays Agrocosmetics products for your skin. Browse targeted botanical solutions for acne, hyperpigmentation, dryness, sensitivity, and more."
        canonicalPath="/skin-concerns"
      />

      <main>
        {/* Hero */}
        <section className="relative h-[60vh] min-h-[400px] overflow-hidden" aria-label="Skin concerns hero">
          <img
            src={heroImg}
            alt="Diverse hands and skin tones — T.kays skincare for everyone"
            className="absolute inset-0 w-full h-full object-cover object-center"
            fetchpriority="high"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />

          <nav className="absolute top-24 left-6 lg:left-16 z-10" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-white/70 text-xs font-medium">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true" className="opacity-40">/</li>
              <li className="text-white" aria-current="page">Skin Concerns</li>
            </ol>
          </nav>

          <div className="relative z-10 h-full flex flex-col items-center justify-end pb-14 px-6 text-center">
            <span className="text-xs font-bold tracking-widest uppercase text-accent mb-3">
              Personalised Skincare
            </span>
            <h1 className="font-heading text-5xl lg:text-7xl font-bold text-white leading-tight mb-3">
              Find Your Match
            </h1>
            <p className="font-accent text-xl lg:text-2xl text-white/80 italic">
              Botanically-powered formulas for every skin story
            </p>
          </div>
        </section>

        {/* Concern grid */}
        <section className="py-16 px-6 lg:px-16 bg-white" aria-label="Skin concern categories">
          <div className="max-w-7xl mx-auto">

            {loading && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="aspect-[3/4] rounded-3xl bg-gray-100 animate-pulse" />
                ))}
              </ul>
            )}

            {!loading && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                {concerns.map((concern) => {
                  const image = concern.imageUrl || LOCAL_IMAGES[concern.slug] || DEFAULT_IMAGE;
                  return (
                    <li key={concern.id} role="listitem">
                      <Link
                        href={`/skin-concerns/${concern.slug}`}
                        className="group relative flex items-end overflow-hidden rounded-3xl aspect-[3/4]"
                        aria-label={`Shop products for ${concern.name}`}
                      >
                        <img
                          src={image}
                          alt={concern.name}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="relative z-10 w-full p-6">
                          <span className="inline-block text-xl mb-2" aria-hidden="true">
                            {concern.icon}
                          </span>
                          <h2 className="font-heading text-xl font-bold text-white leading-tight mb-1">
                            {concern.name}
                          </h2>
                          {concern.shortDescription && (
                            <p className="text-white/70 text-sm leading-snug mb-4">
                              {concern.shortDescription}
                            </p>
                          )}
                          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-accent">
                            Shop Products
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {!loading && concerns.length === 0 && (
              <p className="text-center text-brand-grey py-16 text-sm">
                No skin concerns have been added yet.
              </p>
            )}
          </div>
        </section>

        {/* Brand Promise */}
        <section className="py-16 px-6 lg:px-16 bg-primary text-center" aria-label="Brand promise">
          <div className="max-w-2xl mx-auto">
            <p className="font-heading text-xl lg:text-2xl font-semibold text-white leading-relaxed">
              All formulas are{' '}
              <span className="italic text-accent">botanically sourced</span>,
              dermatologist-reviewed, and free from harmful chemicals — because
              your skin deserves better.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-brand-dark font-bold text-sm tracking-wide px-7 py-3.5 rounded-full transition-all duration-200"
              >
                Shop All Products
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white font-medium text-sm px-7 py-3.5 rounded-full transition-all duration-200"
              >
                Our Promise
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default SkinConcernsIndexPage;
