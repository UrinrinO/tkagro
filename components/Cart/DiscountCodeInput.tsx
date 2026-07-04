'use client';
/**
 * TKAG-18: DiscountCodeInput component
 * Allows users to enter a discount code. Calls discountCalculator logic
 * and displays the result inline.
 */

import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';

const DiscountCodeInput: React.FC = () => {
  const { discountResult, applyDiscount, removeDiscount } = useCart();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setIsLoading(true);
    await applyDiscount(inputValue);
    setIsLoading(false);
  };

  const handleRemove = () => {
    removeDiscount();
    setInputValue('');
  };

  // If a valid discount is already applied, show the applied state
  if (discountResult?.isValid) {
    return (
      <div className="discount-input discount-input--applied" role="status">
        <div className="discount-input__applied-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="discount-input__check-icon"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="discount-input__code-label">
            <strong>{discountResult.code}</strong> — {discountResult.message}
          </span>
        </div>
        <button
          className="discount-input__remove-btn"
          onClick={handleRemove}
          aria-label="Remove discount code"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form className="discount-input" onSubmit={handleApply} noValidate>
      <div className="discount-input__field-row">
        <label htmlFor="discount-code" className="sr-only">
          Discount code
        </label>
        <input
          id="discount-code"
          type="text"
          className={`discount-input__field ${
            discountResult && !discountResult.isValid ? 'discount-input__field--error' : ''
          }`}
          placeholder="Enter discount code"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.toUpperCase())}
          autoComplete="off"
          spellCheck={false}
          aria-describedby={
            discountResult && !discountResult.isValid ? 'discount-error' : undefined
          }
        />
        <button
          type="submit"
          className="discount-input__apply-btn"
          disabled={isLoading || !inputValue.trim()}
          aria-busy={isLoading}
        >
          {isLoading ? 'Applying…' : 'Apply'}
        </button>
      </div>

      {/* Error message for invalid codes */}
      {discountResult && !discountResult.isValid && (
        <p id="discount-error" className="discount-input__error" role="alert">
          {discountResult.message}
        </p>
      )}
    </form>
  );
};

export default DiscountCodeInput;