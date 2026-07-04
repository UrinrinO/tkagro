'use client';
/**
 * TKAG-25 — Ingredients transparency page
 * Route: /ingredients
 *
 * Displays T.kays Agrocosmetics ingredient library with filter tabs,
 * ingredient cards, detail modal, and a brand transparency section.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Ingredient, IngredientType, FilterTab } from '@/types/ingredient';
import { useIngredients } from '@/hooks/useIngredients';
import styles from './IngredientsPage.module.css';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FILTER_TABS: FilterTab[] = [
  { label: 'All Ingredients', value: 'all' },
  { label: 'Traditional African', value: 'traditional_african' },
  { label: 'Natural', value: 'natural' },
  { label: 'Organic', value: 'organic' },
  { label: 'Herbal', value: 'herbal' },
  { label: 'Vegan', value: 'vegan' },
];

/** Human-readable labels for type badges */
const TYPE_LABELS: Record<IngredientType, string> = {
  traditional_african: 'Traditional African',
  natural: 'Natural',
  organic: 'Organic',
  herbal: 'Herbal',
  vegan: 'Vegan',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface TypeBadgeProps {
  type: IngredientType;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => (
  <span className={`${styles.badge} ${styles[`badge_${type}`]}`}>
    {TYPE_LABELS[type]}
  </span>
);

// ---------------------------------------------------------------------------

interface IngredientCardProps {
  ingredient: Ingredient;
  onClick: (ingredient: Ingredient) => void;
}

const IngredientCard: React.FC<IngredientCardProps> = ({ ingredient, onClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(ingredient);
    }
  };

  return (
    <article
      className={styles.card}
      onClick={() => onClick(ingredient)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${ingredient.name}`}
    >
      {/* Decorative botanical accent */}
      <div className={styles.cardAccent} aria-hidden="true" />

      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardName}>{ingredient.name}</h3>
          <TypeBadge type={ingredient.type} />
        </div>

        <p className={styles.cardOrigin}>
          <span className={styles.originLabel}>Origin:</span> {ingredient.origin}
        </p>

        <p className={styles.cardDescription}>{ingredient.description}</p>

        <span className={styles.cardCta} aria-hidden="true">
          Learn more →
        </span>
      </div>
    </article>
  );
};

// ---------------------------------------------------------------------------

interface IngredientModalProps {
  ingredient: Ingredient;
  onClose: () => void;
}

const IngredientModal: React.FC<IngredientModalProps> = ({ ingredient, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()} // Prevent overlay click from closing when clicking inside
      >
        <button
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Close ingredient detail"
        >
          ✕
        </button>

        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>
            {ingredient.name}
          </h2>
          <TypeBadge type={ingredient.type} />
        </div>

        <p className={styles.modalOrigin}>
          <strong>Origin:</strong> {ingredient.origin}
        </p>

        <p className={styles.modalDescription}>{ingredient.description}</p>

        {ingredient.detail && (
          <div className={styles.modalDetail}>
            <h4 className={styles.modalDetailHeading}>About this ingredient</h4>
            <p>{ingredient.detail}</p>
          </div>
        )}

        {ingredient.benefits && ingredient.benefits.length > 0 && (
          <div className={styles.modalBenefits}>
            <h4 className={styles.modalDetailHeading}>Key Benefits</h4>
            <ul className={styles.benefitsList}>
              {ingredient.benefits.map((benefit, index) => (
                <li key={index} className={styles.benefitItem}>
                  <span className={styles.benefitDot} aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

const SkeletonCard: React.FC = () => (
  <div className={styles.skeletonCard} aria-hidden="true">
    <div className={styles.skeletonLine} style={{ width: '60%', height: '1.25rem' }} />
    <div className={styles.skeletonLine} style={{ width: '30%', height: '1rem', marginTop: '0.5rem' }} />
    <div className={styles.skeletonLine} style={{ width: '40%', height: '0.875rem', marginTop: '0.75rem' }} />
    <div className={styles.skeletonLine} style={{ width: '100%', height: '0.875rem', marginTop: '0.75rem' }} />
    <div className={styles.skeletonLine} style={{ width: '85%', height: '0.875rem', marginTop: '0.375rem' }} />
  </div>
);

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

const IngredientsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  // Derive active filter from URL query param — default to 'all'
  const rawType = searchParams.get('type') as IngredientType | 'all' | null;
  const activeFilter: IngredientType | 'all' = rawType ?? 'all';

  const { ingredients, loading, error } = useIngredients(activeFilter);

  // Update URL when filter changes
  const handleFilterChange = useCallback(
    (value: IngredientType | 'all') => {
      if (value === 'all') {
        searchParams.delete('type');
      } else {
        searchParams.set('type', value);
      }
      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleCardClick = useCallback((ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedIngredient(null);
  }, []);

  return (
    <main className={styles.page}>
      {/* ── Hero Section ── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Ingredient Transparency</p>
          <h1 id="hero-heading" className={styles.heroHeading}>
            Our Ingredients
          </h1>
          <p className={styles.heroSubheading}>
            Rooted in African heritage, guided by nature. We believe you deserve to know
            exactly what goes into every T.kays product — every plant, every extract,
            every carefully chosen element that makes our formulas work.
          </p>
        </div>

        {/* Decorative botanical shapes */}
        <div className={styles.heroDecorLeft} aria-hidden="true" />
        <div className={styles.heroDecorRight} aria-hidden="true" />
      </section>

      {/* ── Filter Tabs ── */}
      <section className={styles.filterSection} aria-label="Filter ingredients by type">
        <div className={styles.container}>
          <div className={styles.filterTabs} role="tablist" aria-label="Ingredient type filters">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                role="tab"
                aria-selected={activeFilter === tab.value}
                className={`${styles.filterTab} ${activeFilter === tab.value ? styles.filterTabActive : ''}`}
                onClick={() => handleFilterChange(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ingredients Grid ── */}
      <section className={styles.gridSection} aria-label="Ingredients list">
        <div className={styles.container}>
          {/* Error state */}
          {error && (
            <div className={styles.errorState} role="alert">
              <p className={styles.errorTitle}>Unable to load ingredients</p>
              <p className={styles.errorMessage}>{error}</p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && !error && (
            <div className={styles.grid} aria-busy="true" aria-label="Loading ingredients">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && ingredients.length === 0 && (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>No ingredients found</p>
              <p className={styles.emptyMessage}>
                Try selecting a different category or{' '}
                <button
                  className={styles.emptyReset}
                  onClick={() => handleFilterChange('all')}
                >
                  view all ingredients
                </button>
                .
              </p>
            </div>
          )}

          {/* Ingredient cards */}
          {!loading && !error && ingredients.length > 0 && (
            <>
              <p className={styles.resultCount} aria-live="polite">
                {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
                {activeFilter !== 'all' && ` · ${TYPE_LABELS[activeFilter as IngredientType]}`}
              </p>
              <div className={styles.grid}>
                {ingredients.map((ingredient) => (
                  <IngredientCard
                    key={ingredient.id}
                    ingredient={ingredient}
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Why We're Transparent Section ── */}
      <section className={styles.transparencySection} aria-labelledby="transparency-heading">
        <div className={styles.container}>
          <div className={styles.transparencyGrid}>
            <div className={styles.transparencyContent}>
              <p className={styles.transparencyEyebrow}>Our Commitment</p>
              <h2 id="transparency-heading" className={styles.transparencyHeading}>
                Why We're Transparent
              </h2>
              <p className={styles.transparencyBody}>
                At T.kays Agrocosmetics, transparency isn't a marketing strategy — it's a
                core value. We believe that when you understand what you're putting on your
                skin, you make better choices for your body and the planet.
              </p>
              <p className={styles.transparencyBody}>
                Our formulas draw from generations of African botanical wisdom, combined
                with modern cosmetic science. Every ingredient is chosen with intention,
                sourced responsibly, and disclosed fully — because you deserve nothing less.
              </p>

              {/* VHON Values */}
              <div className={styles.vhonValues}>
                <h3 className={styles.vhonHeading}>Our VHON Values</h3>
                <div className={styles.vhonGrid}>
                  {[
                    {
                      letter: 'V',
                      title: 'Verified',
                      desc: 'Every ingredient is verified for purity and ethical sourcing.',
                    },
                    {
                      letter: 'H',
                      title: 'Honest',
                      desc: 'Full disclosure of what goes into every formula — no hidden fillers.',
                    },
                    {
                      letter: 'O',
                      title: 'Origin-led',
                      desc: 'Celebrating African botanical heritage in every product.',
                    },
                    {
                      letter: 'N',
                      title: 'Natural',
                      desc: 'Prioritising nature-derived ingredients that work with your skin.',
                    },
                  ].map(({ letter, title, desc }) => (
                    <div key={letter} className={styles.vhonCard}>
                      <span className={styles.vhonLetter}>{letter}</span>
                      <div>
                        <h4 className={styles.vhonTitle}>{title}</h4>
                        <p className={styles.vhonDesc}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative side panel */}
            <div className={styles.transparencyVisual} aria-hidden="true">
              <div className={styles.visualCard}>
                <div className={styles.visualLeaf} />
                <p className={styles.visualQuote}>
                  "Nature has provided everything we need. Our role is simply to listen,
                  learn, and share."
                </p>
                <p className={styles.visualAttrib}>— T.kays Agrocosmetics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ingredient Detail Modal ── */}
      {selectedIngredient && (
        <IngredientModal
          ingredient={selectedIngredient}
          onClose={handleModalClose}
        />
      )}
    </main>
  );
};

export default IngredientsPage;