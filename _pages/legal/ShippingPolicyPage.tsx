'use client';
import React from 'react';
import PageSEO from '../../components/SEO/PageSEO';
import LegalShell from './LegalShell';

const ShippingPolicyPage: React.FC = () => (
  <>
    <PageSEO
      title="Shipping Policy"
      description="Delivery information and shipping rates for T.kays Agrocosmetics orders."
      canonicalPath="/shipping-policy"
    />
    <LegalShell title="Shipping Policy" lastUpdated="June 2026">

      <p>
        We ship T.kays Agrocosmetics orders to the UK and internationally. Shipping costs are calculated
        at checkout based on your delivery location and the total weight of your order.
      </p>

      <h2>Shipping Destinations</h2>
      <ul>
        <li><strong>United Kingdom</strong> — standard and express options available</li>
        <li><strong>Europe</strong> — international tracked shipping</li>
        <li><strong>Africa</strong> — international tracked shipping</li>
        <li><strong>Rest of World</strong> — international tracked shipping</li>
      </ul>

      <h2>Shipping Costs</h2>
      <p>
        Shipping costs are weight-based and calculated automatically at checkout. You will see the exact
        cost before you complete your order. No surprises at payment.
      </p>

      <h2>Dispatch Times</h2>
      <p>
        We aim to dispatch all orders within 1–3 business days of payment being confirmed. Orders
        placed on weekends or bank holidays will be dispatched on the next available business day.
      </p>

      <h2>Estimated Delivery Times</h2>
      <ul>
        <li><strong>UK:</strong> 2–4 business days</li>
        <li><strong>Europe:</strong> 3–7 business days</li>
        <li><strong>Africa:</strong> 10–21 business days</li>
        <li><strong>Rest of World:</strong> 14–28 business days</li>
      </ul>
      <p>
        Delivery times are estimates only. They may be affected by courier delays, customs checks, bank
        holidays, weather, or other factors outside our control.
      </p>

      <h2>Tracking</h2>
      <p>
        Where available, a tracking number will be provided once your order has been dispatched. You
        should receive this by email.
      </p>

      <h2>Customs and Import Charges</h2>
      <p>
        For international orders, customs duties, taxes, or import fees may be charged by your country's
        customs authority. These charges are the responsibility of the recipient. We are not responsible
        for delays caused by customs processing.
      </p>

      <h2>Incorrect Address</h2>
      <p>
        Please ensure your delivery address is accurate before placing your order. We are not responsible
        for failed or delayed delivery caused by incorrect or incomplete address information.
      </p>

      <h2>Contact Us</h2>
      <p>If you have questions about your delivery, please contact us at info@tkayscosmetics.com with your order number.</p>

    </LegalShell>
  </>
);

export default ShippingPolicyPage;
