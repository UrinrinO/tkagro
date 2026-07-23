'use client';
import React, { useState, useEffect } from 'react';

import avatar1 from '../assets/images/testimonials/skin-acne-dark.jpg';
import avatar2 from '../assets/images/testimonials/skin-hyperpigmentation-chest.jpg';
import avatar3 from '../assets/images/testimonials/skin-back-white.jpg';

interface Review {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  rating: number;
  text: string;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Adaeze O.',
    location: 'Lagos, Nigeria',
    avatar: avatar1,
    rating: 5,
    text: 'The Black Soap cleared my acne within two weeks. I have tried so many products and nothing worked like this. T.kays is the real deal — I will never go back!',
  },
  {
    id: '2',
    name: 'Fatima B.',
    location: 'Abuja, Nigeria',
    avatar: avatar2,
    rating: 5,
    text: 'My hyperpigmentation has faded so much. The brightening butter is incredible. My skin finally feels balanced — not dry, not oily, just healthy and glowing.',
  },
  {
    id: '3',
    name: 'Chidinma E.',
    location: 'Enugu, Nigeria',
    avatar: avatar3,
    rating: 5,
    text: 'I love that everything is natural and made in Nigeria. The quality is so high. My whole family now uses T.kays products. Best investment in my skin ever.',
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const Stars: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={i < count ? '#c9a84c' : 'none'}
        stroke="#c9a84c"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const TestimonialsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);

  useEffect(() => {
    fetch('/api/content/testimonials')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const value = json?.data?.value;
        if (Array.isArray(value) && value.length > 0) setReviews(value);
      })
      .catch(() => {
        // Keep DEFAULT_REVIEWS — non-critical enhancement fetch.
      });
  }, []);

  return (
    <section className="bg-white py-20 px-6 lg:px-16" aria-labelledby="reviews-heading">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-accent tracking-widest uppercase mb-3 block">
            Real Results
          </span>
          <h2 id="reviews-heading" className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col bg-primary-pale rounded-2xl p-7 hover:shadow-md transition-shadow duration-200"
            >
              {/* Stars */}
              <Stars count={review.rating} />

              {/* Quote */}
              <blockquote className="text-brand-dark text-sm leading-relaxed mt-4 mb-6 flex-1">
                "{review.text}"
              </blockquote>

              {/* Author */}
              <footer className="flex items-center gap-3">
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-white"
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-full flex-shrink-0 ring-2 ring-white bg-primary-pale flex items-center justify-center text-sm font-heading font-bold text-primary"
                    aria-hidden="true"
                  >
                    {getInitials(review.name)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-brand-dark">{review.name}</p>
                  <p className="text-xs text-brand-grey">{review.location}</p>
                </div>
              </footer>
            </article>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 pt-10 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <Stars count={5} />
            <span className="text-sm font-semibold text-brand-dark">4.9 / 5</span>
          </div>
          <div className="h-4 w-px bg-gray-200 hidden sm:block" aria-hidden="true" />
          <p className="text-sm text-brand-grey">Based on 200+ verified customer reviews</p>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
