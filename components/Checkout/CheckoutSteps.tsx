'use client';
/**
 * TKAG-5: Cart, Checkout & Discount System
 * Step progress indicator for the multi-step checkout flow
 */

import React from 'react';

export type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

interface Step {
  id: CheckoutStep;
  label: string;
  number: number;
}

const STEPS: Step[] = [
  { id: 'shipping', label: 'Shipping', number: 1 },
  { id: 'payment', label: 'Payment', number: 2 },
  { id: 'confirmation', label: 'Confirm', number: 3 },
];

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
}

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav className="checkout-steps" aria-label="Checkout progress">
      <ol className="checkout-steps__list">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = step.id === currentStep;

          return (
            <li
              key={step.id}
              className={[
                'checkout-steps__step',
                isCompleted ? 'checkout-steps__step--completed' : '',
                isActive ? 'checkout-steps__step--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Step connector line (not shown before first step) */}
              {index > 0 && (
                <div
                  className={`checkout-steps__connector ${
                    isCompleted ? 'checkout-steps__connector--completed' : ''
                  }`}
                  aria-hidden="true"
                />
              )}

              <div className="checkout-steps__indicator">
                {isCompleted ? (
                  <span className="checkout-steps__check" aria-hidden="true">
                    ✓
                  </span>
                ) : (
                  <span className="checkout-steps__number">{step.number}</span>
                )}
              </div>

              <span className="checkout-steps__label">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default CheckoutSteps;