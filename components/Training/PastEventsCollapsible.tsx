'use client';
/**
 * TKAG-28: Training Academy — Collapsible past events section
 */

import React, { useState } from 'react';
import type { Workshop } from '../../types/training';
import WorkshopCard from './WorkshopCard';
import styles from './PastEventsCollapsible.module.css';

interface PastEventsCollapsibleProps {
  workshops: Workshop[];
}

const PastEventsCollapsible: React.FC<PastEventsCollapsibleProps> = ({ workshops }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (workshops.length === 0) return null;

  return (
    <div className={styles.container}>
      <button
        className={styles.toggle}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="past-events-panel"
      >
        <span className={styles.toggleLabel}>
          Past Events ({workshops.length})
        </span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>

      <div
        id="past-events-panel"
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        aria-hidden={!isOpen}
      >
        <div className={styles.grid}>
          {workshops.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} isPast />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PastEventsCollapsible;