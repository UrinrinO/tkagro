'use client';
/**
 * TKAG-28: Training Academy — Index page (/training)
 * Shows hero, upcoming workshops, online courses, and YouTube tutorials.
 */

import React from 'react';
import { useWorkshops } from '@/hooks/useWorkshops';
import { useCourses } from '@/hooks/useCourses';
import WorkshopCard from '@/components/Training/WorkshopCard';
import CourseCard from '@/components/Training/CourseCard';
import PastEventsCollapsible from '@/components/Training/PastEventsCollapsible';
import YouTubeTutorials from '@/components/Training/YouTubeTutorials';
import LoadingGrid from '@/components/Training/LoadingGrid';
import ErrorMessage from '@/components/Training/ErrorMessage';
import styles from './TrainingPage.module.css';

const TrainingPage: React.FC = () => {
  const {
    upcoming: upcomingWorkshops,
    past: pastWorkshops,
    loading: workshopsLoading,
    error: workshopsError,
  } = useWorkshops();

  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
  } = useCourses();

  return (
    <main className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero} aria-labelledby="training-hero-heading">
        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow}>Learn &amp; Grow</span>
          <h1 id="training-hero-heading" className={styles.heroHeading}>
            Training Academy
          </h1>
          <p className={styles.heroSubheading}>
            Deepen your knowledge of natural beauty, agrocosmetics, and holistic wellness
            through expert-led workshops and self-paced online courses.
          </p>
          <div className={styles.heroActions}>
            <a href="#workshops" className={styles.heroCta}>
              Explore Workshops
            </a>
            <a href="#courses" className={styles.heroCtaSecondary}>
              Browse Courses
            </a>
          </div>
        </div>
        <div className={styles.heroDecoration} aria-hidden="true">
          🌿
        </div>
      </section>

      <div className={styles.container}>
        {/* ── Workshops Section ── */}
        <section id="workshops" className={styles.section} aria-labelledby="workshops-heading">
          <div className={styles.sectionHeader}>
            <h2 id="workshops-heading" className={styles.sectionHeading}>
              Upcoming Workshops
            </h2>
            <p className={styles.sectionSubheading}>
              Hands-on learning experiences with our expert practitioners
            </p>
          </div>

          {workshopsLoading && <LoadingGrid count={3} variant="workshop" />}

          {workshopsError && !workshopsLoading && (
            <ErrorMessage
              message="We couldn't load workshops right now. Please try again later."
            />
          )}

          {!workshopsLoading && !workshopsError && upcomingWorkshops.length === 0 && (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                No upcoming workshops at the moment. Check back soon or explore our online courses below.
              </p>
            </div>
          )}

          {!workshopsLoading && !workshopsError && upcomingWorkshops.length > 0 && (
            <div className={styles.grid}>
              {upcomingWorkshops.map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          )}

          {/* Past events collapsible — only shown once workshops have loaded */}
          {!workshopsLoading && !workshopsError && (
            <PastEventsCollapsible workshops={pastWorkshops} />
          )}
        </section>

        {/* ── Divider ── */}
        <hr className={styles.divider} aria-hidden="true" />

        {/* ── Online Courses Section ── */}
        <section id="courses" className={styles.section} aria-labelledby="courses-heading">
          <div className={styles.sectionHeader}>
            <h2 id="courses-heading" className={styles.sectionHeading}>
              Online Courses
            </h2>
            <p className={styles.sectionSubheading}>
              Self-paced learning you can do from anywhere, at any time
            </p>
          </div>

          {coursesLoading && <LoadingGrid count={4} variant="course" />}

          {coursesError && !coursesLoading && (
            <ErrorMessage
              message="We couldn't load courses right now. Please try again later."
            />
          )}

          {!coursesLoading && !coursesError && courses.length === 0 && (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                No courses available yet. We're working on exciting new content — check back soon!
              </p>
            </div>
          )}

          {!coursesLoading && !coursesError && courses.length > 0 && (
            <div className={styles.grid}>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>

        {/* ── Divider ── */}
        <hr className={styles.divider} aria-hidden="true" />

        {/* ── YouTube Tutorials Section ── */}
        <YouTubeTutorials />
      </div>
    </main>
  );
};

export default TrainingPage;