'use client';
/**
 * TKAG-18: CartDrawer component
 * Slide-in drawer from the right, triggered by the cart icon in the Header.
 * Lists cart items, discount input, summary, and checkout CTA.
 */

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../hooks/useCart';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import DiscountCodeInput from './DiscountCodeInput';

const CartDrawer: React.FC = () => {
  const { items, totalItems, isDrawerOpen, closeDrawer } = useCart();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the close button when drawer opens for accessibility
  useEffect(() => {
    if (isDrawerOpen) {
      closeButtonRef.current?.focus();
      // Prevent body scroll while drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const handleCheckout = () => {
    closeDrawer();
    router.push('/checkout');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Close only when clicking the overlay, not the drawer panel itself
    if (e.target === e.currentTarget) {
      closeDrawer();
    }
  };

  const isEmpty = items.length === 0;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`cart-drawer__overlay ${isDrawerOpen ? 'cart-drawer__overlay--visible' : ''}`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`cart-drawer ${isDrawerOpen ? 'cart-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!isDrawerOpen}
      >
        {/* Header */}
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">
            Your Cart
            {totalItems > 0 && (
              <span className="cart-drawer__count" aria-label={`${totalItems} items`}>
                {totalItems}
              </span>
            )}
          </h2>
          <button
            ref={closeButtonRef}
            className="cart-drawer__close"
            onClick={closeDrawer}
            aria-label="Close cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
        </div>

        {/* Body */}
        <div className="cart-drawer__body">
          {isEmpty ? (
            /* Empty state */
            <div className="cart-drawer__empty">
              <div className="cart-drawer__empty-icon" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <p className="cart-drawer__empty-text">Your cart is empty</p>
              <p className="cart-drawer__empty-subtext">
                Discover our natural botanical products
              </p>
              <Link
                href="/shop"
                className="cart-drawer__shop-now-btn"
                onClick={closeDrawer}
              >
                Shop Now
              </Link>
            </div>
          ) : (
            /* Item list */
            <ul className="cart-drawer__items" aria-label="Cart items">
              {items.map((item) => (
                <li key={item.product.id} className="cart-drawer__item-wrapper">
                  <CartItem item={item} compact />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {!isEmpty && (
          <div className="cart-drawer__footer">
            <DiscountCodeInput />
            <CartSummary />

            <button
              className="cart-drawer__checkout-btn"
              onClick={handleCheckout}
              aria-label="Proceed to checkout"
            >
              Checkout
            </button>

            <button
              className="cart-drawer__continue-btn"
              onClick={closeDrawer}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;