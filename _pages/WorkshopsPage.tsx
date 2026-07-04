'use client';
/**
 * TKAG-28: Training Academy — Workshops listing page (/training/workshops)
 * Dedicated page for browsing all workshops.
 */

import React from 'react';
import Link from 'next/link';
import { useWorkshops } from '@/hooks/useWorkshops';
import WorkshopCard from '@/components/Training/WorkshopCard';
import PastEventsCollapsible from '@/components/Training/PastEventsCollapsible';
import LoadingGrid from '@/components/Training/LoadingGrid';
import ErrorMessage from '@/components/Training/ErrorMessage';
import styles from './WorkshopsPage.module.css';

const WorkshopsPage: React.FC = () => {
  const { upcoming, past, loading, error } = useWorkshops();

  return (
    <main className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <nav aria-label="Breadcrumb">
            <ol className={styles.breadcrumb}>
              <li>
                <Link href="/training" className={styles.breadcrumbLink}>Training Academy</Link>
              </li>
              <li aria-hidden="true" className={styles.breadcrumbSep}>›</li>
              <li className={styles.breadcrumbCurrent} aria-current="page">Workshops</li>
            </ol>
          </nav>
          <h1 className={styles.heading}>Workshops</h1>
          <p className={styles.subheading}>
            Immersive, hands-on learning experiences led by our expert practitioners.
            Join us in person or online.
          </p>
        </div>
      </header>

      <div className={styles.container}>
        {/* ── Upcoming ── */}
        <section aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className={styles.sectionHeading}>
            Upcoming Events
          </h2>

          {loading && <LoadingGrid count={3} variant="workshop" />}

          {error && !loading && (
            <ErrorMessage message="We couldn't load workshops. Please try again later." />
          )}

          {!loading && !error && upcoming.length === 0 && (
            <div className={styles.emptyState}>
              <p>No upcoming workshops scheduled. Check back soon!</p>
            </div>
          )}

          {!loading && !error && upcoming.length > 0 && (
            <div className={styles.grid}>
              {upcoming.map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          )}
        </section>

        {/* ── Past Events ── */}
        {!loading && !error && (
          <PastEventsCollapsible workshops={past} />
        )}
      </div>
    </main>
  );
};

export default WorkshopsPage;