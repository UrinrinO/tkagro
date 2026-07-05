'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import PageSEO from '@/components/SEO/PageSEO';
import { useProducts } from '@/hooks/useProducts';

/* ── Local hero images (fallbacks if no imageUrl in DB) ── */
import heroAcne      from '../assets/images/testimonials/acne-spots-result.jpg';
import heroHyperpig  from '../assets/images/testimonials/progress-hyperpigmentation-glowing.jpg';
import heroOil       from '../assets/images/aesthetics/face-herbal.jpg';
import heroDry       from '../assets/images/aesthetics/beauty-soft.jpg';
import heroUneven    from '../assets/images/aesthetics/face-skin.jpg';
import heroSensitive from '../assets/images/testimonials/sensitivity-testimonial.jpg';
import heroHair      from '../assets/images/hair/black-woman-natural.jpg';

/* ── Local result images ── */
import resultAcne1      from '../assets/images/testimonials/acne-result.jpg';
import resultAcne2      from '../assets/images/testimonials/honest-acne.jpg';
import resultAcne3      from '../assets/images/testimonials/man-clear-jaw.jpg';
import resultHyper1     from '../assets/images/testimonials/spots-success.jpg';
import resultHyper2     from '../assets/images/testimonials/skin-hyperpigmentation-chest.jpg';
import resultHyper3     from '../assets/images/testimonials/chest-spots-result.jpg';
import resultOil1       from '../assets/images/testimonials/skin-oil-ad.jpg';
import resultOil2       from '../assets/images/aesthetics/face-aesthetic-soft.jpg';
import resultOil3       from '../assets/images/aesthetics/dewy-model.png';
import resultDry1       from '../assets/images/testimonials/smooth-arm-hand.jpg';
import resultDry2       from '../assets/images/testimonials/dryness-result-review.jpg';
import resultDry3       from '../assets/images/testimonials/oiled-feet-pair.jpg';
import resultUneven1    from '../assets/images/testimonials/result-transform.jpg';
import resultUneven2    from '../assets/images/testimonials/smooth-journey.jpg';
import resultUneven3    from '../assets/images/testimonials/glowing-honest.jpg';
import resultSensitive1 from '../assets/images/testimonials/redness-skin-result.jpg';
import resultSensitive2 from '../assets/images/testimonials/sensitivity-testimonial.jpg';
import resultSensitive3 from '../assets/images/testimonials/result-customer.jpg';

const HERO_IMAGES: Record<string, string> = {
  acne: heroAcne,
  hyperpigmentation: heroHyperpig,
  excess_oil: heroOil,
  dry_skin: heroDry,
  dryness: heroDry,
  'dry-skin': heroDry,
  uneven_tone: heroUneven,
  sensitive: heroSensitive,
  sensitivity: heroSensitive,
  'hair-care': heroHair,
  'hair-scalp': heroHair,
};

const RESULT_IMAGES: Record<string, [string, string, string]> = {
  acne:              [resultAcne1,      resultAcne2,      resultAcne3],
  hyperpigmentation: [resultHyper1,     resultHyper2,     resultHyper3],
  excess_oil:        [resultOil1,       resultOil2,       resultOil3],
  dry_skin:          [resultDry1,       resultDry2,       resultDry3],
  dryness:           [resultDry1,       resultDry2,       resultDry3],
  'dry-skin':        [resultDry1,       resultDry2,       resultDry3],
  uneven_tone:       [resultUneven1,    resultUneven2,    resultUneven3],
  sensitive:         [resultSensitive1, resultSensitive2, resultSensitive3],
  sensitivity:       [resultSensitive1, resultSensitive2, resultSensitive3],
};

const API_URL = '';

interface Concern {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  heroDescription: string;
  metaDescription: string;
  imageUrl: string;
  whyItWorks: string[];
  stats: Array<{ value: string; label: string }>;
  icon: string;
}

const SkinConcernDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [concern, setConcern] = useState<Concern | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { products, loading: productsLoading } = useProducts({
    concern: slug,
    limit: 4,
  });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetch(`${API_URL}/api/concerns/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) { setNotFound(true); return; }
        setConcern(json.data.concern);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  if (notFound || !concern || !slug) { router.replace('/skin-concerns'); return null; }

  const heroImg = concern.imageUrl || HERO_IMAGES[slug] || heroDry;
  const results = RESULT_IMAGES[slug];

  return (
    <>
      <PageSEO
        title={`${concern.name} Skincare`}
        description={concern.metaDescription || concern.shortDescription || `Shop T.kays products for ${concern.name}`}
        canonicalPath={`/skin-concerns/${slug}`}
      />

      <main>
        {/* 1. Hero */}
        <section className="relative h-[75vh] min-h-[520px] overflow-hidden" aria-label={`${concern.name} hero`}>
          <img
            src={heroImg}
            alt={concern.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
            fetchPriority="high"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/75" />

          <nav className="absolute top-24 left-6 lg:left-16 z-20" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-white text-xs font-medium [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true" className="opacity-40">/</li>
              <li><Link href="/skin-concerns" className="hover:text-white transition-colors">Skin Concerns</Link></li>
              <li aria-hidden="true" className="opacity-40">/</li>
              <li className="text-white" aria-current="page">{concern.name}</li>
            </ol>
          </nav>

          <div className="relative z-10 h-full flex flex-col items-center justify-end pb-16 px-6 text-center">
            <span className="text-3xl mb-3" aria-hidden="true">{concern.icon}</span>
            <span className="text-xs font-bold tracking-widest uppercase text-accent mb-3">Skin Concern</span>
            <h1 className="font-heading text-5xl lg:text-7xl font-bold text-white leading-tight mb-4">
              {concern.name}
            </h1>
            {concern.heroDescription && (
              <p className="font-accent text-lg lg:text-xl text-white/80 italic max-w-lg">
                {concern.heroDescription}
              </p>
            )}
          </div>
        </section>

        {/* 2. Stats strip */}
        {concern.stats.length > 0 && (
          <section className="bg-primary py-10 px-6 lg:px-16" aria-label="Key stats">
            <div className="max-w-4xl mx-auto">
              <div className={`grid grid-cols-${concern.stats.length} gap-6 text-center`}>
                {concern.stats.map(({ value, label }) => (
                  <div key={label}>
                    <p className="font-heading text-3xl lg:text-4xl font-bold text-accent mb-1">{value}</p>
                    <p className="text-white/70 text-xs lg:text-sm leading-snug">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 3. Products */}
        <section className="py-20 px-6 lg:px-16 bg-white" aria-labelledby="products-heading">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <span className="block text-xs font-bold tracking-widest uppercase text-accent mb-3">Curated For You</span>
              <h2 id="products-heading" className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark">
                Products for {concern.name}
              </h2>
              <p className="text-brand-grey mt-3 max-w-xl mx-auto">
                Botanically-powered formulas selected specifically to address {concern.name.toLowerCase()}.
              </p>
            </div>

            {productsLoading && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square rounded-2xl bg-gray-100 mb-4" />
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {!productsLoading && products.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
                {products.map((product) => {
                  const badge = product.isBestSeller ? 'Best Seller' : product.isNew ? 'New' : null;
                  return (
                    <article key={product.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden bg-primary-pale">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-primary/30 text-4xl">🌿</span>
                          </div>
                        )}
                        {badge && (
                          <span className="absolute top-3 left-3 bg-accent text-brand-dark text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                            {badge}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        {product.shortDescription && (
                          <p className="text-[10px] font-medium text-brand-grey mb-1 line-clamp-1">{product.shortDescription}</p>
                        )}
                        <h3 className="font-heading text-sm font-semibold text-brand-dark leading-snug flex-1 mb-3">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="font-heading text-base font-bold text-primary">£{product.price.toFixed(2)}</span>
                          <Link
                            href={`/catalog/${product.slug}`}
                            className="text-[11px] font-bold uppercase tracking-wide text-accent hover:text-primary transition-colors"
                          >
                            View →
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {!productsLoading && products.length === 0 && (
              <p className="text-center text-brand-grey py-10 text-sm">
                No products tagged for this concern yet.{' '}
                <Link href="/catalog" className="text-primary hover:underline">Browse all products</Link>
              </p>
            )}

            <div className="mt-10 text-center">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm tracking-wide px-8 py-3.5 rounded-full transition-colors duration-200"
              >
                Shop All Products
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Why It Works */}
        {concern.whyItWorks.length > 0 && (
          <section className="py-20 px-6 lg:px-16 bg-brand-light" aria-labelledby="why-heading">
            <div className="max-w-6xl mx-auto">
              <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
                <div>
                  <span className="block text-xs font-bold tracking-widest uppercase text-accent mb-4">Our Approach</span>
                  <h2 id="why-heading" className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark mb-6">
                    Why these formulas work
                  </h2>
                  <p className="text-brand-grey leading-relaxed mb-8">
                    Every ingredient is chosen with botanical science and your skin's long-term health in mind — not just quick fixes.
                  </p>
                  <ul className="space-y-5">
                    {concern.whyItWorks.map((point, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-heading font-bold text-white text-sm" aria-hidden="true">
                          {i + 1}
                        </span>
                        <p className="text-brand-grey text-sm leading-relaxed pt-1">{point}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link href="/about" className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
                      Our ingredient philosophy →
                    </Link>
                  </div>
                </div>

                {results && (
                  <div className="mt-12 lg:mt-0 grid grid-cols-3 gap-3" aria-label="Customer results">
                    {results.map((src, i) => (
                      <div key={i} className={`overflow-hidden rounded-2xl ${i === 0 ? 'row-span-2 col-span-1' : ''}`}>
                        <img
                          src={src}
                          alt={`Real customer result for ${concern.name}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 5. VHON strip */}
        <section className="py-14 px-6 lg:px-16 bg-white border-y border-gray-100" aria-label="Formula promises">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { letter: 'V', word: 'Vegan',   detail: 'No animal-derived ingredients' },
                { letter: 'H', word: 'Herbal',  detail: 'Botanical actives proven over centuries' },
                { letter: 'O', word: 'Organic', detail: 'Certified organic where possible' },
                { letter: 'N', word: 'Natural', detail: 'Clean, recognisable ingredients' },
              ].map(({ letter, word, detail }) => (
                <div key={letter}>
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-pale font-heading font-bold text-primary text-lg mx-auto mb-2" aria-hidden="true">
                    {letter}
                  </span>
                  <p className="font-heading font-semibold text-brand-dark text-sm mb-0.5">{word}</p>
                  <p className="text-brand-grey text-xs leading-snug">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Bottom CTA */}
        <section className="py-24 px-6 lg:px-16 bg-primary" aria-label="Explore more concerns">
          <div className="max-w-3xl mx-auto text-center">
            <span className="font-accent text-6xl text-accent/30 leading-none block mb-4" aria-hidden="true">"</span>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to transform your skin?
            </h2>
            <p className="text-white/70 leading-relaxed mb-10 max-w-lg mx-auto">
              Every T.kays formula is crafted with purpose — clean, botanical, and designed for real results on every skin tone.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-brand-dark font-bold text-sm tracking-wide px-7 py-3.5 rounded-full transition-all duration-200"
              >
                Shop This Range
              </Link>
              <Link
                href="/skin-concerns"
                className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white font-medium text-sm px-7 py-3.5 rounded-full transition-all duration-200"
              >
                ← All Skin Concerns
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default SkinConcernDetailPage;
