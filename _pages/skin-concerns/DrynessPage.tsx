'use client';
/**
 * DrynessPage.tsx
 * TKAG-9: Dryness & Dehydration skin concern landing page
 *
 * SEO target keywords: dry skin treatment, natural moisturiser, organic hydration,
 * botanical dry skin solutions, dehydrated skin care
 */

import React from "react";
import SkinConcernPage from "./SkinConcernPage";
import type { Ingredient } from "./SkinConcernPage";

const INGREDIENTS: Ingredient[] = [
  {
    name: "Shea Butter",
    description:
      "Unrefined, organic shea butter is nature's most effective emollient. Rich in fatty acids and vitamins A and E, it creates a protective barrier on the skin's surface that locks in moisture for hours, leaving even the driest skin feeling soft and nourished.",
  },
  {
    name: "Baobab Oil",
    description:
      "Sourced from the iconic African baobab tree, this lightweight yet deeply nourishing oil is packed with omega-3, -6, and -9 fatty acids. It absorbs quickly without greasiness, replenishing the skin's lipid barrier and improving elasticity over time.",
  },
  {
    name: "Aloe Vera",
    description:
      "Beyond its soothing properties, organic aloe vera is a powerful humectant — drawing moisture from the environment into the skin. It provides immediate relief to tight, uncomfortable dry skin while supporting long-term hydration levels.",
  },
  {
    name: "Rosehip Seed Oil",
    description:
      "Cold-pressed rosehip oil is exceptionally rich in essential fatty acids and natural vitamin A, which help to repair the skin's moisture barrier and reduce the appearance of dry patches, rough texture, and flakiness with regular use.",
  },
];

const EDUCATION_PARAGRAPHS = [
  "Dry skin occurs when the skin lacks sufficient moisture in its outer layer, known as the stratum corneum. This can be caused by environmental factors such as cold weather, low humidity, and excessive sun exposure, as well as lifestyle habits like hot showers, harsh soaps, and inadequate water intake. Genetically, some people simply produce less sebum — the skin's natural oil — making them more prone to dryness throughout their lives.",
  "The difference between dry skin and dehydrated skin is important to understand. Dry skin is a skin type characterised by a lack of oil, while dehydrated skin is a temporary condition caused by a lack of water. Both can cause tightness, flakiness, and a dull complexion, but they respond best to different treatments. Our natural skincare range addresses both concerns with organic ingredients that provide both oil-based nourishment and water-binding hydration.",
  "Building a consistent moisturising routine with the right organic ingredients is the most effective way to manage dry and dehydrated skin. Look for products containing natural emollients like shea butter and plant oils, combined with humectants like aloe vera, to both attract and seal in moisture. Our botanical formulas are free from synthetic fragrances and harsh preservatives that can further compromise a compromised moisture barrier.",
];

const DrynessPage: React.FC = () => {
  return (
    <SkinConcernPage
      pageTitle="Dry Skin Skincare Solutions | T.kays Agrocosmetics"
      metaDescription="Find natural, organic solutions for dry and dehydrated skin at T.kays Agrocosmetics. Shea butter, baobab oil, and botanical humectants restore lasting moisture."
      ogImage="/images/og/dryness-skincare.jpg"
      heroTitle="Deep Hydration for Dry, Thirsty Skin"
      heroDescription="Restore your skin's natural moisture balance with rich botanical emollients and organic humectants that nourish from within and protect all day long."
      heroBackgroundImage="/images/concerns/dryness-hero.jpg"
      educationHeading="Understanding Dryness & Dehydration"
      educationParagraphs={EDUCATION_PARAGRAPHS}
      ingredients={INGREDIENTS}
      concernTag="dryness"
      concernLabel="Dryness & Dehydration"
    />
  );
};

export default DrynessPage;