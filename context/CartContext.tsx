'use client';
/**
 * TKAG-18: CartContext
 * Provides cart state and actions to the entire application.
 * State is persisted to localStorage as a fallback; server-side sync
 * occurs on login via POST /api/cart/sync (handled by auth flow).
 */

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import type { CartItem, CartProduct, DiscountResult } from '@/types/cart';

// ─── Action types ────────────────────────────────────────────────────────────

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartProduct }
  | { type: 'REMOVE_ITEM'; payload: string } // product id
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; payload: CartItem[] };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find((i) => i.product.id === action.payload.id);
      const maxQty = action.payload.stockCount ?? Infinity;
      if (existing) {
        if (existing.quantity >= maxQty) return state; // already at stock limit
        return state.map((i) =>
          i.product.id === action.payload.id
            ? { ...i, quantity: Math.min(i.quantity + 1, maxQty) }
            : i,
        );
      }
      return [...state, { product: action.payload, quantity: 1 }];
    }

    case 'REMOVE_ITEM':
      return state.filter((i) => i.product.id !== action.payload);

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return state.filter((i) => i.product.id !== productId);
      }
      return state.map((i) => {
        if (i.product.id !== productId) return i;
        const maxQty = i.product.stockCount ?? Infinity;
        return { ...i, quantity: Math.min(quantity, maxQty) };
      });
    }

    case 'CLEAR_CART':
      return [];

    case 'HYDRATE':
      return action.payload;

    default:
      return state;
  }
}

// ─── Context shape ────────────────────────────────────────────────────────────

export interface CartContextValue {
  items: CartItem[];
  discountResult: DiscountResult | null;
  totalItems: number;
  totalPrice: number; // subtotal before discount
  discountedTotal: number; // total after discount
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (product: CartProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscount: (code: string) => Promise<void>;
  removeDiscount: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tkagro_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [discountResult, setDiscountResult] = useState<DiscountResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      }
    } catch {
      // Corrupted storage — start fresh
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage quota exceeded or unavailable — silently fail
    }
  }, [items, hydrated]);

  // Derived values
  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items],
  );

  const discountedTotal = useMemo(() => {
    if (!discountResult?.isValid) return totalPrice;
    return Math.max(0, totalPrice - discountResult.discountAmount);
  }, [totalPrice, discountResult]);

  // Actions
  const addItem = useCallback((product: CartProduct) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    setDiscountResult(null);
  }, []);

  const applyDiscount = useCallback(
    async (code: string) => {
      const API_URL = '';
      try {
        const res = await fetch(`${API_URL}/api/discounts/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, subtotal: totalPrice }),
        });
        const json = await res.json();
        setDiscountResult(json.data?.result ?? {
          code, type: 'percentage', value: 0, discountAmount: 0,
          isValid: false, message: 'Could not validate code. Please try again.',
        });
      } catch {
        setDiscountResult({
          code, type: 'percentage', value: 0, discountAmount: 0,
          isValid: false, message: 'Network error. Please try again.',
        });
      }
    },
    [totalPrice],
  );

  const removeDiscount = useCallback(() => {
    setDiscountResult(null);
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      discountResult,
      totalItems,
      totalPrice,
      discountedTotal,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyDiscount,
      removeDiscount,
    }),
    [
      items,
      discountResult,
      totalItems,
      totalPrice,
      discountedTotal,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyDiscount,
      removeDiscount,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}