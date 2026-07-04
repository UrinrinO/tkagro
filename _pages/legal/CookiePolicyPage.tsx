'use client';
import React from 'react';
import PageSEO from '../../components/SEO/PageSEO';
import LegalShell from './LegalShell';

const CookiePolicyPage: React.FC = () => (
  <>
    <PageSEO
      title="Cookie Policy"
      description="How T.kays Agrocosmetics uses cookies and similar technologies on our website."
      canonicalPath="/cookies"
    />
    <LegalShell title="Cookie Policy" lastUpdated="June 2026">

      <p>
        This Cookie Policy explains how T.kays Agrocosmetics uses cookies and similar technologies on our
        website. By using our website, you may be asked to accept, reject, or manage cookies through the
        banner displayed on your first visit.
      </p>
      <p>
        We use cookies to help our website work properly, improve your shopping experience, and understand
        how visitors use our website. We will not use optional analytics or marketing cookies unless you
        have given consent.
      </p>

      <h2>What Are Cookies?</h2>
      <p>
        Cookies are small text files placed on your device when you visit a website. They help the website
        remember information about your visit, such as your preferences, login status, cart contents,
        browsing activity, or cookie choices.
      </p>
      <p>
        Similar technologies may include pixels, tags, scripts, local storage, tracking links, and device
        identifiers. Some of the technologies we use (such as cart storage and session tokens) rely on
        browser localStorage rather than cookies, but serve a similar purpose.
      </p>

      <h2>Why We Use Cookies</h2>
      <p>We use cookies and similar technologies to:</p>
      <ul>
        <li>Make the website function correctly</li>
        <li>Remember items in your shopping basket</li>
        <li>Keep your account session secure</li>
        <li>Process checkout and payment functions</li>
        <li>Remember your cookie preferences</li>
        <li>Understand website traffic and visitor behaviour (where consent is given)</li>
        <li>Measure marketing performance (where consent is given)</li>
      </ul>

      <h2>Types of Cookies We Use</h2>

      <h3>Strictly Necessary Cookies</h3>
      <p>
        These cookies are essential for the website to work. They allow core functions such as page
        navigation, checkout, shopping basket, account login, payment security, fraud prevention, and
        cookie preference storage. These cookies cannot be switched off because the website would not work
        properly without them.
      </p>

      <h3>Analytics Cookies</h3>
      <p>
        Analytics cookies help us understand how visitors use our website — which pages are visited most,
        how visitors find us, and how long they stay. We do not currently use analytics cookies. If we add
        analytics tools in the future, this policy will be updated and consent will be requested before
        those tools are activated.
      </p>

      <h3>Marketing and Advertising Cookies</h3>
      <p>
        Marketing cookies help us measure advertising performance and show relevant adverts to people who
        may be interested in T.kays Agrocosmetics. We do not currently use marketing or advertising cookies.
        If we introduce advertising tools in the future, this policy will be updated and consent will be
        requested before those tools are activated.
      </p>

      <h3>Functionality Cookies</h3>
      <p>
        Functionality cookies help us remember your preferences and improve your experience. Current
        functionality storage on our website is handled by strictly necessary mechanisms.
      </p>

      <h2>Cookie Table</h2>
      <p>
        The table below lists the cookies and similar technologies currently used on the T.kays
        Agrocosmetics website. All cookies currently in use are strictly necessary for the website to
        function. We do not use analytics or marketing cookies at this time.
      </p>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Provider</th>
            <th>Category</th>
            <th>Purpose</th>
            <th>Duration</th>
            <th>Consent</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>tkays_cookie_consent</code></td>
            <td>T.kays Agrocosmetics</td>
            <td>Strictly necessary</td>
            <td>Stores your choice to accept or decline cookies so the consent banner does not reappear on every visit</td>
            <td>12 months</td>
            <td>No</td>
          </tr>
          <tr>
            <td><code>tkagro_cart</code></td>
            <td>T.kays Agrocosmetics</td>
            <td>Strictly necessary</td>
            <td>Saves your shopping basket contents between pages using browser localStorage so items are not lost while you browse</td>
            <td>Until cleared or browser storage is reset</td>
            <td>No</td>
          </tr>
          <tr>
            <td><code>sb-[ref]-auth-token</code></td>
            <td>Supabase</td>
            <td>Strictly necessary</td>
            <td>Maintains your logged-in account session securely using Supabase authentication</td>
            <td>Session (cleared on logout or after inactivity)</td>
            <td>No</td>
          </tr>
          <tr>
            <td><code>__stripe_mid</code></td>
            <td>Stripe</td>
            <td>Strictly necessary</td>
            <td>Used by Stripe during checkout for device identification and fraud prevention</td>
            <td>1 year</td>
            <td>No (required for payment)</td>
          </tr>
          <tr>
            <td><code>__stripe_sid</code></td>
            <td>Stripe</td>
            <td>Strictly necessary</td>
            <td>Used by Stripe during checkout to identify the current browsing session for fraud prevention</td>
            <td>30 minutes</td>
            <td>No (required for payment)</td>
          </tr>
        </tbody>
      </table>

      <p>
        This table will be updated whenever new tools, integrations, or tracking technologies are added
        to the website. Consent will be requested for any new non-essential cookies before they are
        activated.
      </p>

      <h2>Cookie Consent</h2>
      <p>
        When you first visit our website, a cookie banner will appear asking you to accept or decline
        optional cookies. We will not use non-essential cookies unless you have given consent. You can
        change your cookie preference at any time by clearing your browser storage and revisiting the site.
      </p>

      <h2>How to Manage Cookies</h2>
      <p>You can manage cookies in the following ways:</p>
      <ul>
        <li>Use the cookie consent banner on our website</li>
        <li>Change your browser settings to block or delete cookies</li>
        <li>Contact us if you need help understanding our cookie use</li>
      </ul>
      <p>
        Please note that blocking strictly necessary cookies may affect the function of the website,
        including checkout, basket, and account access.
      </p>

      <h2>Third Party Cookies</h2>
      <p>
        Some cookies may be placed by third party services that support our website. Currently these are
        limited to Stripe (payment processing) and Supabase (authentication and database). We do not
        control all third party cookies and you should review their privacy and cookie policies for more
        information.
      </p>

      <h2>Updates to This Cookie Policy</h2>
      <p>
        We may update this Cookie Policy if we change the cookies we use, add new website functions, use
        new advertising platforms, or change how we collect data. The latest version will always be posted
        here with the updated date.
      </p>

      <h2>Contact Us</h2>
      <p>If you have questions about this Cookie Policy, please contact:</p>
      <ul>
        <li><strong>T.kays Agrocosmetics</strong></li>
        <li>Email: info@tkayscosmetics.com</li>
        <li>Address: Cardiff, UK</li>
      </ul>

    </LegalShell>
  </>
);

export default CookiePolicyPage;
