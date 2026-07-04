/**
 * TKAG-7: Community & Referral Program — TypeScript interfaces
 * Defines data structures for referral codes, stats, and rewards.
 */

export interface Referral {
  id: string;
  userId: string;
  code: string;
  createdAt: string;
  usedCount: number;
  rewardsEarned: number;
}

export interface ReferralReward {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  earnedAt: string;
}