'use client';
import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { ShippingData } from './ShippingForm';
import type { CartItem } from '../../types/cart';

const API_URL = '';

export interface PaymentFormProps {
  onSuccess: (orderNumber: string) => void;
  onBack: () => void;
  shippingData: ShippingData;
  cartItems: CartItem[];
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSuccess,
  onBack,
  shippingData,
  cartItems,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/`,
        payment_method_data: {
          billing_details: {
            name: `${shippingData.firstName} ${shippingData.lastName}`,
            email: shippingData.email,
            phone: shippingData.phone || undefined,
            address: {
              line1: shippingData.addressLine1,
              line2: shippingData.addressLine2 || undefined,
              city: shippingData.city,
              state: shippingData.county || undefined,
              postal_code: shippingData.postcode,
              country: shippingData.country,
            },
          },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message ?? 'Payment failed. Please try again.');
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            customer: {
              name: `${shippingData.firstName} ${shippingData.lastName}`,
              email: shippingData.email,
              phone: shippingData.phone || undefined,
            },
            shippingAddress: shippingData,
            items: cartItems.map((i) => ({ id: i.product.id, quantity: i.quantity })),
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message ?? 'Order could not be saved');
        onSuccess(json.data.order.order_number);
      } catch (err: any) {
        setErrorMessage(
          err.message ?? 'Payment went through but order could not be saved. Contact support.'
        );
      }
    } else {
      setErrorMessage('Payment was not completed. Please try again.');
    }

    setIsProcessing(false);
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit} noValidate>
      <h3 className="payment-form__title">Payment Details</h3>

      <div className="payment-form__notice" role="note">
        <span className="payment-form__notice-icon">🔒</span>
        <span>Secured by Stripe — your card details are never stored by us.</span>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <PaymentElement />
      </div>

      {errorMessage && (
        <p className="payment-form__error" role="alert" style={{ marginBottom: '1rem' }}>
          {errorMessage}
        </p>
      )}

      <div className="payment-form__actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onBack}
          disabled={isProcessing}
        >
          ← Back
        </button>
        <button
          type="submit"
          className="btn-primary payment-form__submit"
          disabled={isProcessing || !stripe || !elements}
        >
          {isProcessing ? 'Processing…' : 'Place Order'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
