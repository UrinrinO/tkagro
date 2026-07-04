'use client';
/**
 * TKAG-6: Training Academy page
 * Displays a hero section and a responsive grid of educational YouTube videos
 * to help customers learn about T.kays products and skincare routines.
 */

import React from 'react';
import VideoGrid, { type Video } from '@/components/VideoGrid';
import '../styles/training-academy.css';

/**
 * Placeholder video data.
 * Replace `id` values with real YouTube video IDs when content is available.
 */
const videos: Video[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Introduction to Natural Skincare',
    description:
      'Learn the basics of building a natural skincare routine with botanical ingredients.',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Morning Skincare Routine',
    description:
      'Step-by-step guide to starting your day with T.kays products.',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Evening Skincare Ritual',
    description:
      'Wind down with our nighttime skincare routine for glowing skin.',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Understanding Your Skin Type',
    description:
      'Identify your skin type and choose the right products for you.',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Ingredient Spotlight: Shea Butter',
    description:
      'Discover the benefits of natural shea butter in skincare.',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Seasonal Skincare Tips',
    description:
      'Adjust your routine for changing weather and seasons.',
  },
];

const TrainingAcademyPage: React.FC = () => {
  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="training-academy-hero" aria-labelledby="academy-heading">
        <h1 id="academy-heading" className="training-academy-hero__heading">
          Training Academy
        </h1>
        <p className="training-academy-hero__subheading">
          Learn how to get the most from your T.kays products with our expert
          skincare tutorials and wellness guides.
        </p>
      </section>

      {/* ── Video grid ────────────────────────────────────────────────────── */}
      <section className="video-section" aria-label="Tutorial videos">
        <VideoGrid videos={videos} />
      </section>
    </main>
  );
};

export default TrainingAcademyPage;