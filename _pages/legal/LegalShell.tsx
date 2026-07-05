'use client';
import React from 'react';
import Link from 'next/link';

interface LegalShellProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const LegalShell: React.FC<LegalShellProps> = ({ title, lastUpdated, children }) => (
  <>
    {/* Hero */}
    <section
      className="relative bg-gradient-to-br from-brand-dark via-primary/90 to-primary overflow-hidden"
      style={{ minHeight: '28vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '3.5rem' }}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #fff 0%, transparent 60%)' }}
      />

      <nav className="absolute top-24 left-6 lg:left-16 z-20" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-white text-xs font-medium [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
          <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
          <li aria-hidden="true" className="opacity-40">/</li>
          <li className="text-white" aria-current="page">{title}</li>
        </ol>
      </nav>

      <div className="relative z-10 px-6 lg:px-16 max-w-4xl">
        <span className="text-xs font-bold tracking-widest uppercase text-accent mb-3 block">Legal</span>
        <h1 className="font-heading text-4xl lg:text-5xl font-bold text-white leading-tight">
          {title}
        </h1>
        <p className="text-white/60 text-sm mt-3">Last updated: {lastUpdated}</p>
      </div>
    </section>

    {/* Prose */}
    <section className="py-16 px-6 lg:px-16 bg-white">
      <div className="max-w-3xl mx-auto legal-prose">
        {children}
      </div>
    </section>

    <style>{`
      .legal-prose h2 {
        font-family: var(--font-heading);
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-brand-dark);
        margin: 2.5rem 0 0.75rem;
        padding-bottom: 0.4rem;
        border-bottom: 1px solid #f0ede8;
      }
      .legal-prose h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-brand-dark);
        margin: 1.5rem 0 0.5rem;
      }
      .legal-prose p {
        font-size: 0.9375rem;
        line-height: 1.75;
        color: #444;
        margin-bottom: 1rem;
      }
      .legal-prose ul, .legal-prose ol {
        padding-left: 1.5rem;
        margin-bottom: 1rem;
      }
      .legal-prose li {
        font-size: 0.9375rem;
        line-height: 1.75;
        color: #444;
        margin-bottom: 0.25rem;
      }
      .legal-prose ul li { list-style-type: disc; }
      .legal-prose ol li { list-style-type: decimal; }
      .legal-prose a {
        color: var(--color-primary);
        text-decoration: underline;
      }
      .legal-prose table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
        margin: 1.5rem 0;
        overflow-x: auto;
        display: block;
      }
      .legal-prose th {
        background: #f7f3ef;
        font-weight: 700;
        color: var(--color-brand-dark);
        padding: 0.6rem 0.75rem;
        text-align: left;
        border: 1px solid #e8e2db;
        white-space: nowrap;
      }
      .legal-prose td {
        padding: 0.55rem 0.75rem;
        border: 1px solid #e8e2db;
        vertical-align: top;
        color: #444;
      }
      .legal-prose tr:nth-child(even) td { background: #faf8f5; }
      .legal-prose .placeholder {
        background: #fef9c3;
        color: #92400e;
        padding: 0.1rem 0.4rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
      }
    `}</style>
  </>
);

export default LegalShell;
