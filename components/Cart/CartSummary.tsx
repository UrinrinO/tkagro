'use client';
/**
 * TKAG-18: CartSummary component
 * Displays subtotal, applied discount, and total.
 * Used in both CartDrawer and CartPage.
 */

import React from 'react';
import { useCart } from '../../hooks/useCart';
import { formatGBP } from '../../utils/discountCalculator';

interface CartSummaryProps {
  shippingCost?: number | null;
  shippingLabel?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({ shippingCost = null, shippingLabel }) => {
  const { totalPrice, discountResult, discountedTotal } = useCart();
  const finalTotal = shippingCost != null ? discountedTotal + shippingCost : discountedTotal;

  return (
    <div className="cart-summary" aria-label="Order summary">
      {/* Subtotal */}
      <div className="cart-summary__row">
        <span className="cart-summary__label">Subtotal</span>
        <span className="cart-summary__value">{formatGBP(totalPrice)}</span>
      </div>

      {/* Discount row — only shown when a valid code is applied */}
      {discountResult?.isValid && (
        <div className="cart-summary__row cart-summary__row--discount" aria-live="polite">
          <span className="cart-summary__label">
            Discount{' '}
            <span className="cart-summary__discount-code">({discountResult.code})</span>
          </span>
          <span className="cart-summary__value cart-summary__value--discount">
            −{formatGBP(discountResult.discountAmount)}
          </span>
        </div>
      )}

      {/* Shipping */}
      <div className="cart-summary__row">
        <span className="cart-summary__label">
          Shipping{shippingLabel ? ` · ${shippingLabel}` : ''}
        </span>
        <span className="cart-summary__value">
          {shippingCost == null ? (
            <span className="cart-summary__shipping-tbd">Calculated at checkout</span>
          ) : shippingCost === 0 ? (
            <span className="cart-summary__free-shipping">Free</span>
          ) : (
            formatGBP(shippingCost)
          )}
        </span>
      </div>

      <div className="cart-summary__divider" aria-hidden="true" />

      {/* Total */}
      <div className="cart-summary__row cart-summary__row--total">
        <span className="cart-summary__label cart-summary__label--total">Total</span>
        <span className="cart-summary__value cart-summary__value--total">
          {formatGBP(finalTotal)}
        </span>
      </div>

      <p className="cart-summary__tax-note">Taxes calculated at checkout</p>
    </div>
  );
};

export default CartSummary;