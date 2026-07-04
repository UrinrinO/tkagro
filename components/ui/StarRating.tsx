'use client';
/**
 * TKAG-27 — Reusable StarRating component
 * Renders 1–5 gold stars, supporting half-star display for averages.
 */

import React from 'react';

interface StarRatingProps {
  rating: number;       // 0–5, supports decimals for average display
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;  // optionally render numeric value beside stars
  className?: string;
}

const SIZE_MAP: Record<string, string> = {
  sm: '14px',
  md: '18px',
  lg: '24px',
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  showValue = false,
  className = '',
}) => {
  const clampedRating = Math.min(Math.max(rating, 0), maxStars);
  const starSize = SIZE_MAP[size];

  return (
    <span
      className={`star-rating ${className}`}
      aria-label={`Rating: ${clampedRating.toFixed(1)} out of ${maxStars} stars`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const fillPercent = Math.min(Math.max(clampedRating - i, 0), 1) * 100;

        return (
          <span
            key={i}
            style={{
              position: 'relative',
              display: 'inline-block',
              width: starSize,
              height: starSize,
              fontSize: starSize,
              lineHeight: 1,
            }}
            aria-hidden="true"
          >
            {/* Empty star base */}
            <span style={{ color: '#d1d5db' }}>★</span>
            {/* Filled overlay — clipped to fillPercent width for partial stars */}
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                overflow: 'hidden',
                width: `${fillPercent}%`,
                color: 'var(--color-accent, #c9a84c)',
                whiteSpace: 'nowrap',
              }}
            >
              ★
            </span>
          </span>
        );
      })}

      {showValue && (
        <span
          style={{
            marginLeft: '6px',
            fontSize: size === 'lg' ? '1.125rem' : '0.875rem',
            color: 'var(--color-grey)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {clampedRating.toFixed(1)}
        </span>
      )}
    </span>
  );
};

export default StarRating;