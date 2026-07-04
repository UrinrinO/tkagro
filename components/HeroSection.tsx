'use client';
/**
 * HeroSection — Sage-inspired editorial full-viewport hero.
 * - H1 first line forced to single line on tablet+
 * - Both the rotating concern word AND the product card cycle automatically
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./HeroSection.module.css";

import heroPoster from "../assets/images/hero.jpg";
const heroVideo = '/hero.mp4';

import productImg1 from "../assets/images/product-mockups/serum-pump-hand.png";
import productImg2 from "../assets/images/product-mockups/jar-dry-botanicals.png";
import productImg3 from "../assets/images/product-mockups/dropper-lily-guasha.png";
import productImg4 from "../assets/images/product-mockups/soap-stacked-stones.png";

const ROTATING_WORDS = [
  "every skin tone",
  "acne & blemishes",
  "hyperpigmentation",
  "dry, dull skin",
  "hair & scalp",
  "sensitive skin",
];

const PRODUCTS = [
  { img: productImg1, label: "Best Seller", name: "Botanical Glow Serum" },
  { img: productImg2, label: "New Drop", name: "Deep Moisture Body Butter" },
  { img: productImg3, label: "Top Rated", name: "Calming Face Oil" },
  { img: productImg4, label: "Fan Favourite", name: "Herbal Black Soap" },
];

const HeroSection: React.FC = () => {
  const [wordIdx, setWordIdx] = useState(0);
  const [productIdx, setProductIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const [productFading, setProductFading] = useState(false);

  // Left text: cycles every 2.8 s, 350 ms fade
  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % ROTATING_WORDS.length);
        setFading(false);
      }, 350);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  // Right product card: changes every 30 min, 700 ms fade
  useEffect(() => {
    const t = setInterval(() => {
      setProductFading(true);
      setTimeout(() => {
        setProductIdx((i) => (i + 1) % PRODUCTS.length);
        setProductFading(false);
      }, 700);
    }, 30 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const product = PRODUCTS[productIdx];

  return (
    <section className={styles.hero} aria-label="Hero">
      {/* Background image + overlay */}
      <div className={styles.bgWrap} aria-hidden="true">
        <video
          className={styles.bgImage}
          src={heroVideo}
          poster={heroPoster}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className={styles.bgOverlay} />
      </div>

      {/* Floating pill badge */}
      <div className={styles.badge} aria-label="New collection available">
        <span className={styles.badgeDot} aria-hidden="true" />
        Summer 2026 — New Drops
      </div>

      {/* Main content */}
      <div className={styles.content}>
        {/* Text column */}
        <div className={styles.textCol}>
          <span className={styles.eyebrow}>T.kays Agrocosmetics</span>

          <h1 className={styles.heading}>
            <span className={styles.headingLine1}>
              Potent African skincare for
            </span>
            <em
              className={styles.rotatingWord}
              style={{
                opacity: fading ? 0 : 1,
                transition: "opacity 0.35s ease",
              }}
            >
              {ROTATING_WORDS[wordIdx]}
            </em>
          </h1>

          <p className={styles.subheading}>
            Vegan · Herbal · Organic · Natural. Every formula rooted in
            botanical wisdom — made for every skin tone, every body.
          </p>

          <div className={styles.actions}>
            <Link href="/catalog" className={styles.ctaPrimary}>
              Shop Now
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link href="/skin-concerns" className={styles.ctaSecondary}>
              Explore Skin Concerns
            </Link>
          </div>
        </div>

        {/* Rotating product card — tablet+ only */}
        <div className={styles.productCol} aria-hidden="true">
          <div
            className={styles.productCard}
            style={{
              opacity: productFading ? 0 : 1,
              transition: "opacity 0.7s ease",
            }}
          >
            <img
              src={product.img}
              alt={product.name}
              className={styles.productImg}
              loading="lazy"
            />
            <div className={styles.productCardLabel}>
              <p>{product.label}</p>
              <p>{product.name}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
