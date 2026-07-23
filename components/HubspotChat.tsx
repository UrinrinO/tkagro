'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const MARKETING_KEY = 'tkays_marketing_consent';
export const CONSENT_UPDATED_EVENT = 'tkays-consent-updated';

const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;

export default function HubspotChat() {
  const [marketingAllowed, setMarketingAllowed] = useState(false);

  useEffect(() => {
    const checkConsent = () => setMarketingAllowed(localStorage.getItem(MARKETING_KEY) === 'true');
    checkConsent();
    window.addEventListener('storage', checkConsent);
    window.addEventListener(CONSENT_UPDATED_EVENT, checkConsent);
    return () => {
      window.removeEventListener('storage', checkConsent);
      window.removeEventListener(CONSENT_UPDATED_EVENT, checkConsent);
    };
  }, []);

  if (!portalId || !marketingAllowed) return null;

  // EU-hosted portal (see lib/hubspot.ts) — must use the eu1 tracking-script domain.
  return <Script id="hs-script-loader" src={`https://js-eu1.hs-scripts.com/${portalId}.js`} strategy="lazyOnload" />;
}
