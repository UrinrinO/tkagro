'use client';
/**
 * CommunityPage — /community
 * DICE values, before/after results feed, customer stories, referral programme.
 * Full Tailwind styling — no CSS module dependency.
 */

import React, { useState, useCallback, useId } from 'react';
import Link from 'next/link';
import PageSEO from '@/components/SEO/PageSEO';
import CommunityFeed from '@/components/CommunityFeed';

import heroBg      from '../assets/images/aesthetics/skin-wellness-glow.jpg';
import storyImg1   from '../assets/images/testimonials/woman-braids-sunglasses.jpg';
import storyImg2   from '../assets/images/testimonials/woman-smiling-weave.jpg';
import storyImg3   from '../assets/images/testimonials/woman-purple-dress.jpg';
import storyImg4   from '../assets/images/testimonials/man-clover-sweater.jpg';
import storyImg5   from '../assets/images/testimonials/woman-twisted-locs.jpg';
import storyImg6   from '../assets/images/testimonials/couple-curly-smiling.jpg';

/* ── Static data ── */
const CUSTOMER_STORIES = [
  {
    id: 1,
    name: 'Amara O.',
    location: 'London, UK',
    quote: 'T.kays completely transformed my skincare routine. My skin has never felt so balanced and nourished — I get compliments every day!',
    image: storyImg1,
    product: 'Botanical Glow Serum',
    rating: 5,
  },
  {
    id: 2,
    name: 'Priya S.',
    location: 'Birmingham, UK',
    quote: 'I was sceptical about natural products but T.kays proved me wrong. The ingredients are clean, the results are absolutely real.',
    image: storyImg2,
    product: 'Deep Moisture Body Butter',
    rating: 5,
  },
  {
    id: 3,
    name: 'Fatima K.',
    location: 'Manchester, UK',
    quote: 'As someone with sensitive skin, finding T.kays was a game-changer. Gentle, effective, and smells absolutely divine.',
    image: storyImg3,
    product: 'Calming Face Oil',
    rating: 5,
  },
  {
    id: 4,
    name: 'Marcus T.',
    location: 'Leeds, UK',
    quote: "Didn't think skincare was for me until I tried the black soap. My skin has been clear for months — zero breakouts.",
    image: storyImg4,
    product: 'Herbal Black Soap',
    rating: 5,
  },
  {
    id: 5,
    name: 'Zoe M.',
    location: 'Bristol, UK',
    quote: 'The DICE values really resonate with me — I love supporting a brand that genuinely cares about what goes into its products.',
    image: storyImg5,
    product: 'Herbal Hair Mask',
    rating: 5,
  },
  {
    id: 6,
    name: 'Tolu & Kay',
    location: 'Nottingham, UK',
    quote: 'We switched our whole household to T.kays. As a mixed-tone couple, we love that it works beautifully for both of us.',
    image: storyImg6,
    product: 'Full Skincare Set',
    rating: 5,
  },
];

const DICE_VALUES = [
  { letter: 'D', word: 'Diversity',   desc: 'Celebrating every skin tone, background, and identity.', colour: 'bg-primary-pale text-primary' },
  { letter: 'I', word: 'Inclusivity', desc: 'Wellness for every body — no exceptions.', colour: 'bg-accent-pale text-accent' },
  { letter: 'C', word: 'Community',   desc: "More than a brand — a collective committed to each other's wellness.", colour: 'bg-primary-pale text-primary' },
  { letter: 'E', word: 'Equality',    desc: 'Fair pricing, ethical sourcing, equitable representation.', colour: 'bg-accent-pale text-accent' },
];

const REFERRAL_STEPS = [
  { step: 1, icon: '🔗', title: 'Share your link', desc: 'Copy your unique referral link and share it with friends, family, or on social media.' },
  { step: 2, icon: '🛒', title: 'Friend places an order', desc: 'Your friend clicks your link and completes their first T.kays order.' },
  { step: 3, icon: '🎁', title: 'You earn £10 credit', desc: 'Once their order ships, £10 credit is automatically added to your account.' },
];

/* ── Stars ── */
const Stars: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < count ? '#c9a84c' : 'none'} stroke="#c9a84c" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

/* ── Referral section ── */
const ReferralSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [referralUrl] = useState('https://tkaysagrocosmetics.com/ref/DEMO123');
  const inputId = useId();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallback: select the input */
    }
  }, [referralUrl]);

  return (
    <section className="py-20 px-6 lg:px-16 bg-primary-pale" aria-labelledby="referral-heading">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="block text-xs font-bold tracking-widest uppercase text-accent mb-3">Referral Programme</span>
          <h2 id="referral-heading" className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark mb-4">
            Refer a friend, earn <span className="text-primary">£10 off</span> your next order
          </h2>
          <p className="text-brand-grey max-w-md mx-auto">
            Love T.kays? Share the love and get rewarded every time a friend places their first order.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {REFERRAL_STEPS.map(({ step, icon, title, desc }) => (
            <div key={step} className="bg-white rounded-3xl p-8 text-center shadow-sm relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                Step {step}
              </span>
              <div className="text-4xl mb-4 mt-2" aria-hidden="true">{icon}</div>
              <h3 className="font-heading text-lg font-bold text-brand-dark mb-2">{title}</h3>
              <p className="text-brand-grey text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Referral link */}
        <div className="bg-white rounded-3xl p-8 shadow-sm max-w-xl mx-auto text-center">
          <p className="font-heading text-lg font-semibold text-brand-dark mb-1">Your referral link</p>
          <p className="text-brand-grey text-sm mb-5">Sign in to activate your unique link and start earning</p>
          <div className="flex gap-2">
            <label htmlFor={inputId} className="sr-only">Referral link</label>
            <input
              id={inputId}
              type="text"
              readOnly
              value={referralUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand-dark bg-gray-50 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors duration-200 whitespace-nowrap"
              aria-live="polite"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <div className="mt-5">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 border border-primary text-primary font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-primary hover:text-white transition-all duration-200"
            >
              Sign in to get your link
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Main page ── */
const CommunityPage: React.FC = () => {
  return (
    <>
      <PageSEO
        title="Community"
        description="Join the T.kays Agrocosmetics community — real results, customer stories, referral rewards, and a collective commitment to balanced wellness for all."
        canonicalPath="/community"
      />

      <main>
        {/* ── 1. Hero ── */}
        <section className="relative h-[60vh] min-h-[400px] overflow-hidden" aria-label="Community hero">
          <img
            src={heroBg}
            alt="T.kays community — glowing skin"
            className="absolute inset-0 w-full h-full object-cover object-center"
            fetchPriority="high"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/75" />

          {/* Breadcrumb */}
          <nav className="absolute top-24 left-6 lg:left-16 z-20" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-white text-xs font-medium [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true" className="opacity-40">/</li>
              <li className="text-white" aria-current="page">Community</li>
            </ol>
          </nav>

          <div className="relative z-10 h-full flex flex-col items-center justify-end pb-14 px-6 text-center">
            <span className="text-xs font-bold tracking-widest uppercase text-accent mb-3">Our Community</span>
            <h1 className="font-heading text-5xl lg:text-7xl font-bold text-white leading-tight mb-4">
              Wellness, Together
            </h1>
            <p className="font-accent text-xl lg:text-2xl text-white/80 italic max-w-xl">
              Real people. Real results. One community.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <a
                href="https://www.instagram.com/tkaysagrocosmetics"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-brand-dark font-bold text-sm tracking-wide px-7 py-3.5 rounded-full transition-all duration-200"
              >
                Follow on Instagram
              </a>
              <a
                href="https://www.tiktok.com/@tkaysagrocosmetics"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white font-medium text-sm px-7 py-3.5 rounded-full transition-all duration-200"
              >
                Follow on TikTok
              </a>
            </div>
          </div>
        </section>

        {/* ── 2. DICE values ── */}
        <section className="py-20 px-6 lg:px-16 bg-white" aria-labelledby="dice-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="block text-xs font-bold tracking-widest uppercase text-accent mb-3">What We Stand For</span>
              <h2 id="dice-heading" className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark">
                The DICE Values
              </h2>
              <p className="text-brand-grey mt-3 max-w-md mx-auto">
                More than a brand promise — a way of doing business and building community.
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {DICE_VALUES.map(({ letter, word, desc, colour }) => (
                <article key={letter} className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 text-center">
                  <span className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${colour} font-heading font-bold text-2xl mx-auto mb-4`} aria-hidden="true">
                    {letter}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-brand-dark mb-2">{word}</h3>
                  <p className="text-brand-grey text-sm leading-relaxed">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Before/After results feed ── */}
        <section className="py-20 px-6 lg:px-16 bg-brand-light" aria-labelledby="feed-heading">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="block text-xs font-bold tracking-widest uppercase text-accent mb-3">Community Feed</span>
              <h2 id="feed-heading" className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark">
                Real People. Real Results.
              </h2>
              <p className="text-brand-grey mt-3 max-w-md mx-auto">
                Drag the slider to see transformations from our community. Tag us{' '}
                <span className="font-semibold text-primary">@tkaysagrocosmetics</span> to be featured.
              </p>
            </div>
            <CommunityFeed />
          </div>
        </section>

        {/* ── 4. Customer stories ── */}
        <section className="py-20 px-6 lg:px-16 bg-white" aria-labelledby="stories-heading">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="block text-xs font-bold tracking-widest uppercase text-accent mb-3">Customer Stories</span>
              <h2 id="stories-heading" className="font-heading text-3xl lg:text-4xl font-bold text-brand-dark">
                Wellness journeys, shared
              </h2>
              <p className="text-brand-grey mt-3 max-w-md mx-auto">
                Hear from members of our community who have made T.kays part of their daily ritual.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CUSTOMER_STORIES.map((story) => (
                <article
                  key={story.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  aria-label={`Customer story from ${story.name}`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={story.image}
                      alt={`${story.name}`}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="p-6">
                    <Stars count={story.rating} />
                    <blockquote className="mt-3 mb-4">
                      <p className="text-brand-grey text-sm leading-relaxed italic">
                        "{story.quote}"
                      </p>
                    </blockquote>
                    <footer>
                      <p className="font-heading font-semibold text-brand-dark text-sm">{story.name}</p>
                      <p className="text-brand-grey text-xs mt-0.5">{story.location}</p>
                      <p className="text-accent text-xs font-medium mt-1">Using: {story.product}</p>
                    </footer>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Referral programme ── */}
        <ReferralSection />

        {/* ── 6. CTA ── */}
        <section className="py-24 px-6 lg:px-16 bg-primary" aria-label="Join community CTA">
          <div className="max-w-3xl mx-auto text-center">
            <span className="font-accent text-7xl text-accent/30 leading-none block mb-4" aria-hidden="true">"</span>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Balanced Wellness
            </h2>
            <p className="text-white/70 text-base lg:text-lg leading-relaxed mb-10">
              When you care for yourself holistically — inside and out — you unlock a state of balance that radiates from within. That's the T.kays promise.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-brand-dark font-bold text-sm tracking-wide px-7 py-3.5 rounded-full transition-all duration-200"
              >
                Shop Now
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white font-medium text-sm px-7 py-3.5 rounded-full transition-all duration-200"
              >
                Our Story
              </Link>
            </div>
            <div className="w-16 h-px bg-accent mx-auto mt-10" aria-hidden="true" />
            <p className="font-accent italic text-accent text-lg mt-6">— T.kays Agrocosmetics</p>
          </div>
        </section>
      </main>
    </>
  );
};

export default CommunityPage;
