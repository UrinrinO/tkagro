/**
 * TKAG-28: Training Academy — shared TypeScript types
 */

export interface Workshop {
  id: number;
  title: string;
  date: string; // ISO date string
  time: string;
  location: string; // 'Online' or physical address
  price: number;
  currency: string;
  bookingUrl?: string;
  isPast: boolean;
  description?: string;
  imageUrl?: string;
}

export interface CourseModule {
  title: string;
  videoUrl: string;
  duration: string; // e.g. "12:34"
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  moduleCount: number;
  price: number;
  currency: string;
  modules?: CourseModule[];
  instructor?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface YouTubePlaceholder {
  videoId: string;
  title: string;
}