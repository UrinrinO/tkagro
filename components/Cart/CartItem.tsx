'use client';
/**
 * TKAG-18: CartItem component
 * Displays a single cart item with image, name, price, quantity controls,
 * and a remove button.
 */

import React from 'react';
import type { CartItem as CartItemType } from '../../types/cart';
import { formatGBP } from '../../utils/discountCalculator';
import { useCart } from '../../hooks/useCart';

interface CartItemProps {
  item: CartItemType;
  /** Compact layout used in the drawer; full layout used on the cart page */
  compact?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({ item, compact = false }) => {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;
  const maxQty = product.stockCount ?? Infinity;
  const atLimit = quantity >= maxQty;

  const handleDecrement = () => updateQuantity(product.id, quantity - 1);
  const handleIncrement = () => { if (!atLimit) updateQuantity(product.id, quantity + 1); };

  const handleRemove = () => {
    removeItem(product.id);
  };

  const lineTotal = product.price * quantity;

  return (
    <article
      className={`cart-item ${compact ? 'cart-item--compact' : ''}`}
      aria-label={`${product.name}, quantity ${quantity}`}
    >
      {/* Product image */}
      <div className="cart-item__image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="cart-item__image"
          loading="lazy"
        />
      </div>

      {/* Product details */}
      <div className="cart-item__details">
        <h3 className="cart-item__name">{product.name}</h3>
        <p className="cart-item__unit-price">{formatGBP(product.price)} each</p>

        {/* Quantity controls */}
        <div className="cart-item__quantity-row">
          <div className="cart-item__quantity-controls" role="group" aria-label="Quantity">
            <button
              className="cart-item__qty-btn"
              onClick={handleDecrement}
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="cart-item__qty-value" aria-live="polite">
              {quantity}
            </span>
            <button
              className="cart-item__qty-btn"
              onClick={handleIncrement}
              aria-label="Increase quantity"
              disabled={atLimit}
              title={atLimit ? `Only ${maxQty} in stock` : undefined}
            >
              +
            </button>
          </div>

          <span className="cart-item__line-total">{formatGBP(lineTotal)}</span>
        </div>

        {/* Stock warning */}
        {typeof maxQty === 'number' && maxQty <= 5 && (
          <p style={{ fontSize: '0.7rem', color: '#b45309', marginTop: '0.25rem', fontWeight: 600 }}>
            {atLimit ? `Max stock reached (${maxQty})` : `Only ${maxQty - quantity} more available`}
          </p>
        )}
      </div>

      {/* Remove button */}
      <button
        className="cart-item__remove"
        onClick={handleRemove}
        aria-label={`Remove ${product.name} from cart`}
        title="Remove item"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </article>
  );
};

export default CartItem;