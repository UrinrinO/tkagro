'use client';
/**
 * AboutPage — /about
 * Brand story, founder, vision & mission, VHON/DICE values, Balanced Wellness.
 * Full Tailwind styling — no CSS module dependency.
 */

import React from 'react';
import Link from 'next/link';
import PageSEO from '@/components/SEO/PageSEO';

import heroBanner   from '../assets/images/aesthetics/beauty-glow.jpg';
import founderPhoto from '../assets/images/founder-pictures/founder-tijesunimi-professional.jpg';

/* ── Static content ── */
const BRAND_STORY = {
  intro: `T.kays Agrocosmetics was born from a deeply personal journey — one rooted in the belief that nature holds the answers to our most pressing wellness needs. Founded by Tijesunimi Olakojo, the brand emerged from years of lived experience navigating skin challenges, mental wellness, and the search for products that truly honour the body.`,
  body: `What began as a personal quest to find clean, effective, plant-based solutions grew into a mission to share those discoveries with the world. T.kays Agrocosmetics bridges the gap between traditional botanical wisdom and modern cosmetic science, crafting formulations that are as kind to the earth as they are to your skin.

Every product in our range is thoughtfully developed with a commitment to transparency, sustainability, and inclusivity. We believe that wellness is not a luxury — it is a right. And we are here to make it accessible to everyone, regardless of skin tone, background, or budget.

Our name carries meaning: "Agro" speaks to our deep connection with the land and its botanical gifts; "Cosmetics" reflects our dedication to beauty that goes beyond the surface. Together, they represent our promise — products grown from nature, crafted with care, and designed for real people living real lives.`,
};

const FOUNDER_BIO = `Tijesunimi Olakojo is the founder and formulator behind T.kays Agrocosmetics. A passionate advocate for natural wellness, she combines her background in botanical science with a deep commitment to inclusivity and community. Driven by her own skin journey and a desire to create products that work for every skin tone and type, Tijesunimi built T.kays from the ground up — formulating each product with intention, integrity, and love.`;

const BALANCED_WELLNESS = `"Balanced Wellness" is more than a tagline — it is our philosophy. True wellness is not one-dimensional. It encompasses the health of your skin, the clarity of your mind, the nourishment of your body, and the harmony of your spirit. At T.kays Agrocosmetics, we believe that when you care for yourself holistically — inside and out — you unlock a state of balance that radiates from within.`;

const VHON = [
  { letter: 'V', word: 'Vegan',   desc: 'No animal-derived ingredients. Ever. Our formulations are 100% cruelty-free and kind to all living beings.' },
  { letter: 'H', word: 'Herbal',  desc: 'Rooted in botanical tradition, we harness the potency of herbs and plant extracts proven over centuries.' },
  { letter: 'O', word: 'Organic', desc: 'We prioritise certified organic ingredients, free from synthetic pesticides and harmful chemicals.' },
  { letter: 'N', word: 'Natural', desc: 'Sourced from nature, not a laboratory. Clean, recognisable ingredients you can trust.' },
];

const DICE = [
  { letter: 'D', word: 'Diversity',   desc: 'We celebrate every skin tone, background, and identity. Our products are formulated for all.' },
  { letter: 'I', word: 'Inclusivity', desc: 'Wellness should be accessible to everyone. We design with every body in mind.' },
  { letter: 'C', word: 'Community',   desc: "We are more than a brand — a collective of people committed to supporting one another's wellness journeys." },
  { letter: 'E', word: 'Equality',    desc: 'Fair pricing, ethical sourcing, and equitable representation are non-negotiable pillars of everything we do.' },
];

const AboutPage: React.FC = () => {
  return (
    <>
      <PageSEO
        title="About Us"
        description="Learn the story behind T.kays Agrocosmetics — botanical skincare rooted in African heritage, founded by Tijesunimi Olakojo with a mission of balanced wellness for all."
        canonicalPath="/about"
      />

      <main>
        {/* ── 1. Hero ── */}
        <section className="relative h-[60vh] min-h-[400px] overflow-hidden" aria-label="About hero">
          <img
            src={heroBanner}
            alt="T.kays Agrocosmetics — lush botanical backdrop"
            className="absolute inset-0 w-full h-full object-cover object-center"
            fetchpriority="high"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />

          {/* Breadcrumb */}
          <nav className="absolute top-24 left-6 lg:left-16 z-10" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-white/70 text-xs font-medium">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true" className="opacity-40">/</li>
              <li className="text-white" aria-current="page">About Us</li>
            </ol>
          </nav>

          <div className="relative z-10 h-full flex flex-col items-center justify-end pb-14 px-6 text-center">
            <span className="text-xs font-bold tracking-widest uppercase text-accent mb-3">
              T.kays Agrocosmetics
            </span>
            <h1 className="font-heading text-5xl lg:text-7xl font-bold text-white leading-tight mb-3">
              Our Story
            </h1>
            <p className="font-accent text-xl lg:text-2xl text-white/80 italic">
              Balanced Wellness
            </p>
          </div>
        </section>

        {/* ── 2. Brand Story ── */}
        <section className="py-20 px-6 lg:px-16 bg-white" aria-labelledby="brand-story-heading">
          <div className="max-w-3xl mx-auto">
            <span className="block text-xs font-bold tracking-widest uppercase text-accent mb-4">Our Story</span>
            <h2 id="brand-story-heading" className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark mb-8">
              Where Nature Meets Purpose
            </h2>
            <p className="text-brand-grey text-lg leading-relaxed mb-6 font-medium text-brand-dark/80">
              {BRAND_STORY.intro}
            </p>
            {BRAND_STORY.body.split('\n\n').map((para, i) => (
              <p key={i} className="text-brand-grey leading-relaxed mb-5">
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* ── 3. Founder ── */}
        <section className="py-20 px-6 lg:px-16 bg-primary-pale" aria-labelledby="founder-heading">
          <div className="max-w-6xl mx-auto">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
              {/* Image */}
              <div className="relative mb-10 lg:mb-0">
                <div className="aspect-[3/4] rounded-3xl overflow-hidden">
                  <img
                    src={founderPhoto}
                    alt="Tijesunimi Olakojo — Founder of T.kays Agrocosmetics"
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.style.display = 'none';
                      const parent = el.parentElement;
                      if (parent) {
                        const fb = document.createElement('div');
                        fb.className = 'w-full h-full bg-primary/20 flex items-center justify-center text-5xl font-heading font-bold text-primary';
                        fb.textContent = 'TO';
                        parent.appendChild(fb);
                      }
                    }}
                  />
                </div>
                {/* Floating accent card */}
                <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl p-5 shadow-xl max-w-48">
                  <p className="font-accent text-sm italic text-brand-grey">Founder & Formulator</p>
                  <p className="font-heading text-base font-bold text-brand-dark mt-1">Tijesunimi Olakojo</p>
                </div>
              </div>

              {/* Text */}
              <div>
                <span className="block text-xs font-bold tracking-widest uppercase text-accent mb-4">Meet the Founder</span>
                <h2 id="founder-heading" className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark mb-6">
                  Tijesunimi Olakojo
                </h2>
                <p className="text-brand-grey leading-relaxed mb-8">{FOUNDER_BIO}</p>
                <div className="border-l-4 border-accent pl-5">
                  <p className="font-heading text-xl italic text-primary font-semibold">Tijesunimi</p>
                  <p className="text-xs text-brand-grey mt-1 tracking-wide">Founder & Formulator, T.kays Agrocosmetics</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Vision & Mission ── */}
        <section className="py-20 px-6 lg:px-16 bg-white" aria-labelledby="vm-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="block text-xs font-bold tracking-widest uppercase text-accent mb-3">What Drives Us</span>
              <h2 id="vm-heading" className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark">
                Vision &amp; Mission
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article className="bg-primary rounded-3xl p-10 flex flex-col">
                <div className="text-4xl mb-5" aria-hidden="true">🌱</div>
                <h3 className="font-heading text-xl font-bold text-white mb-4">Our Vision</h3>
                <p className="text-white/75 leading-relaxed flex-1">
                  To be the leading natural and organic agrocosmetics brand that empowers individuals to embrace holistic wellness — nurturing the mind, body, and spirit through the healing power of nature.
                </p>
              </article>
              <article className="bg-accent-pale border border-accent/20 rounded-3xl p-10 flex flex-col">
                <div className="text-4xl mb-5" aria-hidden="true">🎯</div>
                <h3 className="font-heading text-xl font-bold text-brand-dark mb-4">Our Mission</h3>
                <p className="text-brand-grey leading-relaxed flex-1">
                  To create vegan, herbal, organic, and natural skincare and wellness products that are inclusive, accessible, and rooted in botanical integrity — while championing diversity, community, and mental wellness at every touchpoint.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── 5. Brand Values ── */}
        <section className="py-20 px-6 lg:px-16 bg-brand-light" aria-labelledby="values-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="block text-xs font-bold tracking-widest uppercase text-accent mb-3">What We Stand For</span>
              <h2 id="values-heading" className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark">
                Our Brand Values
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* VHON */}
              <article className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-3xl" aria-hidden="true">🌿</span>
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-primary">VHON</h3>
                    <p className="text-xs text-brand-grey tracking-wide">Our Formulation Promise</p>
                  </div>
                </div>
                <ul className="space-y-5">
                  {VHON.map(({ letter, word, desc }) => (
                    <li key={letter} className="flex gap-4">
                      <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-pale flex items-center justify-center font-heading font-bold text-primary text-sm" aria-hidden="true">
                        {letter}
                      </span>
                      <div>
                        <p className="font-semibold text-brand-dark text-sm mb-0.5">{word}</p>
                        <p className="text-brand-grey text-sm leading-relaxed">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>

              {/* DICE */}
              <article className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-3xl" aria-hidden="true">🤝</span>
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-primary">DICE</h3>
                    <p className="text-xs text-brand-grey tracking-wide">Our Community Values</p>
                  </div>
                </div>
                <ul className="space-y-5">
                  {DICE.map(({ letter, word, desc }) => (
                    <li key={letter} className="flex gap-4">
                      <span className="flex-shrink-0 w-9 h-9 rounded-full bg-accent-pale flex items-center justify-center font-heading font-bold text-accent text-sm" aria-hidden="true">
                        {letter}
                      </span>
                      <div>
                        <p className="font-semibold text-brand-dark text-sm mb-0.5">{word}</p>
                        <p className="text-brand-grey text-sm leading-relaxed">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ── 6. Balanced Wellness pull-quote ── */}
        <section className="py-24 px-6 lg:px-16 bg-primary" aria-labelledby="slogan-heading">
          <div className="max-w-3xl mx-auto text-center">
            <span className="font-accent text-7xl text-accent/30 leading-none block mb-4" aria-hidden="true">"</span>
            <h2 id="slogan-heading" className="font-heading text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
              Balanced Wellness
            </h2>
            <blockquote className="text-white/70 text-base lg:text-lg leading-relaxed mb-10">
              {BALANCED_WELLNESS}
            </blockquote>
            <div className="w-16 h-px bg-accent mx-auto mb-6" aria-hidden="true" />
            <p className="font-accent italic text-accent text-lg">— T.kays Agrocosmetics</p>
          </div>
        </section>
      </main>
    </>
  );
};

export default AboutPage;
