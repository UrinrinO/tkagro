/**
 * TKAG-31 — FAQ Page static content
 * Hardcoded FAQ items covering key customer topics.
 */

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-shipping-1",
    category: "Shipping",
    question: "How long does delivery take?",
    answer:
      "Standard delivery within Ghana takes 2–5 business days. For Accra and surrounding areas, we offer express delivery within 24–48 hours. International orders typically arrive within 7–14 business days depending on your location. You will receive a tracking number via email once your order has been dispatched.",
  },
  {
    id: "faq-shipping-2",
    category: "Shipping",
    question: "Do you offer free shipping?",
    answer:
      "Yes! We offer free standard shipping on all orders over GHS 200 within Ghana. For orders below this threshold, a flat shipping fee applies at checkout. International shipping rates are calculated based on destination and order weight.",
  },
  {
    id: "faq-returns-1",
    category: "Returns",
    question: "What is your return and refund policy?",
    answer:
      "We accept returns within 14 days of delivery for unopened, unused products in their original packaging. If you received a damaged or incorrect item, please contact us within 48 hours of delivery with photos and we will arrange a replacement or full refund at no cost to you. Opened products cannot be returned for hygiene reasons unless they are faulty.",
  },
  {
    id: "faq-ingredients-1",
    category: "Ingredients",
    question: "Are T.kays Agrocosmetics products natural and organic?",
    answer:
      "Yes. All our formulations are crafted with plant-derived, naturally sourced ingredients. We do not use parabens, sulphates, mineral oils, or synthetic fragrances. Many of our key ingredients — including shea butter, moringa, and baobab oil — are sourced directly from Ghanaian farmers, supporting local agriculture while delivering potent botanical benefits.",
  },
  {
    id: "faq-ingredients-2",
    category: "Ingredients",
    question: "Are your products safe for sensitive skin?",
    answer:
      "Our products are formulated to be gentle and suitable for most skin types, including sensitive skin. However, we always recommend performing a patch test before full application — apply a small amount to your inner wrist and wait 24 hours. If you have a known allergy to any botanical ingredient, please review the full ingredient list on each product page or contact us for guidance.",
  },
  {
    id: "faq-skin-concerns-1",
    category: "Skin Concerns",
    question: "Which products are best for hyperpigmentation and uneven skin tone?",
    answer:
      "Our Brightening Serum and Vitamin C Glow Cream are specifically formulated to target hyperpigmentation, dark spots, and uneven skin tone. They contain natural brightening agents such as turmeric extract, kojic acid from natural sources, and vitamin C. For best results, use consistently morning and evening alongside SPF protection during the day.",
  },
  {
    id: "faq-vhon-1",
    category: "VHON",
    question: "What is VHON and how does it relate to T.kays Agrocosmetics?",
    answer:
      "VHON (Verified Honest & Organic Naturals) is our internal quality and transparency standard. Every product bearing the VHON mark has been independently verified to contain the natural ingredients listed, with no hidden synthetic additives. It is our commitment to honest formulation — what you see on the label is exactly what is in the bottle.",
  },
  {
    id: "faq-wholesale-1",
    category: "Wholesale",
    question: "Do you offer wholesale or bulk purchasing for businesses?",
    answer:
      "Yes, we welcome wholesale enquiries from spas, salons, retailers, and wellness businesses. We offer competitive pricing tiers based on order volume, along with white-label options for select product lines. Please reach out via our Contact page using the 'Wholesale' subject option, or email us directly at wholesale@tkaysagrocosmetics.com. Our team will respond within 2 business days with a tailored quote.",
  },
  {
    id: "faq-tracking-1",
    category: "Order Tracking",
    question: "How do I track my order?",
    answer:
      "Once your order is dispatched, you will receive a confirmation email containing your tracking number and a link to our courier's tracking portal. You can also log into your account on our website and view real-time order status under 'My Orders'. If you checked out as a guest, use the tracking link in your dispatch email. If you have not received a dispatch email within 3 business days of ordering, please contact us.",
  },
  {
    id: "faq-usage-1",
    category: "Product Usage",
    question: "How should I incorporate T.kays products into my skincare routine?",
    answer:
      "For a complete routine, we recommend: (1) Cleanse with our Botanical Cleansing Gel morning and evening. (2) Apply toner or essence while skin is still damp. (3) Use targeted serums for specific concerns. (4) Seal with our Nourishing Face Cream. (5) Always finish your morning routine with SPF. Our products are designed to layer well together — start with the lightest consistency and work up to the richest. For personalised routine advice, use our Skin Concern Quiz on the homepage.",
  },
];