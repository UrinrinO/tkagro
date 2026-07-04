'use client';
/**
 * CommunityFeed — Before/After transformation grid.
 * Each card is an interactive drag slider revealing real customer results.
 */

import React from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';

import acneBefore  from '../assets/images/testimonials/acne-before.jpg';
import acneAfter   from '../assets/images/testimonials/acne-after.jpg';
import bellyBefore from '../assets/images/testimonials/belly-before.png';
import bellyAfter  from '../assets/images/testimonials/belly-after.png';
import chestBefore from '../assets/images/testimonials/chest-before.png';
import chestAfter  from '../assets/images/testimonials/chest-after.png';
import reviewBefore from '../assets/images/testimonials/review-before.jpg';
import afterResult  from '../assets/images/testimonials/after-result.jpg';

const PAIRS = [
  { before: acneBefore,   after: acneAfter,   label: 'Acne & Blemishes' },
  { before: bellyBefore,  after: bellyAfter,  label: 'Stretch Marks' },
  { before: chestBefore,  after: chestAfter,  label: 'Chest Hyperpigmentation' },
  { before: reviewBefore, after: afterResult, label: 'Skin Transformation' },
];

const CommunityFeed: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {PAIRS.map(({ before, after, label }) => (
        <BeforeAfterSlider key={label} before={before} after={after} label={label} />
      ))}
    </div>
  );
};

export default CommunityFeed;
