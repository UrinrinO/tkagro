/**
 * TKAG-24 — Skin Concerns landing pages
 * Static copy and metadata for each skin concern.
 */

export type SkinConcernSlug =
  | 'acne'
  | 'hyperpigmentation'
  | 'excess_oil'
  | 'dry_skin'
  | 'uneven_tone'
  | 'sensitive';

export interface SkinConcern {
  slug: SkinConcernSlug;
  name: string;
  shortDescription: string;
  heroDescription: string;
  metaDescription: string;
  /** Relative path inside src/assets/images/aesthetics/ */
  imagePath: string;
  whyItWorks: string[];
}

export const SKIN_CONCERNS: SkinConcern[] = [
  {
    slug: 'acne',
    name: 'Acne',
    shortDescription:
      'Targeted formulas that clear existing breakouts and prevent new ones from forming.',
    heroDescription:
      'Products formulated to clear and prevent breakouts using nature-powered actives.',
    metaDescription:
      'Shop T.kays Agrocosmetics acne-fighting skincare. Natural, botanically-powered formulas that clear breakouts and prevent future blemishes.',
    imagePath: 'acne-concern.jpg',
    whyItWorks: [
      'Plant-derived antibacterials like tea tree and neem target acne-causing bacteria without stripping the skin barrier.',
      'Gentle exfoliating acids (AHA/BHA) unclog pores and reduce post-acne marks over time.',
      'Lightweight, non-comedogenic hydrators keep skin balanced so it does not overproduce sebum.',
    ],
  },
  {
    slug: 'hyperpigmentation',
    name: 'Hyperpigmentation',
    shortDescription:
      'Brighten dark spots and even out skin tone with botanical actives.',
    heroDescription:
      'Products formulated to fade dark spots and restore a luminous, even complexion.',
    metaDescription:
      'Discover T.kays Agrocosmetics hyperpigmentation solutions. Botanical brightening actives that fade dark spots and deliver a radiant, even skin tone.',
    imagePath: 'hyperpigmentation-concern.jpg',
    whyItWorks: [
      'Vitamin C and kojic acid derived from natural sources inhibit melanin production at the source.',
      'Consistent use of brightening serums visibly reduces the appearance of dark spots within 4–8 weeks.',
      'Antioxidant-rich botanicals protect against UV-triggered pigmentation and environmental stressors.',
    ],
  },
  {
    slug: 'excess_oil',
    name: 'Excess Oil',
    shortDescription:
      'Balance sebum production for a shine-free, healthy-looking complexion.',
    heroDescription:
      'Products formulated to regulate oil production and keep skin fresh all day.',
    metaDescription:
      'Control excess oil with T.kays Agrocosmetics. Balancing botanical formulas that mattify skin and regulate sebum without over-drying.',
    imagePath: 'excess-oil-concern.jpg',
    whyItWorks: [
      'Kaolin clay and green tea extract absorb excess sebum while maintaining the skin\'s natural moisture balance.',
      'Niacinamide (vitamin B3) regulates oil gland activity and visibly minimises pore appearance.',
      'Lightweight, water-based formulas hydrate without adding grease, breaking the dry-then-oily cycle.',
    ],
  },
  {
    slug: 'dry_skin',
    name: 'Dry Skin',
    shortDescription:
      'Deep, lasting hydration that restores softness and strengthens the skin barrier.',
    heroDescription:
      'Products formulated to deeply nourish dry skin and lock in lasting moisture.',
    metaDescription:
      'Relieve dry skin with T.kays Agrocosmetics. Rich botanical formulas that restore moisture, repair the skin barrier, and leave skin soft and supple.',
    imagePath: 'dry-skin-concern.jpg',
    whyItWorks: [
      'Shea butter and marula oil provide occlusive and emollient benefits, sealing moisture into the skin.',
      'Hyaluronic acid draws water into the skin from the environment, delivering multi-layer hydration.',
      'Ceramide-supporting plant extracts reinforce the skin barrier to prevent transepidermal water loss.',
    ],
  },
  {
    slug: 'uneven_tone',
    name: 'Uneven Skin Tone',
    shortDescription:
      'Reveal a smoother, more radiant complexion with tone-correcting botanicals.',
    heroDescription:
      'Products formulated to correct uneven skin tone and restore natural radiance.',
    metaDescription:
      'Even your skin tone with T.kays Agrocosmetics. Tone-correcting botanical formulas that smooth texture, brighten dullness, and reveal radiant skin.',
    imagePath: 'uneven-tone-concern.jpg',
    whyItWorks: [
      'Alpha-arbutin and licorice root extract work synergistically to reduce discolouration and promote clarity.',
      'Regular exfoliation with fruit enzymes removes dull surface cells, revealing brighter skin underneath.',
      'Antioxidant blends neutralise free radicals that contribute to uneven pigmentation and premature ageing.',
    ],
  },
  {
    slug: 'sensitive',
    name: 'Sensitive Skin',
    shortDescription:
      'Calming, fragrance-free formulas that soothe redness and strengthen delicate skin.',
    heroDescription:
      'Products formulated to calm reactive skin and rebuild a resilient, comfortable barrier.',
    metaDescription:
      'Soothe sensitive skin with T.kays Agrocosmetics. Gentle, fragrance-free botanical formulas that reduce redness, calm irritation, and strengthen the skin barrier.',
    imagePath: 'sensitive-concern.jpg',
    whyItWorks: [
      'Centella asiatica and oat extract deliver proven anti-inflammatory benefits that visibly reduce redness and irritation.',
      'All formulas are free from synthetic fragrance, sulphates, and known irritants — safe for reactive and allergy-prone skin.',
      'Barrier-repairing ingredients like panthenol and ceramides rebuild the skin\'s protective layer for long-term resilience.',
    ],
  },
];

/** Convenience map for O(1) lookup by slug */
export const SKIN_CONCERNS_MAP: Record<SkinConcernSlug, SkinConcern> =
  SKIN_CONCERNS.reduce(
    (acc, concern) => ({ ...acc, [concern.slug]: concern }),
    {} as Record<SkinConcernSlug, SkinConcern>,
  );