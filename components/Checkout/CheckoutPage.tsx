'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutSteps, type CheckoutStep } from './CheckoutSteps';
import { ShippingForm, type ShippingData, type ShippingRate } from './ShippingForm';
import { PaymentForm } from './PaymentForm';
import CartSummary from '../Cart/CartSummary';
import { useCart } from '../../hooks/useCart';
import { stripePromise } from '@/lib/stripe';

const API_URL = '';

const stripeAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#2d5016',
    colorBackground: '#ffffff',
    colorText: '#1a1a1a',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '4px',
  },
};

export const CheckoutPage: React.FC = () => {
  const { items, clearCart, totalItems, discountResult } = useCart();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);

  if (totalItems === 0 && currentStep !== 'confirmation') {
    return (
      <div className="checkout-page checkout-page--empty">
        <div className="checkout-page__empty-state">
          <h2>Your cart is empty</h2>
          <p>Add some products before checking out.</p>
          <button className="btn-primary" onClick={() => router.push('/shop')}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const handleShippingSubmit = async (data: ShippingData, rate: ShippingRate | null) => {
    setShippingData(data);
    setShippingRate(rate);
    setIsProcessing(true);
    setIntentError(null);

    try {
      const apiItems = items.map((i) => ({ id: i.product.id, quantity: i.quantity }));
      const res = await fetch(`${API_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: apiItems,
          customerEmail: data.email,
          discountCode: discountResult?.code,
          shippingCountry: data.country,
          shippingCost: rate?.shippingCost ?? 0,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? 'Payment setup failed');
      setClientSecret(json.data.clientSecret);
      setCurrentStep('payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setIntentError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (orderNum: string) => {
    setOrderNumber(orderNum);
    clearCart();
    setCurrentStep('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToShipping = () => {
    setCurrentStep('shipping');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="checkout-page">
      <div className="checkout-page__container">
        <h1 className="checkout-page__heading">Checkout</h1>

        <CheckoutSteps currentStep={currentStep} />

        {currentStep === 'confirmation' ? (
          <div className="checkout-page__confirmation">
            <div className="checkout-page__confirmation-icon" aria-hidden="true">✓</div>
            <h2 className="checkout-page__confirmation-title">Order Placed!</h2>
            {orderNumber && (
              <p className="checkout-page__confirmation-text">
                Order <strong>{orderNumber}</strong> confirmed.
              </p>
            )}
            <p className="checkout-page__confirmation-text">
              A confirmation email has been sent to <strong>{shippingData?.email}</strong>.
            </p>
            <button className="btn-primary" onClick={() => router.push('/')}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="checkout-page__layout">
            <div className="checkout-page__form-area">
              {currentStep === 'shipping' && (
                <>
                  <ShippingForm
                    onSubmit={handleShippingSubmit}
                    initialData={shippingData ?? undefined}
                  />

                  {isProcessing && (
                    <p style={{ marginTop: '0.75rem', color: '#2d5016', fontSize: '0.9rem' }}>
                      Setting up payment…
                    </p>
                  )}
                  {intentError && (
                    <p style={{ marginTop: '0.75rem', color: '#b91c1c', fontSize: '0.9rem' }} role="alert">
                      {intentError}
                    </p>
                  )}
                </>
              )}

              {currentStep === 'payment' && clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret, appearance: stripeAppearance }}
                >
                  <PaymentForm
                    onSuccess={handlePaymentSuccess}
                    onBack={handleBackToShipping}
                    shippingData={shippingData!}
                    cartItems={items}
                  />
                </Elements>
              )}
            </div>

            <aside className="checkout-page__summary-area" aria-label="Order summary">
              <h3 className="checkout-page__summary-title">Order Summary</h3>
              <ul className="checkout-page__item-list">
                {items.map((item) => (
                  <li key={item.product.id} className="checkout-page__item">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="checkout-page__item-image"
                    />
                    <div className="checkout-page__item-info">
                      <span className="checkout-page__item-name">{item.product.name}</span>
                      <span className="checkout-page__item-qty">× {item.quantity}</span>
                    </div>
                    <span className="checkout-page__item-price">
                      £{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <CartSummary
                shippingCost={shippingRate?.shippingCost ?? null}
                shippingLabel={shippingRate?.zoneName}
              />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
