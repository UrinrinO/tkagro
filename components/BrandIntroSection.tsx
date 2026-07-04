'use client';
import React from 'react';
import Link from 'next/link';

interface BrandIntroSectionProps {
  productImage: string;
}

const BrandIntroSection: React.FC<BrandIntroSectionProps> = ({ productImage }) => {
  return (
    <section className="bg-white py-20 lg:py-28 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left — text */}
        <div>
          <span className="text-xs font-semibold text-accent tracking-widest uppercase mb-4 block">
            Our Philosophy
          </span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-brand-dark leading-tight mb-6">
            New philosophy<br />of self-care:<br />healthy skin &amp; hair
          </h2>
          <p className="text-brand-grey text-base leading-relaxed mb-4">
            T.kays is about conscious simplicity — effective formulas, thoughtful
            ingredients, and botanical textures designed for real everyday skin.
          </p>
          <p className="text-brand-grey text-base leading-relaxed mb-8">
            We believe skincare should support your skin, not overwhelm it;
            combining ancient African wisdom with a calm, intentional approach
            rooted in nature.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-7 py-3.5 rounded-full hover:bg-primary-light transition-colors duration-200 text-sm"
          >
            More about T.kays →
          </Link>
        </div>

        {/* Right — product image */}
        <div className="relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={productImage}
              alt="T.kays Agrocosmetics product"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {/* Floating badge */}
          <div className="absolute -bottom-4 -left-4 bg-accent text-white px-5 py-3 rounded-2xl shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wide">Balanced Wellness</p>
            <p className="text-lg font-bold leading-tight">Since 2018</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default BrandIntroSection;
