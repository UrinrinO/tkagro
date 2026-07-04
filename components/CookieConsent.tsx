'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'tkays_cookie_consent';
const ANALYTICS_KEY = 'tkays_analytics_consent';
const MARKETING_KEY = 'tkays_marketing_consent';

type ConsentValue = 'accepted' | 'declined' | 'custom' | null;

interface Preferences {
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>({ analytics: false, marketing: false });

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  const saveAndClose = (consent: ConsentValue, preferences: Preferences) => {
    localStorage.setItem(CONSENT_KEY, consent ?? 'declined');
    localStorage.setItem(ANALYTICS_KEY, String(preferences.analytics));
    localStorage.setItem(MARKETING_KEY, String(preferences.marketing));
    setVisible(false);
  };

  const acceptAll = () => saveAndClose('accepted', { analytics: true, marketing: true });
  const declineAll = () => saveAndClose('declined', { analytics: false, marketing: false });
  const saveCustom = () => saveAndClose('custom', prefs);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
      className="fixed bottom-0 inset-x-0 z-50"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
    >
      <div className="bg-white border-t border-gray-200 shadow-2xl max-w-3xl mx-auto m-4 rounded-2xl overflow-hidden">

        {!showPreferences ? (
          /* ── Main banner ── */
          <div className="p-6">
            <p id="cookie-title" className="font-semibold text-brand-dark text-base mb-2">
              We value your privacy
            </p>
            <p id="cookie-desc" className="text-sm text-gray-600 leading-relaxed mb-1">
              We use <strong>strictly necessary cookies</strong> to keep our site working — your basket,
              checkout, account session, and your cookie preference. These cannot be turned off.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              We do not currently use analytics or marketing cookies. If we add them in the future, we
              will ask for your consent first.{' '}
              <Link href="/cookies" className="text-primary underline hover:text-primary/80 transition-colors">
                Cookie Policy
              </Link>
            </p>

            <div className="flex flex-wrap gap-3 items-center justify-end">
              <button
                onClick={declineAll}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-800 transition-colors"
              >
                Decline non-essential
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-800 transition-colors"
              >
                Manage preferences
              </button>
              <button
                onClick={acceptAll}
                className="px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Accept all
              </button>
            </div>
          </div>
        ) : (
          /* ── Preferences panel ── */
          <div className="p-6">
            <button
              onClick={() => setShowPreferences(false)}
              className="text-xs text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 transition-colors"
              aria-label="Back to cookie banner"
            >
              ← Back
            </button>
            <p className="font-semibold text-brand-dark text-base mb-1">Manage cookie preferences</p>
            <p className="text-sm text-gray-500 mb-5">
              Choose which cookies you allow. Strictly necessary cookies cannot be disabled.
            </p>

            <div className="space-y-3 mb-6">

              {/* Strictly necessary */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-brand-dark">Strictly necessary</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Required for the site to work — basket, checkout, account session, and cookie preference.
                    Always active.
                  </p>
                </div>
                <div className="flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                    Always on
                  </span>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-brand-dark">Analytics</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Helps us understand how visitors use our site so we can improve it. Not currently active.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={prefs.analytics}
                  onClick={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))}
                  className={`flex-shrink-0 mt-0.5 relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    prefs.analytics ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle analytics cookies"
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      prefs.analytics ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-brand-dark">Marketing</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Used to measure advertising performance and show relevant adverts. Not currently active.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={prefs.marketing}
                  onClick={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))}
                  className={`flex-shrink-0 mt-0.5 relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    prefs.marketing ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle marketing cookies"
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      prefs.marketing ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-end">
              <button
                onClick={declineAll}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-800 transition-colors"
              >
                Decline all
              </button>
              <button
                onClick={saveCustom}
                className="px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
