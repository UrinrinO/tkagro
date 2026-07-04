'use client';
/**
 * TKAG-28: Training Academy — hook for fetching a single course by slug
 */

import { useState, useEffect } from 'react';
import type { Course } from '@/types/training';

interface UseCourseDetailResult {
  course: Course | null;
  loading: boolean;
  error: string | null;
}

export function useCourseDetail(slug: string): UseCourseDetailResult {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function fetchCourse() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/courses/${slug}`);
        if (res.status === 404) {
          throw new Error('Course not found');
        }
        if (!res.ok) {
          throw new Error(`Failed to fetch course: ${res.statusText}`);
        }
        const data: Course = await res.json();

        if (!cancelled) {
          setCourse(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCourse();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { course, loading, error };
}