'use client';
/**
 * AcnePage.tsx
 * TKAG-9: Acne & Breakouts skin concern landing page
 *
 * SEO target keywords: acne skincare, natural acne treatment, organic acne products,
 * botanical acne solutions, clear skin naturally
 */

import React from "react";
import SkinConcernPage from "./SkinConcernPage";
import type { Ingredient } from "./SkinConcernPage";

const INGREDIENTS: Ingredient[] = [
  {
    name: "Tea Tree Oil",
    description:
      "A powerful natural antiseptic with proven antibacterial properties, tea tree oil targets acne-causing bacteria without the harshness of synthetic chemicals. It helps reduce inflammation and prevent future breakouts while keeping skin balanced.",
  },
  {
    name: "Neem Leaf Extract",
    description:
      "Used for centuries in traditional wellness practices, organic neem is rich in nimbidin and nimbin — compounds that fight bacteria, reduce sebum production, and calm inflamed skin. It is a cornerstone of our acne-fighting formulas.",
  },
  {
    name: "Kaolin Clay",
    description:
      "This gentle white clay draws out excess oil and impurities from deep within pores without over-drying the skin. Regular use helps minimise the appearance of pores and keeps breakouts at bay, making it ideal for oily and combination skin types.",
  },
  {
    name: "Aloe Vera",
    description:
      "Pure organic aloe vera provides instant soothing relief to inflamed blemishes while delivering lightweight hydration. Its natural salicylic acid content gently exfoliates dead skin cells, helping to prevent clogged pores and post-acne scarring.",
  },
];

const EDUCATION_PARAGRAPHS = [
  "Acne is one of the most common skin concerns, affecting people of all ages and skin types. It occurs when hair follicles become clogged with excess sebum, dead skin cells, and bacteria — leading to blackheads, whiteheads, pimples, and in more severe cases, cysts. While hormonal fluctuations, stress, and diet can all play a role, the right natural skincare routine can make a significant difference in managing breakouts and preventing new ones from forming.",
  "Many conventional acne treatments rely on harsh synthetic ingredients that strip the skin's natural moisture barrier, leading to dryness, irritation, and sometimes even more breakouts. At T.kays Agrocosmetics, we believe in a gentler, more holistic approach — using organic botanical ingredients that work with your skin's natural processes rather than against them. Our natural acne solutions are formulated to reduce bacteria, regulate oil production, and calm inflammation without compromising your skin's health.",
  "Consistency is key when treating acne naturally. A simple routine of gentle cleansing, targeted treatment, and non-comedogenic moisturising — combined with our organic acne-fighting botanicals — can help you achieve clearer, calmer skin over time. We recommend introducing new products gradually and giving your skin at least four to six weeks to respond before assessing results.",
];

const AcnePage: React.FC = () => {
  return (
    <SkinConcernPage
      pageTitle="Acne Skincare Solutions | T.kays Agrocosmetics"
      metaDescription="Discover natural, organic acne skincare solutions from T.kays Agrocosmetics. Botanical ingredients like tea tree and neem help clear breakouts gently and effectively."
      ogImage="/images/og/acne-skincare.jpg"
      heroTitle="Natural Solutions for Acne-Prone Skin"
      heroDescription="Harness the power of organic botanicals to calm breakouts, balance oil production, and restore your skin's natural clarity — without harsh chemicals."
      heroBackgroundImage="/images/concerns/acne-hero.jpg"
      educationHeading="Understanding Acne"
      educationParagraphs={EDUCATION_PARAGRAPHS}
      ingredients={INGREDIENTS}
      concernTag="acne"
      concernLabel="Acne & Breakouts"
    />
  );
};

export default AcnePage;