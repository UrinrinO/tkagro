'use client';
import React from 'react';
import PageSEO from '../../components/SEO/PageSEO';
import LegalShell from './LegalShell';

const ReturnsPolicyPage: React.FC = () => (
  <>
    <PageSEO
      title="Returns Policy"
      description="Information about returns, refunds, and cancellations for T.kays Agrocosmetics orders."
      canonicalPath="/returns-policy"
    />
    <LegalShell title="Returns Policy" lastUpdated="June 2026">

      <p>
        We want you to be happy with your T.kays Agrocosmetics order. If something is not right, please
        get in touch and we will do our best to help.
      </p>

      <h2>Hygiene and Safety</h2>
      <p>
        For hygiene and safety reasons, skincare and cosmetic products cannot be returned once they have
        been opened, used, unsealed, or tampered with. This applies to all skincare, hair care, and body
        products.
      </p>

      <h2>When You Can Return</h2>
      <p>You may request a return if:</p>
      <ul>
        <li>The product is unopened, unused, and in its original packaging</li>
        <li>The product seal has not been broken</li>
        <li>You contact us within <span className="placeholder">3 days</span> of receiving your order</li>
      </ul>

      <h2>Damaged, Faulty, or Incorrect Items</h2>
      <p>
        If your order arrives damaged, faulty, or incorrect, please contact us within 3 days of delivery
        with:
      </p>
      <ul>
        <li>Your order number</li>
        <li>A description of the issue</li>
        <li>Clear photographs of the product, packaging, and delivery label</li>
      </ul>
      <p>
        We will review the issue and may offer a replacement, refund, or other suitable resolution.
      </p>

      <h2>How to Request a Return or Refund</h2>
      <p>
        Contact us at info@tkayscosmetics.com with your order number and a
        description of the issue. Do not return any item without contacting us first.
      </p>

      <h2>Refunds</h2>
      <p>
        Once a return has been approved and the item has been received and inspected, refunds will be
        processed to the original payment method. Please allow <span className="placeholder">5–10 business days</span> for
        the refund to appear.
      </p>

      <h2>Return Postage</h2>
      <p>
        Where a return is approved for an unopened item (not damaged or faulty), return postage is the
        responsibility of the customer unless otherwise agreed. We will cover return postage costs for
        items that arrive damaged, faulty, or incorrect.
      </p>

      <h2>Cancellations</h2>
      <p>
        If you need to cancel an order, please contact us as soon as possible at{' '}
        info@tkayscosmetics.com. If your order has already been dispatched,
        we may not be able to cancel it and the returns process will apply instead.
      </p>

      <h2>Contact Us</h2>
      <ul>
        <li><strong>T.kays Agrocosmetics</strong></li>
        <li>Email: info@tkayscosmetics.com</li>
      </ul>

    </LegalShell>
  </>
);

export default ReturnsPolicyPage;
