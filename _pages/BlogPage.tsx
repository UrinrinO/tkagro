'use client';
/**
 * BlogPage — /blog
 * T.kays Journal: editorial posts with category filter and featured article.
 * Full Tailwind styling — no CSS module dependency.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import PageSEO from '@/components/SEO/PageSEO';

import heroBg      from '../assets/images/aesthetics/natural-ingredients-flatlay.jpg';
import blog1       from '../assets/images/aesthetics/ayurveda-herbs-pots.jpg';
import blog2       from '../assets/images/aesthetics/spa-light.jpg';
import blog3       from '../assets/images/aesthetics/herbal-soap-slices.jpg';
import blog4       from '../assets/images/aesthetics/woman-skincare-glow.jpg';
import blog5       from '../assets/images/hair/black-woman-natural.jpg';
import blog6       from '../assets/images/wellness/therapy-feature.jpg';

type Category = 'All' | 'Skincare Tips' | 'Ingredients' | 'Hair Care' | 'Wellness';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  image: string;
  category: Category;
  readTime: string;
  featured?: boolean;
}

const POSTS: BlogPost[] = [
  {
    id: '1',
    title: '5 Botanical Ingredients That Transform Your Skin',
    excerpt: "Discover the plant-based powerhouses behind our most-loved formulas and how they work with your skin's natural biology to deliver lasting results.",
    date: '2026-03-15',
    slug: '5-botanical-ingredients',
    image: blog1,
    category: 'Ingredients',
    readTime: '5 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Building a Minimal Skincare Routine That Actually Works',
    excerpt: "More products doesn't mean better skin. We break down the essential steps for a streamlined, effective routine.",
    date: '2026-02-28',
    slug: 'minimal-skincare-routine',
    image: blog2,
    category: 'Skincare Tips',
    readTime: '4 min read',
  },
  {
    id: '3',
    title: 'The Truth About African Black Soap',
    excerpt: 'Centuries of tradition meet modern science. Learn why T.kays black soap is different — and how to use it correctly.',
    date: '2026-02-10',
    slug: 'african-black-soap',
    image: blog3,
    category: 'Ingredients',
    readTime: '6 min read',
  },
  {
    id: '4',
    title: 'How to Fade Hyperpigmentation Naturally',
    excerpt: "Dark spots, uneven tone, and post-acne marks are common. Here's what actually works — and how long to expect results.",
    date: '2026-01-22',
    slug: 'fade-hyperpigmentation',
    image: blog4,
    category: 'Skincare Tips',
    readTime: '7 min read',
  },
  {
    id: '5',
    title: 'Your Complete Natural Hair Care Guide',
    excerpt: 'From scalp health to moisture retention — build a hair routine rooted in botanicals that your hair will love.',
    date: '2026-01-05',
    slug: 'natural-hair-care-guide',
    image: blog5,
    category: 'Hair Care',
    readTime: '8 min read',
  },
  {
    id: '6',
    title: 'Skincare and Mental Wellness: The Connection',
    excerpt: "At T.kays, balanced wellness goes beyond your skin. Here's how a consistent skincare routine supports mental wellbeing.",
    date: '2025-12-18',
    slug: 'skincare-mental-wellness',
    image: blog6,
    category: 'Wellness',
    readTime: '5 min read',
  },
];

const CATEGORIES: Category[] = ['All', 'Skincare Tips', 'Ingredients', 'Hair Care', 'Wellness'];

const fmt = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const BlogPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filtered = activeCategory === 'All' ? POSTS : POSTS.filter((p) => p.category === activeCategory);
  const [featured, ...rest] = filtered;

  return (
    <>
      <PageSEO
        title="Journal"
        description="Read the T.kays Journal — skincare tips, ingredient spotlights, hair care guides, and wellness stories from a natural skincare brand rooted in African botanicals."
        canonicalPath="/blog"
      />

      <main>
        {/* ── 1. Hero ── */}
        <section className="relative h-[60vh] min-h-[400px] overflow-hidden" aria-label="Blog hero">
          <img
            src={heroBg}
            alt="T.kays natural ingredients"
            className="absolute inset-0 w-full h-full object-cover object-center"
            fetchPriority="high"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/75" />

          {/* Breadcrumb */}
          <nav className="absolute top-24 left-6 lg:left-16 z-20" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-white text-xs font-medium [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true" className="opacity-40">/</li>
              <li className="text-white" aria-current="page">Journal</li>
            </ol>
          </nav>

          <div className="relative z-10 h-full flex flex-col items-center justify-end pb-14 px-6 text-center">
            <span className="text-xs font-bold tracking-widest uppercase text-accent mb-3">T.kays Journal</span>
            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-white leading-tight mb-3">
              Stories &amp; Tips
            </h1>
            <p className="font-accent text-xl text-white/80 italic">
              Insights from the world of botanical wellness
            </p>
          </div>
        </section>

        {/* ── 2. Category filter ── */}
        <div className="sticky top-20 z-30 bg-white border-b border-gray-100 py-4 px-6 lg:px-16" role="navigation" aria-label="Blog categories">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-5 py-2 rounded-full border transition-colors duration-150 ${
                  activeCategory === cat
                    ? 'bg-primary text-white border-primary font-semibold'
                    : 'border-gray-200 text-brand-grey hover:border-primary hover:text-primary'
                }`}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3. Articles ── */}
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-14">
          {filtered.length === 0 ? (
            <p className="text-center text-brand-grey py-20 font-accent italic text-lg">
              No articles in this category yet — check back soon.
            </p>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 no-underline mb-10"
                >
                  <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[400px] overflow-hidden">
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="eager"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="p-8 lg:p-14 flex flex-col justify-center bg-primary-pale">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-primary px-3 py-1.5 rounded-full">
                        {featured.category}
                      </span>
                      <span className="text-xs text-brand-grey">{featured.readTime}</span>
                    </div>
                    <h2 className="font-heading text-2xl lg:text-3xl font-bold text-brand-dark mb-4 leading-snug group-hover:text-primary transition-colors duration-200">
                      {featured.title}
                    </h2>
                    <p className="text-brand-grey text-sm leading-relaxed mb-8">{featured.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <time dateTime={featured.date} className="text-xs text-brand-grey">{fmt(featured.date)}</time>
                      <span className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase group-hover:gap-3 transition-all duration-200">
                        Read Article
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                  {rest.map((post) => (
                    <li key={post.id} role="listitem">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 no-underline h-full"
                      >
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary-pale px-2.5 py-1 rounded-full">
                              {post.category}
                            </span>
                            <span className="text-[10px] text-brand-grey">{post.readTime}</span>
                          </div>
                          <h2 className="font-heading text-base font-semibold text-brand-dark mb-2 leading-snug group-hover:text-primary transition-colors flex-1">
                            {post.title}
                          </h2>
                          <p className="text-xs text-brand-grey leading-relaxed mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                            <time dateTime={post.date} className="text-[10px] text-brand-grey">{fmt(post.date)}</time>
                            <span className="text-primary text-xs font-bold uppercase tracking-wide group-hover:gap-2 inline-flex items-center gap-1 transition-all duration-200">
                              Read
                              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* ── 4. Newsletter CTA ── */}
        <section className="py-20 px-6 lg:px-16 bg-primary" aria-label="Newsletter sign-up">
          <div className="max-w-3xl mx-auto text-center">
            <span className="block text-xs font-bold tracking-widest uppercase text-accent mb-4">Stay Updated</span>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              Get skincare wisdom in your inbox
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-8 max-w-md mx-auto">
              Join 5,000+ skincare lovers. Weekly tips, ingredient spotlights, and early access to T.kays product launches.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-brand-dark font-bold text-sm tracking-wide px-7 py-3.5 rounded-full transition-all duration-200"
              >
                Subscribe Free →
              </Link>
              <Link
                href="/skin-concerns"
                className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white font-medium text-sm px-7 py-3.5 rounded-full transition-all duration-200"
              >
                Shop by Concern
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default BlogPage;
