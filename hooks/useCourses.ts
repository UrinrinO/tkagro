'use client';
/**
 * TKAG-28: Training Academy — hook for fetching courses list
 */

import { useState, useEffect } from 'react';
import type { Course } from '@/types/training';

interface UseCoursesResult {
  courses: Course[];
  loading: boolean;
  error: string | null;
}

export function useCourses(): UseCoursesResult {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCourses() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/courses');
        if (!res.ok) {
          throw new Error(`Failed to fetch courses: ${res.statusText}`);
        }
        const data: Course[] = await res.json();

        if (!cancelled) {
          setCourses(data);
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

    fetchCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  return { courses, loading, error };
}