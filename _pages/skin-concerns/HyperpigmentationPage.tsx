'use client';
/**
 * HyperpigmentationPage.tsx
 * TKAG-9: Hyperpigmentation & Dark Spots skin concern landing page
 *
 * SEO target keywords: hyperpigmentation treatment, natural dark spot removal,
 * organic brightening skincare, botanical even skin tone, natural pigmentation solutions
 */

import React from "react";
import SkinConcernPage from "./SkinConcernPage";
import type { Ingredient } from "./SkinConcernPage";

const INGREDIENTS: Ingredient[] = [
  {
    name: "Turmeric Extract",
    description:
      "Organic turmeric contains curcumin, a potent antioxidant and anti-inflammatory compound that inhibits melanin production and helps fade existing dark spots. Used in traditional Ayurvedic and African skincare for centuries, turmeric brightens the complexion and evens skin tone naturally.",
  },
  {
    name: "Vitamin C",
    description:
      "A gold-standard brightening ingredient, natural vitamin C inhibits the enzyme tyrosinase — the key driver of melanin production — helping to prevent new dark spots from forming while gradually fading existing ones. It also provides powerful antioxidant protection against UV-induced pigmentation.",
  },
  {
    name: "Kojic Acid (from Fermented Rice)",
    description:
      "Derived from the natural fermentation of rice, kojic acid is a gentle yet effective melanin inhibitor that helps to lighten post-inflammatory hyperpigmentation, sun spots, and melasma. Unlike synthetic lightening agents, it works gradually and safely without bleaching or damaging the skin.",
  },
  {
    name: "Rosehip Oil",
    description:
      "Rich in natural trans-retinoic acid and vitamin C, cold-pressed rosehip oil accelerates skin cell turnover, helping to fade dark spots and post-blemish marks more quickly. Its essential fatty acids also help to repair the skin barrier and improve overall skin texture and radiance.",
  },
];

const EDUCATION_PARAGRAPHS = [
  "Hyperpigmentation is a common skin condition characterised by patches of skin that appear darker than the surrounding area. It occurs when melanocytes — the cells responsible for producing skin pigment — become overactive and produce excess melanin. This can be triggered by sun exposure (causing sunspots or solar lentigines), hormonal changes (causing melasma), or post-inflammatory responses following acne, eczema, or skin injuries (causing post-inflammatory hyperpigmentation, or PIH).",
  "While hyperpigmentation is harmless, it can significantly affect confidence and self-esteem. Many conventional treatments rely on harsh bleaching agents like hydroquinone, which can cause irritation and long-term skin damage with extended use. Natural, organic brightening ingredients offer a safer, gentler alternative — working with your skin's biology to gradually reduce melanin production and accelerate the turnover of pigmented skin cells without compromising skin health.",
  "Consistent sun protection is essential when treating hyperpigmentation, as UV exposure is the primary trigger for melanin overproduction. Combining a broad-spectrum natural SPF with our organic brightening formulas will give you the best results. Patience is also key — natural brightening takes time, but the results are sustainable and achieved without the risks associated with synthetic lightening agents.",
];

const HyperpigmentationPage: React.FC = () => {
  return (
    <SkinConcernPage
      pageTitle="Hyperpigmentation Skincare Solutions | T.kays Agrocosmetics"
      metaDescription="Natural, organic solutions for hyperpigmentation and dark spots from T.kays Agrocosmetics. Turmeric, vitamin C, and botanical brighteners reveal a more even, radiant complexion."
      ogImage="/images/og/hyperpigmentation-skincare.jpg"
      heroTitle="Reveal a Brighter, More Even Complexion"
      heroDescription="Harness the brightening power of organic turmeric, vitamin C, and botanical melanin inhibitors to gently fade dark spots and restore your skin's natural radiance."
      heroBackgroundImage="/images/concerns/hyperpigmentation-hero.jpg"
      educationHeading="Understanding Hyperpigmentation & Dark Spots"
      educationParagraphs={EDUCATION_PARAGRAPHS}
      ingredients={INGREDIENTS}
      concernTag="hyperpigmentation"
      concernLabel="Hyperpigmentation & Dark Spots"
    />
  );
};

export default HyperpigmentationPage;