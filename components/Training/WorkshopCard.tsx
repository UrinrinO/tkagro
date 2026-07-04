'use client';
/**
 * TKAG-28: Training Academy — Workshop card component
 */

import React from 'react';
import type { Workshop } from '../../types/training';
import styles from './WorkshopCard.module.css';

interface WorkshopCardProps {
  workshop: Workshop;
  isPast?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
  }).format(price);
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop, isPast = false }) => {
  const isOnline = workshop.location.toLowerCase() === 'online';

  const handleBookNow = () => {
    if (workshop.bookingUrl) {
      // Open external booking link in new tab
      window.open(workshop.bookingUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Stub: navigate to internal booking flow
      window.location.href = `/training/workshops/${workshop.id}/book`;
    }
  };

  return (
    <article className={`${styles.card} ${isPast ? styles.cardPast : ''}`}>
      {workshop.imageUrl && (
        <div className={styles.imageWrapper}>
          <img src={workshop.imageUrl} alt={workshop.title} className={styles.image} />
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={`${styles.badge} ${isOnline ? styles.badgeOnline : styles.badgeInPerson}`}>
            {isOnline ? '🌐 Online' : '📍 In-Person'}
          </span>
          {isPast && <span className={styles.badgePast}>Past Event</span>}
        </div>

        <h3 className={styles.title}>{workshop.title}</h3>

        {workshop.description && (
          <p className={styles.description}>{workshop.description}</p>
        )}

        <dl className={styles.details}>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>Date</dt>
            <dd className={styles.detailValue}>{formatDate(workshop.date)}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>Time</dt>
            <dd className={styles.detailValue}>{workshop.time}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>Location</dt>
            <dd className={styles.detailValue}>{workshop.location}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>Price</dt>
            <dd className={`${styles.detailValue} ${styles.price}`}>
              {formatPrice(workshop.price, workshop.currency)}
            </dd>
          </div>
        </dl>

        {!isPast && (
          <button
            className={styles.bookButton}
            onClick={handleBookNow}
            aria-label={`Book now for ${workshop.title}`}
          >
            Book Now →
          </button>
        )}
      </div>
    </article>
  );
};

export default WorkshopCard;