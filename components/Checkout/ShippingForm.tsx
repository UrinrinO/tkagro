'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../../hooks/useCart';

const API_URL = '';

export interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
}

export interface ShippingRate {
  zoneId: string;
  zoneName: string;
  basePrice: number;
  pricePerGram: number;
  estimatedDays: string;
  totalWeightGrams: number;
  shippingCost: number;
  isFree: boolean;
}

interface ShippingFormProps {
  onSubmit: (data: ShippingData, rate: ShippingRate | null) => void;
  initialData?: Partial<ShippingData>;
}

// Grouped countries by zone for a clear dropdown
const COUNTRIES: { zone: string; options: { code: string; label: string }[] }[] = [
  {
    zone: '🇬🇧 United Kingdom',
    options: [
      { code: 'GB', label: 'United Kingdom' },
      { code: 'GG', label: 'Guernsey' },
      { code: 'JE', label: 'Jersey' },
      { code: 'IM', label: 'Isle of Man' },
    ],
  },
  {
    zone: '🌍 Europe',
    options: [
      { code: 'IE', label: 'Ireland' },
      { code: 'FR', label: 'France' },
      { code: 'DE', label: 'Germany' },
      { code: 'IT', label: 'Italy' },
      { code: 'ES', label: 'Spain' },
      { code: 'PT', label: 'Portugal' },
      { code: 'NL', label: 'Netherlands' },
      { code: 'BE', label: 'Belgium' },
      { code: 'CH', label: 'Switzerland' },
      { code: 'AT', label: 'Austria' },
      { code: 'SE', label: 'Sweden' },
      { code: 'NO', label: 'Norway' },
      { code: 'DK', label: 'Denmark' },
      { code: 'FI', label: 'Finland' },
      { code: 'PL', label: 'Poland' },
      { code: 'GR', label: 'Greece' },
      { code: 'CZ', label: 'Czech Republic' },
      { code: 'HU', label: 'Hungary' },
      { code: 'RO', label: 'Romania' },
      { code: 'BG', label: 'Bulgaria' },
      { code: 'HR', label: 'Croatia' },
      { code: 'SK', label: 'Slovakia' },
      { code: 'SI', label: 'Slovenia' },
      { code: 'EE', label: 'Estonia' },
      { code: 'LV', label: 'Latvia' },
      { code: 'LT', label: 'Lithuania' },
      { code: 'LU', label: 'Luxembourg' },
      { code: 'MT', label: 'Malta' },
      { code: 'CY', label: 'Cyprus' },
      { code: 'IS', label: 'Iceland' },
      { code: 'TR', label: 'Turkey' },
    ],
  },
  {
    zone: '🌍 Africa',
    options: [
      { code: 'NG', label: 'Nigeria' },
      { code: 'GH', label: 'Ghana' },
      { code: 'ZA', label: 'South Africa' },
      { code: 'KE', label: 'Kenya' },
      { code: 'ET', label: 'Ethiopia' },
      { code: 'TZ', label: 'Tanzania' },
      { code: 'EG', label: 'Egypt' },
      { code: 'UG', label: 'Uganda' },
      { code: 'CM', label: 'Cameroon' },
      { code: 'SN', label: 'Senegal' },
      { code: 'CI', label: "Côte d'Ivoire" },
      { code: 'MA', label: 'Morocco' },
      { code: 'TN', label: 'Tunisia' },
      { code: 'DZ', label: 'Algeria' },
      { code: 'ZM', label: 'Zambia' },
      { code: 'ZW', label: 'Zimbabwe' },
      { code: 'RW', label: 'Rwanda' },
      { code: 'GN', label: 'Guinea' },
      { code: 'ML', label: 'Mali' },
      { code: 'MZ', label: 'Mozambique' },
      { code: 'AO', label: 'Angola' },
      { code: 'MU', label: 'Mauritius' },
    ],
  },
  {
    zone: '🌏 Rest of World',
    options: [
      { code: 'US', label: 'United States' },
      { code: 'CA', label: 'Canada' },
      { code: 'AU', label: 'Australia' },
      { code: 'NZ', label: 'New Zealand' },
      { code: 'JP', label: 'Japan' },
      { code: 'SG', label: 'Singapore' },
      { code: 'AE', label: 'United Arab Emirates' },
      { code: 'SA', label: 'Saudi Arabia' },
      { code: 'IN', label: 'India' },
      { code: 'BR', label: 'Brazil' },
    ],
  },
];

const EMPTY_FORM: ShippingData = {
  firstName: '', lastName: '', email: '', phone: '',
  addressLine1: '', addressLine2: '', city: '', county: '',
  postcode: '', country: 'GB',
};

export const ShippingForm: React.FC<ShippingFormProps> = ({ onSubmit, initialData = {} }) => {
  const { items } = useCart();
  const [formData, setFormData] = useState<ShippingData>({ ...EMPTY_FORM, ...initialData });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingData, string>>>({});
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
  const [freeAbove, setFreeAbove] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  const calculateShipping = useCallback(async (country: string) => {
    if (!country || items.length === 0) { setShippingRate(null); return; }
    setRateLoading(true);
    try {
      const apiItems = items.map((i) => ({ id: i.product.id, quantity: i.quantity }));
      const res = await fetch(`${API_URL}/api/shipping/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, items: apiItems }),
      });
      const json = await res.json();
      if (json.success) {
        setShippingRate(json.data.rate);
        setFreeAbove(json.data.freeAbove ?? null);
      }
    } catch { /* silently skip if shipping API unavailable */ }
    finally { setRateLoading(false); }
  }, [items]);

  useEffect(() => { calculateShipping(formData.country); }, [formData.country, calculateShipping]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ShippingData]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof ShippingData, string>> = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Enter a valid email address';
    if (!formData.addressLine1.trim()) e.addressLine1 = 'Address is required';
    if (!formData.city.trim()) e.city = 'City is required';
    if (!formData.postcode.trim()) e.postcode = 'Postcode is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onSubmit(formData, shippingRate);
  };

  return (
    <form className="shipping-form" onSubmit={handleSubmit} noValidate>
      <h3 className="shipping-form__title">Delivery Information</h3>

      {/* Name */}
      <div className="shipping-form__row">
        <div className="shipping-form__field">
          <label className="shipping-form__label" htmlFor="firstName">First Name *</label>
          <input id="firstName" name="firstName" type="text"
            className={`shipping-form__input ${errors.firstName ? 'shipping-form__input--error' : ''}`}
            value={formData.firstName} onChange={handleChange} autoComplete="given-name" />
          {errors.firstName && <span className="shipping-form__error" role="alert">{errors.firstName}</span>}
        </div>
        <div className="shipping-form__field">
          <label className="shipping-form__label" htmlFor="lastName">Last Name *</label>
          <input id="lastName" name="lastName" type="text"
            className={`shipping-form__input ${errors.lastName ? 'shipping-form__input--error' : ''}`}
            value={formData.lastName} onChange={handleChange} autoComplete="family-name" />
          {errors.lastName && <span className="shipping-form__error" role="alert">{errors.lastName}</span>}
        </div>
      </div>

      {/* Email + Phone */}
      <div className="shipping-form__row">
        <div className="shipping-form__field">
          <label className="shipping-form__label" htmlFor="email">Email *</label>
          <input id="email" name="email" type="email"
            className={`shipping-form__input ${errors.email ? 'shipping-form__input--error' : ''}`}
            value={formData.email} onChange={handleChange} autoComplete="email" />
          {errors.email && <span className="shipping-form__error" role="alert">{errors.email}</span>}
        </div>
        <div className="shipping-form__field">
          <label className="shipping-form__label" htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" className="shipping-form__input"
            value={formData.phone} onChange={handleChange} autoComplete="tel" />
        </div>
      </div>

      {/* Address */}
      <div className="shipping-form__field">
        <label className="shipping-form__label" htmlFor="addressLine1">Address *</label>
        <input id="addressLine1" name="addressLine1" type="text"
          className={`shipping-form__input ${errors.addressLine1 ? 'shipping-form__input--error' : ''}`}
          value={formData.addressLine1} onChange={handleChange} autoComplete="address-line1" />
        {errors.addressLine1 && <span className="shipping-form__error" role="alert">{errors.addressLine1}</span>}
      </div>
      <div className="shipping-form__field">
        <label className="shipping-form__label" htmlFor="addressLine2">Address Line 2</label>
        <input id="addressLine2" name="addressLine2" type="text" className="shipping-form__input"
          value={formData.addressLine2} onChange={handleChange} autoComplete="address-line2" />
      </div>

      {/* City + County */}
      <div className="shipping-form__row">
        <div className="shipping-form__field">
          <label className="shipping-form__label" htmlFor="city">City *</label>
          <input id="city" name="city" type="text"
            className={`shipping-form__input ${errors.city ? 'shipping-form__input--error' : ''}`}
            value={formData.city} onChange={handleChange} autoComplete="address-level2" />
          {errors.city && <span className="shipping-form__error" role="alert">{errors.city}</span>}
        </div>
        <div className="shipping-form__field">
          <label className="shipping-form__label" htmlFor="county">County / State</label>
          <input id="county" name="county" type="text" className="shipping-form__input"
            value={formData.county} onChange={handleChange} autoComplete="address-level1" />
        </div>
      </div>

      {/* Postcode + Country */}
      <div className="shipping-form__row">
        <div className="shipping-form__field">
          <label className="shipping-form__label" htmlFor="postcode">Postcode *</label>
          <input id="postcode" name="postcode" type="text"
            className={`shipping-form__input ${errors.postcode ? 'shipping-form__input--error' : ''}`}
            value={formData.postcode} onChange={handleChange} autoComplete="postal-code" />
          {errors.postcode && <span className="shipping-form__error" role="alert">{errors.postcode}</span>}
        </div>
        <div className="shipping-form__field">
          <label className="shipping-form__label" htmlFor="country">Country</label>
          <select id="country" name="country" className="shipping-form__input shipping-form__select"
            value={formData.country} onChange={handleChange} autoComplete="country">
            {COUNTRIES.map(({ zone, options }) => (
              <optgroup key={zone} label={zone}>
                {options.map(({ code, label }) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* ── Live shipping rate display ── */}
      <div className="shipping-form__rate-box">
        {rateLoading ? (
          <div className="shipping-form__rate shipping-form__rate--loading">
            <div className="shipping-form__rate-spinner" />
            <span>Calculating shipping…</span>
          </div>
        ) : shippingRate ? (
          <div className="shipping-form__rate">
            <div className="shipping-form__rate-header">
              <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <span className="shipping-form__rate-zone">{shippingRate.zoneName}</span>
              <span className="shipping-form__rate-price">
                {shippingRate.shippingCost === 0 ? 'FREE' : `£${shippingRate.shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="shipping-form__rate-details">
              <span>{shippingRate.estimatedDays}</span>
              {shippingRate.totalWeightGrams > 0 && (
                <span>· {shippingRate.totalWeightGrams}g total</span>
              )}
              {freeAbove && shippingRate.shippingCost > 0 && (
                <span className="shipping-form__rate-nudge">
                  · Free shipping on orders over £{freeAbove.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <button type="submit" className="btn-primary shipping-form__submit">
        Continue to Payment
      </button>
    </form>
  );
};

export default ShippingForm;
