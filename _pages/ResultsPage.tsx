'use client';
/**
 * TKAG-27 — Results Page
 * Displays before/after gallery, written reviews with star ratings,
 * and a horizontal video testimonials section.
 *
 * Route: /results
 */

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import StarRating from '@/components/ui/StarRating';
import { useReviews } from '@/hooks/useReviews';
import styles from './ResultsPage.module.css';

// ---------------------------------------------------------------------------
// Before & After data — explicit static imports (replaced import.meta.glob)
// ---------------------------------------------------------------------------
import imgAcneBefore   from '../assets/images/testimonials/acne-before.jpg';
import imgAcneAfter    from '../assets/images/testimonials/acne-after.jpg';
import imgBellyBefore  from '../assets/images/testimonials/belly-before.png';
import imgBellyAfter   from '../assets/images/testimonials/belly-after.png';
import imgChestBefore  from '../assets/images/testimonials/chest-before.png';
import imgChestAfter   from '../assets/images/testimonials/chest-after.png';
import imgThighBefore  from '../assets/images/testimonials/thigh-before.png';
import imgThighAfter   from '../assets/images/testimonials/thigh-after.png';
import imgFaceBefore   from '../assets/images/testimonials/tk-face-before.jpg';
import imgFaceAfter    from '../assets/images/testimonials/tk-face--after.jpg';
import imgTjBefore     from '../assets/images/testimonials/tj-before.png';
import imgTjAfter      from '../assets/images/testimonials/tj-after.png';
import imgTexBefore    from '../assets/images/testimonials/thigh-texture-before.png';
import imgTexAfter     from '../assets/images/testimonials/thigh-texture-after.png';
import imgSmoothArm    from '../assets/images/testimonials/smooth-arm-hand.jpg';
import imgDryResult    from '../assets/images/testimonials/dryness-result-review.jpg';
import imgRednessResult from '../assets/images/testimonials/redness-skin-result.jpg';
import imgProgress      from '../assets/images/testimonials/progress-hyperpigmentation-glowing.jpg';
import imgAcneSpots     from '../assets/images/testimonials/acne-spots-result.jpg';
import imgSmoothJourney from '../assets/images/testimonials/smooth-journey.jpg';

const allImageUrls: string[] = [
  imgAcneBefore, imgAcneAfter,
  imgBellyBefore, imgBellyAfter,
  imgChestBefore, imgChestAfter,
  imgThighBefore, imgThighAfter,
  imgFaceBefore, imgFaceAfter,
  imgTjBefore, imgTjAfter,
  imgTexBefore, imgTexAfter,
  imgSmoothArm, imgDryResult,
  imgRednessResult, imgProgress,
  imgAcneSpots, imgSmoothJourney,
];

// Pair images sequentially: [0,1] → pair 1, [2,3] → pair 2, etc.
// If an odd image exists it is ignored.
interface BeforeAfterPair {
  id: number;
  before: string;
  after: string;
  concern: string;
  duration: string;
}

const CONCERNS = [
  'Hyperpigmentation',
  'Acne & Blemishes',
  'Uneven Skin Tone',
  'Dryness & Flaking',
  'Dark Spots',
  'Dullness',
];

const DURATIONS = [
  'After 4 weeks',
  'After 6 weeks',
  'After 8 weeks',
  'After 4 weeks',
  'After 6 weeks',
  'After 8 weeks',
];

// Build at least 6 pairs; fall back to placeholder colours if images are missing
function buildPairs(): BeforeAfterPair[] {
  const pairs: BeforeAfterPair[] = [];
  const imageCount = allImageUrls.length;

  for (let i = 0; i < 6; i++) {
    pairs.push({
      id: i,
      before: allImageUrls[i * 2] ?? '',
      after: allImageUrls[i * 2 + 1] ?? allImageUrls[i * 2] ?? '',
      concern: CONCERNS[i % CONCERNS.length],
      duration: DURATIONS[i % DURATIONS.length],
    });
  }

  // If we have more image pairs beyond 6, include them too
  for (let i = 6; i * 2 + 1 < imageCount; i++) {
    pairs.push({
      id: i,
      before: allImageUrls[i * 2],
      after: allImageUrls[i * 2 + 1],
      concern: CONCERNS[i % CONCERNS.length],
      duration: DURATIONS[i % DURATIONS.length],
    });
  }

  return pairs;
}

const beforeAfterPairs = buildPairs();

// ---------------------------------------------------------------------------
// Video testimonials — served from /public/videos/
// ---------------------------------------------------------------------------

interface VideoTestimonial {
  id: number;
  src: string;
  thumbnail: string;
  title: string;
}

const videoTestimonials: VideoTestimonial[] = [
  { id: 0, src: '/videos/skin-result-video.mp4',        thumbnail: '', title: 'Customer Story 1' },
  { id: 1, src: '/videos/testimonial-result-video.mp4', thumbnail: '', title: 'Customer Story 2' },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders a single before/after card with a CSS-based reveal slider */
const BeforeAfterCard: React.FC<{ pair: BeforeAfterPair }> = ({ pair }) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updateSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setSliderPos((x / rect.width) * 100);
  };

  const onMouseDown = () => {
    isDragging.current = true;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    updateSlider(e.clientX);
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    updateSlider(e.touches[0].clientX);
  };

  // Placeholder gradient used when no image is available
  const placeholderBefore = 'linear-gradient(135deg, #d4c5b0 0%, #b8a898 100%)';
  const placeholderAfter = 'linear-gradient(135deg, #eaf2e3 0%, #c8ddb8 100%)';

  return (
    <article className={styles.beforeAfterCard}>
      {/* Slider container */}
      <div
        ref={containerRef}
        className={styles.sliderContainer}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchMove={onTouchMove}
        aria-label={`Before and after comparison for ${pair.concern}`}
        role="img"
      >
        {/* After image — full width, sits behind */}
        <div
          className={styles.afterLayer}
          style={
            pair.after
              ? { backgroundImage: `url(${pair.after})` }
              : { background: placeholderAfter }
          }
        >
          <span className={styles.imageLabel}>After</span>
        </div>

        {/* Before image — clipped to sliderPos */}
        <div
          className={styles.beforeLayer}
          style={{
            width: `${sliderPos}%`,
            ...(pair.before
              ? { backgroundImage: `url(${pair.before})` }
              : { background: placeholderBefore }),
          }}
        >
          <span className={styles.imageLabel}>Before</span>
        </div>

        {/* Drag handle */}
        <div
          className={styles.sliderHandle}
          style={{ left: `${sliderPos}%` }}
          aria-hidden="true"
        >
          <div className={styles.sliderLine} />
          <div className={styles.sliderKnob}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M7 5l-4 5 4 5M13 5l4 5-4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className={styles.cardFooter}>
        <span className={styles.concernTag}>{pair.concern}</span>
        <span className={styles.duration}>{pair.duration}</span>
      </div>
    </article>
  );
};

/** Single review card */
const ReviewCard: React.FC<{ review: import('../hooks/useReviews').Review }> = ({ review }) => {
  const formattedDate = new Date(review.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article className={styles.reviewCard}>
      <header className={styles.reviewHeader}>
        <StarRating rating={review.rating} size="sm" />
        <time className={styles.reviewDate} dateTime={review.date}>
          {formattedDate}
        </time>
      </header>

      <p className={styles.reviewComment}>{review.comment}</p>

      <footer className={styles.reviewFooter}>
        <span className={styles.reviewerName}>{review.reviewerName}</span>
        {review.productSlug ? (
          <Link
            href={`/products/${review.productSlug}`}
            className={styles.productLink}
          >
            {review.productName}
          </Link>
        ) : (
          <span className={styles.productName}>{review.productName}</span>
        )}
      </footer>
    </article>
  );
};

/** Video modal */
const VideoModal: React.FC<{ video: VideoTestimonial; onClose: () => void }> = ({
  video,
  onClose,
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className={styles.modalBackdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Playing: ${video.title}`}
    >
      <div className={styles.modalContent}>
        <button
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Close video"
        >
          ✕
        </button>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={video.src}
          controls
          autoPlay
          className={styles.modalVideo}
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

const ResultsPage: React.FC = () => {
  const { reviews, averageRating, total, isLoading, isLoadingMore, error, hasMore, loadMore } =
    useReviews({ limit: 12 });

  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);
  const videoScrollRef = useRef<HTMLDivElement>(null);

  return (
    <main className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero} aria-labelledby="results-hero-heading">
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Customer Stories</p>
          <h1 id="results-hero-heading" className={styles.heroHeading}>
            Real Results
          </h1>
          <p className={styles.heroSubheading}>
            See the transformations our customers have experienced
          </p>
        </div>
      </section>

      {/* ── Before & After ── */}
      <section className={styles.section} aria-labelledby="before-after-heading">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 id="before-after-heading" className={styles.sectionTitle}>
              Before &amp; After
            </h2>
            <p className={styles.sectionSubtitle}>
              Drag the slider to reveal the transformation
            </p>
          </div>

          <div className={styles.beforeAfterGrid}>
            {beforeAfterPairs.map((pair) => (
              <BeforeAfterCard key={pair.id} pair={pair} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Video Testimonials (only rendered if videos exist) ── */}
      {videoTestimonials.length > 0 && (
        <section className={styles.videoSection} aria-labelledby="video-heading">
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 id="video-heading" className={styles.sectionTitle}>
                Hear It From Them
              </h2>
              <p className={styles.sectionSubtitle}>
                Real customers, real stories
              </p>
            </div>
          </div>

          <div className={styles.videoScrollWrapper} ref={videoScrollRef}>
            {videoTestimonials.map((video) => (
              <button
                key={video.id}
                className={styles.videoThumb}
                onClick={() => setActiveVideo(video)}
                aria-label={`Play video: ${video.title}`}
              >
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src={video.src}
                  className={styles.videoPreview}
                  muted
                  preload="metadata"
                />
                <div className={styles.playOverlay} aria-hidden="true">
                  <div className={styles.playIcon}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <p className={styles.videoTitle}>{video.title}</p>
              </button>
            ))}
          </div>

          {activeVideo && (
            <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
          )}
        </section>
      )}

      {/* ── Reviews & Testimonials ── */}
      <section className={styles.reviewsSection} aria-labelledby="reviews-heading">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 id="reviews-heading" className={styles.sectionTitle}>
              What Our Customers Say
            </h2>
          </div>

          {/* Average rating banner */}
          {!isLoading && !error && reviews.length > 0 && (
            <div className={styles.averageBanner} aria-label={`Average rating: ${averageRating.toFixed(1)} out of 5`}>
              <span className={styles.averageScore}>{averageRating.toFixed(1)}</span>
              <div className={styles.averageDetails}>
                <StarRating rating={averageRating} size="lg" />
                <p className={styles.averageLabel}>
                  Based on <strong>{total}</strong> verified review{total !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className={styles.loadingState} aria-live="polite" aria-busy="true">
              <div className={styles.spinner} aria-hidden="true" />
              <p>Loading reviews…</p>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className={styles.errorState} role="alert">
              <p>We couldn't load reviews right now. Please try again later.</p>
              <p className={styles.errorDetail}>{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && reviews.length === 0 && (
            <p className={styles.emptyState}>
              No reviews yet — be the first to share your experience!
            </p>
          )}

          {/* Review grid */}
          {!isLoading && reviews.length > 0 && (
            <>
              <div className={styles.reviewGrid}>
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className={styles.loadMoreWrapper}>
                  <button
                    className={styles.loadMoreBtn}
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    aria-label="Load more reviews"
                  >
                    {isLoadingMore ? (
                      <>
                        <span className={styles.spinnerSm} aria-hidden="true" />
                        Loading…
                      </>
                    ) : (
                      'Load More Reviews'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default ResultsPage;