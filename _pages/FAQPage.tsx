'use client';
/**
 * TKAG-31 — FAQ Page
 * Route: /faq
 *
 * Features:
 * - Accordion with useState to track open item
 * - Client-side keyword search/filter (no API call)
 * - Static FAQ content from constants/faq.ts
 * - Accessible: uses aria-expanded, aria-controls, role="region"
 */

import React, { useState, useMemo, useCallback, useId } from "react";
import { FAQ_ITEMS, type FAQItem } from "../constants/faq";
import styles from "./FAQPage.module.css";

// ─── Accordion Item ───────────────────────────────────────────────────────────

interface AccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  item,
  isOpen,
  onToggle,
  index,
}) => {
  // Unique IDs for accessibility (button controls panel)
  const panelId = `faq-panel-${item.id}`;
  const buttonId = `faq-btn-${item.id}`;

  return (
    <div
      className={`${styles.accordionItem} ${isOpen ? styles.accordionItemOpen : ""}`}
    >
      <h3 className={styles.accordionHeading}>
        <button
          id={buttonId}
          type="button"
          className={styles.accordionTrigger}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className={styles.accordionIndex} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className={styles.accordionQuestion}>{item.question}</span>
          <span
            className={`${styles.accordionChevron} ${isOpen ? styles.accordionChevronOpen : ""}`}
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="18"
              height="18"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
      </h3>

      {/* Panel — always rendered for smooth CSS transition, hidden via aria */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`${styles.accordionPanel} ${isOpen ? styles.accordionPanelOpen : ""}`}
        hidden={!isOpen}
      >
        <div className={styles.accordionAnswer}>{item.answer}</div>
      </div>
    </div>
  );
};

// ─── Category Badge ───────────────────────────────────────────────────────────

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string | null;
  onSelect: (cat: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelect,
}) => (
  <div className={styles.categoryFilter} role="group" aria-label="Filter by category">
    <button
      type="button"
      className={`${styles.categoryChip} ${activeCategory === null ? styles.categoryChipActive : ""}`}
      onClick={() => onSelect(null)}
      aria-pressed={activeCategory === null}
    >
      All
    </button>
    {categories.map((cat) => (
      <button
        key={cat}
        type="button"
        className={`${styles.categoryChip} ${activeCategory === cat ? styles.categoryChipActive : ""}`}
        onClick={() => onSelect(cat)}
        aria-pressed={activeCategory === cat}
      >
        {cat}
      </button>
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const FAQPage: React.FC = () => {
  const searchId = useId();

  // Index of the currently open accordion item (-1 = none)
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Derive unique categories from FAQ items
  const categories = useMemo(
    () => Array.from(new Set(FAQ_ITEMS.map((item) => item.category))),
    []
  );

  // Client-side filter: matches query against question and answer text,
  // and optionally filters by category
  const filteredItems = useMemo<FAQItem[]>(() => {
    const query = searchQuery.trim().toLowerCase();

    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === null || item.category === activeCategory;

      const matchesSearch =
        query === "" ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  // Toggle accordion: close if already open, open new one
  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      // Reset open item when search changes to avoid stale open state
      setOpenIndex(-1);
    },
    []
  );

  const handleCategorySelect = useCallback((cat: string | null) => {
    setActiveCategory(cat);
    setOpenIndex(-1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setOpenIndex(-1);
  }, []);

  return (
    <main className={styles.page}>
      {/* ── Page Header ── */}
      <section className={styles.pageHeader}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Got questions?</p>
          <h1 className={styles.heading}>Frequently Asked Questions</h1>
          <p className={styles.subheading}>
            Find answers to the most common questions about our products,
            orders, and brand.
          </p>

          {/* Search input */}
          <div className={styles.searchWrapper}>
            <label htmlFor={searchId} className={styles.srOnly}>
              Search frequently asked questions
            </label>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="18"
                height="18"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              id={searchId}
              type="search"
              className={styles.searchInput}
              placeholder="Search questions…"
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search frequently asked questions"
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      <div className={styles.container}>
        {/* Category filter chips */}
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />

        {/* Results count */}
        <p className={styles.resultsCount} aria-live="polite" aria-atomic="true">
          {filteredItems.length === FAQ_ITEMS.length
            ? `${FAQ_ITEMS.length} questions`
            : `${filteredItems.length} of ${FAQ_ITEMS.length} questions`}
          {activeCategory && ` in "${activeCategory}"`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>

        {/* Accordion list */}
        {filteredItems.length > 0 ? (
          <div
            className={styles.accordion}
            role="list"
            aria-label="Frequently asked questions"
          >
            {filteredItems.map((item, index) => (
              <div key={item.id} role="listitem">
                <AccordionItem
                  item={item}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                  index={index}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className={styles.emptyState} role="status">
            <span className={styles.emptyIcon} aria-hidden="true">🔍</span>
            <h3 className={styles.emptyTitle}>No results found</h3>
            <p className={styles.emptyText}>
              We couldn't find any questions matching{" "}
              <strong>"{searchQuery}"</strong>. Try a different keyword or{" "}
              <button
                type="button"
                className={styles.emptyReset}
                onClick={handleClearSearch}
              >
                clear your search
              </button>
              .
            </p>
          </div>
        )}

        {/* Still have questions CTA */}
        <div className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Still have questions?</h2>
            <p className={styles.ctaText}>
              Our team is happy to help. Reach out and we'll get back to you
              within 24 hours.
            </p>
            <div className={styles.ctaActions}>
              <a href="/contact" className={styles.btnPrimary}>
                Contact Us
              </a>
              <a
                href={`https://wa.me/233XXXXXXXXX`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnWhatsApp}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FAQPage;