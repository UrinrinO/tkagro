'use client';
/**
 * TKAG-28: Training Academy — hook for fetching workshops
 */

import { useState, useEffect } from 'react';
import type { Workshop } from '@/types/training';

interface UseWorkshopsResult {
  upcoming: Workshop[];
  past: Workshop[];
  loading: boolean;
  error: string | null;
}

export function useWorkshops(): UseWorkshopsResult {
  const [upcoming, setUpcoming] = useState<Workshop[]>([]);
  const [past, setPast] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchWorkshops() {
      try {
        setLoading(true);
        setError(null);

        // Fetch upcoming workshops
        const upcomingRes = await fetch('/api/workshops?upcoming=true');
        if (!upcomingRes.ok) {
          throw new Error(`Failed to fetch upcoming workshops: ${upcomingRes.statusText}`);
        }
        const upcomingData: Workshop[] = await upcomingRes.json();

        // Fetch past workshops (upcoming=false)
        const pastRes = await fetch('/api/workshops?upcoming=false');
        if (!pastRes.ok) {
          throw new Error(`Failed to fetch past workshops: ${pastRes.statusText}`);
        }
        const pastData: Workshop[] = await pastRes.json();

        if (!cancelled) {
          setUpcoming(upcomingData);
          setPast(pastData);
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

    fetchWorkshops();

    return () => {
      cancelled = true;
    };
  }, []);

  return { upcoming, past, loading, error };
}