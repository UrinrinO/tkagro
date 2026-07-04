'use client';
/**
 * TKAG-15: MobileFilterDrawer
 * Slide-up drawer that wraps FilterSidebar for mobile viewports.
 * Uses a portal to render above all other content.
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FilterSidebar } from './FilterSidebar';
import type {
  ProductCategory,
  SkinConcern,
  SortOption,
} from '../../types/product';
import styles from './MobileFilterDrawer.module.css';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: ProductCategory;
  selectedConcern: SkinConcern | '';
  selectedSort: SortOption;
  onCategoryChange: (value: ProductCategory) => void;
  onConcernChange: (value: SkinConcern | '') => void;
  onSortChange: (value: SortOption) => void;
  onClearAll: () => void;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  ...filterProps
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap: move focus into drawer when it opens
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Product filters">
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className={styles.drawer} ref={drawerRef}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Filter Products</span>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close filters"
          >
            {/* Simple × icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.drawerBody}>
          <FilterSidebar {...filterProps} compact />
        </div>

        <div className={styles.drawerFooter}>
          <button className={styles.applyBtn} onClick={onClose}>
            View Results
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};