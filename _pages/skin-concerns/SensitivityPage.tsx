'use client';
/**
 * SensitivityPage.tsx
 * TKAG-9: Sensitivity & Redness skin concern landing page
 *
 * SEO target keywords: sensitive skin care, natural sensitive skin products,
 * organic redness relief, botanical sensitive skin solutions, fragrance-free skincare
 */

import React from "react";
import SkinConcernPage from "./SkinConcernPage";
import type { Ingredient } from "./SkinConcernPage";

const INGREDIENTS: Ingredient[] = [
  {
    name: "Colloidal Oat",
    description:
      "Finely milled colloidal oatmeal is one of the most clinically validated natural ingredients for sensitive skin. It forms a protective film on the skin's surface, reduces inflammation, relieves itching, and helps restore the skin's natural pH balance — making it ideal for reactive, eczema-prone, or rosacea-affected skin.",
  },
  {
    name: "Calendula Extract",
    description:
      "Organic calendula flower extract has been used for centuries to soothe irritated skin. Rich in flavonoids and triterpenoids, it reduces redness, accelerates skin healing, and provides gentle antimicrobial protection — all without the risk of sensitisation associated with synthetic actives.",
  },
  {
    name: "Chamomile Extract",
    description:
      "German chamomile extract contains bisabolol and apigenin, two powerful anti-inflammatory compounds that calm reactive skin, reduce visible redness, and soothe discomfort. Its gentle nature makes it suitable even for the most sensitive skin types, including babies and those with rosacea.",
  },
  {
    name: "Aloe Vera",
    description:
      "Pure organic aloe vera gel provides immediate cooling relief to irritated, inflamed skin. Its natural polysaccharides form a soothing barrier that reduces transepidermal water loss, while its anti-inflammatory properties help calm redness and sensitivity over time.",
  },
];

const EDUCATION_PARAGRAPHS = [
  "Sensitive skin is characterised by a heightened reactivity to environmental triggers, skincare ingredients, and lifestyle factors. People with sensitive skin often experience redness, stinging, burning, itching, or tightness in response to products or conditions that would not affect other skin types. This reactivity is typically caused by a compromised skin barrier that allows irritants to penetrate more easily and triggers an inflammatory response.",
  "Common triggers for sensitive skin include synthetic fragrances, alcohol-based products, harsh surfactants, extreme temperatures, stress, and certain foods. Identifying and avoiding your personal triggers is an important first step, but equally important is choosing skincare products formulated with gentle, natural ingredients that support rather than compromise your skin's protective barrier. Our organic sensitive skin range is completely free from synthetic fragrances, parabens, and known irritants.",
  "Building a minimal, consistent routine is the best approach for sensitive skin. Fewer products mean fewer potential triggers, and choosing organic, botanically-derived ingredients reduces the risk of adverse reactions. Our fragrance-free, hypoallergenic formulas are designed to strengthen your skin's natural defences over time, gradually reducing reactivity and helping you achieve a calmer, more comfortable complexion.",
];

const SensitivityPage: React.FC = () => {
  return (
    <SkinConcernPage
      pageTitle="Sensitive Skin Skincare Solutions | T.kays Agrocosmetics"
      metaDescription="Gentle, natural skincare for sensitive and reactive skin from T.kays Agrocosmetics. Fragrance-free, organic formulas with calendula and colloidal oat calm redness and irritation."
      ogImage="/images/og/sensitivity-skincare.jpg"
      heroTitle="Gentle Care for Sensitive, Reactive Skin"
      heroDescription="Fragrance-free, hypoallergenic botanical formulas crafted to calm redness, soothe irritation, and strengthen your skin's natural protective barrier."
      heroBackgroundImage="/images/concerns/sensitivity-hero.jpg"
      educationHeading="Understanding Skin Sensitivity & Redness"
      educationParagraphs={EDUCATION_PARAGRAPHS}
      ingredients={INGREDIENTS}
      concernTag="sensitivity"
      concernLabel="Sensitivity & Redness"
    />
  );
};

export default SensitivityPage;