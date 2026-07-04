'use client';
/**
 * TKAG-28: Training Academy — Course card component
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import type { Course } from '../../types/training';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  course: Course;
}

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
  }).format(price);
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/training/courses/${course.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View course: ${course.title}`}
    >
      <div className={styles.thumbnailWrapper}>
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={`${course.title} thumbnail`}
            className={styles.thumbnail}
          />
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            <span className={styles.thumbnailIcon}>🌿</span>
          </div>
        )}
        {course.level && (
          <span className={`${styles.levelBadge} ${styles[`level${course.level}`]}`}>
            {course.level}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{course.title}</h3>

        <p className={styles.description}>{course.description}</p>

        <div className={styles.footer}>
          <div className={styles.stats}>
            <span className={styles.moduleCount}>
              📚 {course.moduleCount} {course.moduleCount === 1 ? 'module' : 'modules'}
            </span>
            {course.instructor && (
              <span className={styles.instructor}>by {course.instructor}</span>
            )}
          </div>
          <span className={styles.price}>
            {formatPrice(course.price, course.currency)}
          </span>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;