'use client';
/**
 * TKAG-18: CartPage
 * Full-page cart view at /cart.
 * Desktop: two-column layout (items left, order summary right).
 * Mobile: single column, summary below items.
 */

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import CartItem from '@/components/Cart/CartItem';
import CartSummary from '@/components/Cart/CartSummary';
import DiscountCodeInput from '@/components/Cart/DiscountCodeInput';

const CartPage: React.FC = () => {
  const { items, clearCart } = useCart();
  const router = useRouter();

  const isEmpty = items.length === 0;

  const handleProceedToCheckout = () => {
    router.push('/checkout');
  };

  return (
    <main className="cart-page" aria-labelledby="cart-page-heading">
      <div className="cart-page__container">
        {/* Page heading */}
        <div className="cart-page__heading-row">
          <h1 id="cart-page-heading" className="cart-page__heading">
            Shopping Cart
          </h1>
          {!isEmpty && (
            <button
              className="cart-page__clear-btn"
              onClick={clearCart}
              aria-label="Clear all items from cart"
            >
              Clear cart
            </button>
          )}
        </div>

        {isEmpty ? (
          /* Empty state */
          <div className="cart-page__empty">
            <div className="cart-page__empty-icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="72"
                height="72"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2 className="cart-page__empty-heading">Your cart is empty</h2>
            <p className="cart-page__empty-text">
              Looks like you haven't added anything yet. Explore our range of
              natural botanical products.
            </p>
            <Link href="/catalog" className="cart-page__shop-btn">
              Shop Now
            </Link>
          </div>
        ) : (
          /* Two-column layout */
          <div className="cart-page__layout">
            {/* Left column — item list */}
            <section className="cart-page__items-section" aria-label="Cart items">
              <ul className="cart-page__items-list">
                {items.map((item) => (
                  <li key={item.product.id} className="cart-page__item-wrapper">
                    <CartItem item={item} compact={false} />
                  </li>
                ))}
              </ul>

              {/* Back to shopping link */}
              <Link href="/catalog" className="cart-page__back-link">
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
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Continue Shopping
              </Link>
            </section>

            {/* Right column — order summary */}
            <aside className="cart-page__summary-panel" aria-label="Order summary">
              <h2 className="cart-page__summary-heading">Order Summary</h2>

              <DiscountCodeInput />

              <CartSummary showShipping />

              <button
                className="cart-page__checkout-btn"
                onClick={handleProceedToCheckout}
                aria-label="Proceed to checkout"
              >
                Proceed to Checkout
              </button>

              {/* Trust badges */}
              <div className="cart-page__trust-badges">
                <div className="cart-page__trust-badge">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
                <div className="cart-page__trust-badge">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span>Free shipping over £40</span>
                </div>
                <div className="cart-page__trust-badge">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  <span>Easy returns</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;