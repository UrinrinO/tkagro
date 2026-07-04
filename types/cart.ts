/**
 * TKAG-18: Cart types
 * Shared type definitions for cart functionality.
 */

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  slug?: string;
  stockCount?: number | null;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export interface DiscountResult {
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // percentage (0–100) or fixed £ amount
  discountAmount: number; // computed £ discount
  isValid: boolean;
  message?: string;
}

export interface CartState {
  items: CartItem[];
  discountResult: DiscountResult | null;
}