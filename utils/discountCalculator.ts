/**
 * TKAG-18: Discount calculator utility
 * Validates discount codes and computes discount amounts.
 * In production, code validation should be confirmed server-side.
 */

import type { DiscountResult } from '../types/cart';

interface DiscountCode {
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
}

// Static discount code registry — replace with API call in production
const DISCOUNT_CODES: Record<string, DiscountCode> = {
  WELCOME10: { type: 'percentage', value: 10, description: '10% off your order' },
  NATURAL15: { type: 'percentage', value: 15, description: '15% off your order' },
  SAVE5: { type: 'fixed', value: 5, description: '£5 off your order' },
  BOTANICAL20: { type: 'percentage', value: 20, description: '20% off your order' },
};

/**
 * Validates a discount code and computes the discount amount against a subtotal.
 * @param code - The discount code entered by the user
 * @param subtotal - The cart subtotal in GBP (decimal)
 * @returns DiscountResult with computed discount amount
 */
export function applyDiscountCode(code: string, subtotal: number): DiscountResult {
  const normalised = code.trim().toUpperCase();
  const discount = DISCOUNT_CODES[normalised];

  if (!discount) {
    return {
      code: normalised,
      type: 'percentage',
      value: 0,
      discountAmount: 0,
      isValid: false,
      message: 'Invalid discount code. Please try again.',
    };
  }

  const discountAmount =
    discount.type === 'percentage'
      ? parseFloat(((subtotal * discount.value) / 100).toFixed(2))
      : Math.min(discount.value, subtotal); // fixed discount cannot exceed subtotal

  return {
    code: normalised,
    type: discount.type,
    value: discount.value,
    discountAmount,
    isValid: true,
    message: discount.description,
  };
}

/**
 * Formats a monetary value as GBP string.
 */
export function formatGBP(amount: number): string {
  return `£${amount.toFixed(2)}`;
}