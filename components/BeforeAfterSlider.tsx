'use client';
/**
 * BeforeAfterSlider — drag/touch divider to reveal before → after transformation.
 * Fully accessible: keyboard arrow keys also move the divider.
 */

import React, { useState, useRef, useCallback } from 'react';

interface Props {
  before: string;
  after: string;
  label: string;
}

const BeforeAfterSlider: React.FC<Props> = ({ before, after, label }) => {
  const [split, setSplit] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const clamp = (v: number) => Math.min(95, Math.max(5, v));

  const updateFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    setSplit(clamp(((clientX - left) / width) * 100));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };

  const onPointerUp = () => { dragging.current = false; };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft')  setSplit((s) => clamp(s - 2));
    if (e.key === 'ArrowRight') setSplit((s) => clamp(s + 2));
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl aspect-[3/4] select-none cursor-col-resize bg-black"
      aria-label={`${label} — before and after comparison. Use arrow keys to adjust.`}
      role="img"
    >
      {/* Before image (full width, underneath) */}
      <img
        src={before}
        alt={`Before — ${label}`}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* After image clipped to right of split */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${split}%)` }}
      >
        <img
          src={after}
          alt={`After — ${label}`}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.6)] z-10"
        style={{ left: `${split}%`, transform: 'translateX(-50%)' }}
      />

      {/* Drag handle */}
      <div
        className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center cursor-col-resize"
        style={{ left: `${split}%` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="slider"
        aria-valuenow={Math.round(split)}
        aria-valuemin={5}
        aria-valuemax={95}
        aria-label="Drag to compare before and after"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M6 4l-4 6 4 6M14 4l4 6-4 6" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Before / After labels */}
      <span className="absolute top-3 left-3 z-10 text-xs font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full tracking-wide uppercase">
        Before
      </span>
      <span className="absolute top-3 right-3 z-10 text-xs font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full tracking-wide uppercase">
        After
      </span>

      {/* Concern label at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white font-heading text-sm font-semibold">{label}</p>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
