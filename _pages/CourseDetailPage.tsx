'use client';
/**
 * TKAG-28: Training Academy — Course detail page (/training/courses/:slug)
 * Displays full course info, module list with video player, and enrol CTA.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCourseDetail } from '@/hooks/useCourseDetail';
import type { CourseModule } from '@/types/training';
import styles from './CourseDetailPage.module.css';

/**
 * Determines whether a URL is a YouTube link and extracts the video ID.
 * Supports youtube.com/watch?v=, youtu.be/, and youtube.com/embed/ formats.
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface VideoPlayerProps {
  module: CourseModule;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ module }) => {
  const youtubeId = extractYouTubeId(module.videoUrl);

  if (youtubeId) {
    return (
      <div className={styles.videoWrapper}>
        <iframe
          className={styles.videoIframe}
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
          title={module.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback to native <video> for non-YouTube URLs
  return (
    <div className={styles.videoWrapper}>
      <video
        className={styles.videoNative}
        controls
        preload="metadata"
        aria-label={`Video for module: ${module.title}`}
      >
        <source src={module.videoUrl} />
        <p>Your browser does not support the video tag.</p>
      </video>
    </div>
  );
};

interface ModuleItemProps {
  module: CourseModule;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}

const ModuleItem: React.FC<ModuleItemProps> = ({ module, index, isActive, onSelect }) => {
  return (
    <li className={styles.moduleItem}>
      <button
        className={`${styles.moduleButton} ${isActive ? styles.moduleButtonActive : ''}`}
        onClick={onSelect}
        aria-current={isActive ? 'true' : undefined}
        aria-label={`Module ${index + 1}: ${module.title}, duration ${module.duration}`}
      >
        <span className={styles.moduleIndex}>{index + 1}</span>
        <span className={styles.moduleInfo}>
          <span className={styles.moduleTitle}>{module.title}</span>
          <span className={styles.moduleDuration}>{module.duration}</span>
        </span>
        {isActive && <span className={styles.modulePlayIcon} aria-hidden="true">▶</span>}
      </button>
    </li>
  );
};

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
  }).format(price);
}

const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { course, loading, error } = useCourseDetail(slug ?? '');
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  // ── Loading state ──
  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState} aria-busy="true" aria-label="Loading course">
            <div className={styles.skeletonHero} />
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonLine} style={{ width: '50%', height: '32px' }} />
              <div className={styles.skeletonLine} style={{ width: '80%' }} />
              <div className={styles.skeletonLine} style={{ width: '70%' }} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Error state ──
  if (error || !course) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorState} role="alert">
            <span className={styles.errorIcon} aria-hidden="true">⚠️</span>
            <h1 className={styles.errorHeading}>
              {error === 'Course not found' ? 'Course Not Found' : 'Something Went Wrong'}
            </h1>
            <p className={styles.errorMessage}>
              {error === 'Course not found'
                ? "We couldn't find the course you're looking for."
                : "We couldn't load this course. Please try again later."}
            </p>
            <Link href="/training" className={styles.backLink}>
              ← Back to Training Academy
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const modules = course.modules ?? [];
  const activeModule = modules[activeModuleIndex] ?? null;

  const handleEnrol = () => {
    // Stub: replace with actual payment/enrolment flow
    alert(`Enrolment flow for "${course.title}" — coming soon!`);
  };

  return (
    <main className={styles.page}>
      {/* ── Breadcrumb ── */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <ol className={styles.breadcrumbList}>
          <li>
            <Link href="/training" className={styles.breadcrumbLink}>Training Academy</Link>
          </li>
          <li aria-hidden="true" className={styles.breadcrumbSeparator}>›</li>
          <li>
            <Link href="/training#courses" className={styles.breadcrumbLink}>Online Courses</Link>
          </li>
          <li aria-hidden="true" className={styles.breadcrumbSeparator}>›</li>
          <li className={styles.breadcrumbCurrent} aria-current="page">{course.title}</li>
        </ol>
      </nav>

      <div className={styles.container}>
        {/* ── Course Header ── */}
        <header className={styles.courseHeader}>
          <div className={styles.courseHeaderContent}>
            {course.level && (
              <span className={styles.levelBadge}>{course.level}</span>
            )}
            <h1 className={styles.courseTitle}>{course.title}</h1>
            <p className={styles.courseDescription}>{course.description}</p>

            <div className={styles.courseMeta}>
              <span className={styles.metaItem}>
                📚 {course.moduleCount} {course.moduleCount === 1 ? 'module' : 'modules'}
              </span>
              {course.instructor && (
                <span className={styles.metaItem}>👩‍🏫 {course.instructor}</span>
              )}
              <span className={styles.metaItem}>
                🕐 {modules.reduce((acc, m) => {
                  // Sum durations if they're in mm:ss format
                  const parts = m.duration.split(':');
                  if (parts.length === 2) {
                    return acc + parseInt(parts[0], 10);
                  }
                  return acc;
                }, 0)} min total
              </span>
            </div>
          </div>

          {/* ── Enrol CTA Card ── */}
          <aside className={styles.enrolCard} aria-label="Enrolment options">
            {course.thumbnailUrl && (
              <img
                src={course.thumbnailUrl}
                alt={`${course.title} preview`}
                className={styles.enrolThumbnail}
              />
            )}
            <div className={styles.enrolBody}>
              <p className={styles.enrolPrice}>
                {formatPrice(course.price, course.currency)}
              </p>
              <button
                className={styles.enrolButton}
                onClick={handleEnrol}
                aria-label={`Enrol in ${course.title} for ${formatPrice(course.price, course.currency)}`}
              >
                {course.price === 0 ? 'Enrol for Free' : 'Enrol Now →'}
              </button>
              <p className={styles.enrolNote}>
                Lifetime access · Learn at your own pace
              </p>
            </div>
          </aside>
        </header>

        {/* ── Course Content ── */}
        {modules.length > 0 ? (
          <div className={styles.courseContent}>
            {/* ── Video Player ── */}
            <div className={styles.playerSection}>
              {activeModule && (
                <>
                  <VideoPlayer module={activeModule} />
                  <div className={styles.activeModuleInfo}>
                    <span className={styles.activeModuleNumber}>
                      Module {activeModuleIndex + 1} of {modules.length}
                    </span>
                    <h2 className={styles.activeModuleTitle}>{activeModule.title}</h2>
                    <span className={styles.activeModuleDuration}>
                      ⏱ {activeModule.duration}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* ── Module List ── */}
            <aside className={styles.moduleList} aria-label="Course modules">
              <h3 className={styles.moduleListHeading}>Course Modules</h3>
              <ol className={styles.moduleListItems}>
                {modules.map((module, index) => (
                  <ModuleItem
                    key={index}
                    module={module}
                    index={index}
                    isActive={index === activeModuleIndex}
                    onSelect={() => setActiveModuleIndex(index)}
                  />
                ))}
              </ol>
            </aside>
          </div>
        ) : (
          <div className={styles.noModules}>
            <p>Course content is being prepared. Enrol now to get access when it launches.</p>
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className={styles.bottomCta}>
          <div className={styles.bottomCtaContent}>
            <h2 className={styles.bottomCtaHeading}>Ready to start learning?</h2>
            <p className={styles.bottomCtaText}>
              Join our community of natural beauty enthusiasts and transform your knowledge.
            </p>
          </div>
          <button
            className={styles.enrolButton}
            onClick={handleEnrol}
          >
            {course.price === 0 ? 'Enrol for Free' : `Enrol for ${formatPrice(course.price, course.currency)} →`}
          </button>
        </div>
      </div>
    </main>
  );
};

export default CourseDetailPage;