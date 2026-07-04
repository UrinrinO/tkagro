'use client';
/**
 * AgingPage.tsx
 * TKAG-9: Aging & Fine Lines skin concern landing page
 *
 * SEO target keywords: anti-aging skincare, natural anti-aging, organic wrinkle treatment,
 * botanical anti-aging solutions, natural fine lines treatment
 */

import React from "react";
import SkinConcernPage from "./SkinConcernPage";
import type { Ingredient } from "./SkinConcernPage";

const INGREDIENTS: Ingredient[] = [
  {
    name: "Rosehip Oil",
    description:
      "Cold-pressed rosehip oil is one of nature's most potent anti-aging ingredients, naturally rich in trans-retinoic acid (vitamin A) and vitamin C. It stimulates collagen production, improves skin elasticity, and visibly reduces the appearance of fine lines and wrinkles with consistent use.",
  },
  {
    name: "Moringa Oil",
    description:
      "Extracted from the seeds of the 'miracle tree', moringa oil is exceptionally rich in antioxidants including quercetin and chlorogenic acid. These powerful compounds neutralise free radicals that accelerate skin aging, while the oil's oleic acid content deeply nourishes and firms the skin.",
  },
  {
    name: "Marula Oil",
    description:
      "Prized for centuries across Africa, marula oil is rich in oleic acid and antioxidants that help to improve skin elasticity and reduce the visible signs of aging. Its lightweight texture absorbs quickly, delivering deep nourishment without clogging pores.",
  },
  {
    name: "Vitamin C (from Kakadu Plum)",
    description:
      "Natural vitamin C is a cornerstone of any anti-aging routine, essential for collagen synthesis and protection against environmental damage. Sourced from botanical extracts, our vitamin C helps brighten the complexion, reduce pigmentation, and improve overall skin texture and firmness.",
  },
];

const EDUCATION_PARAGRAPHS = [
  "Skin aging is a natural biological process influenced by both intrinsic factors — genetics, hormonal changes, and cellular metabolism — and extrinsic factors such as UV exposure, pollution, smoking, and diet. As we age, collagen and elastin production slows, skin cell turnover decreases, and the skin's ability to retain moisture diminishes. The result is the gradual appearance of fine lines, wrinkles, loss of firmness, and uneven skin tone.",
  "While aging is inevitable, the rate at which visible signs appear can be significantly influenced by the skincare choices we make. Natural, organic anti-aging skincare focuses on supporting the skin's own renewal processes rather than masking the signs of aging with synthetic fillers. Antioxidant-rich botanical oils, plant-derived retinol alternatives, and deeply nourishing emollients work together to protect existing collagen, stimulate new production, and maintain the skin's youthful resilience.",
  "At T.kays Agrocosmetics, our approach to aging is rooted in the belief that healthy skin at every age is beautiful skin. Our organic anti-aging formulas are designed to nourish, protect, and support your skin through every stage of life — helping you look and feel your best naturally, without harsh synthetic chemicals or invasive procedures.",
];

const AgingPage: React.FC = () => {
  return (
    <SkinConcernPage
      pageTitle="Anti-Aging Skincare Solutions | T.kays Agrocosmetics"
      metaDescription="Discover natural, organic anti-aging skincare from T.kays Agrocosmetics. Rosehip oil, moringa, and botanical antioxidants help reduce fine lines and restore youthful radiance."
      ogImage="/images/og/aging-skincare.jpg"
      heroTitle="Graceful Aging with Botanical Science"
      heroDescription="Support your skin's natural renewal with antioxidant-rich plant oils and organic actives that visibly firm, plump, and smooth — naturally."
      heroBackgroundImage="/images/concerns/aging-hero.jpg"
      educationHeading="Understanding Aging & Fine Lines"
      educationParagraphs={EDUCATION_PARAGRAPHS}
      ingredients={INGREDIENTS}
      concernTag="aging"
      concernLabel="Aging & Fine Lines"
    />
  );
};

export default AgingPage;