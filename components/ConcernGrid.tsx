'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import imgHyperpigmentation from '../assets/images/testimonials/progress-hyperpigmentation-glowing.jpg';
import imgAcne from '../assets/images/testimonials/acne-result.jpg';
import imgDryness from '../assets/images/aesthetics/beauty-soft.jpg';
import imgAntiAging from '../assets/images/aesthetics/face-skin.jpg';
import imgSensitivity from '../assets/images/testimonials/sensitivity-testimonial.jpg';
import imgHair from '../assets/images/hair/black-woman-natural.jpg';

const LOCAL_IMAGES: Record<string, string> = {
  hyperpigmentation: imgHyperpigmentation,
  'acne': imgAcne,
  'acne-blemishes': imgAcne,
  dryness: imgDryness,
  'dry-skin': imgDryness,
  'anti-aging': imgAntiAging,
  'anti-ageing': imgAntiAging,
  sensitivity: imgSensitivity,
  sensitive: imgSensitivity,
  'hair-care': imgHair,
  'hair-scalp': imgHair,
};

const DEFAULT_IMAGE = imgDryness;

const API_URL = '';

interface Concern {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  imageUrl: string;
  icon: string;
}

const ConcernGrid: React.FC = () => {
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
    <section className="py-20 px-6 lg:px-16 bg-brand-light" aria-labelledby="concern-heading">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <span className="block text-xs font-bold tracking-widest uppercase text-accent mb-3">
            Find Your Match
          </span>
          <h2
            id="concern-heading"
            className="font-heading text-3xl lg:text-4xl font-bold text-primary"
          >
            Shop by Skin Concern
          </h2>
          <p className="mt-3 text-brand-grey text-sm max-w-md mx-auto">
            Every formula is rooted in botanical science — find the products made for your skin.
          </p>
        </div>

        {loading && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="aspect-[4/5] rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </ul>
        )}

        {!loading && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list">
            {concerns.map((concern) => {
              const image = concern.imageUrl || LOCAL_IMAGES[concern.slug] || DEFAULT_IMAGE;
              return (
                <li key={concern.id} role="listitem">
                  <Link
                    href={`/skin-concerns/${concern.slug}`}
                    className="group relative flex items-end overflow-hidden rounded-2xl aspect-[4/5]"
                    aria-label={`Shop for ${concern.name}`}
                  >
                    <img
                      src={image}
                      alt={concern.name}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="relative z-10 w-full p-5 flex items-end justify-between">
                      <div>
                        <h3 className="font-heading text-lg font-semibold text-white leading-tight">
                          {concern.name}
                        </h3>
                        {concern.shortDescription && (
                          <p className="text-white/70 text-xs mt-1 leading-snug max-w-48">
                            {concern.shortDescription}
                          </p>
                        )}
                      </div>
                      <span className="flex-shrink-0 ml-3 text-accent text-xl transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && concerns.length === 0 && (
          <p className="text-center text-brand-grey py-10 text-sm">
            No concerns added yet — add them in the admin panel.
          </p>
        )}
      </div>
    </section>
  );
};

export default ConcernGrid;
