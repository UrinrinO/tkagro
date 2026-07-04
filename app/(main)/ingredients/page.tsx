'use client';
import { Suspense } from 'react';
import IngredientsPage from '@/_pages/IngredientsPage';

export default function IngredientsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-sm text-gray-400">Loading…</div></div>}>
      <IngredientsPage />
    </Suspense>
  );
}
