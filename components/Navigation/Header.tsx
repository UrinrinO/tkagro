'use client';
/**
 * Header — transparent overlay on hero, solid white on scroll.
 * Uses logo.png from assets; applies invert filter when over dark hero.
 */

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import logoSrc from '../../assets/images/logo/logo.png';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../hooks/useCart';

const NAV_ITEMS = [
  { label: 'About', to: '/about' },
  { label: 'Skincare & Body', to: '/skincare' },
  { label: 'Hair', to: '/hair-body' },
  { label: 'Shop', to: '/shop' },
  { label: 'Blog', to: '/blog' },
];

const Header: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { totalItems, openDrawer } = useCart();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = !isHome || scrolled;

  const toggleMenu = useCallback(() => setMenuOpen((p) => !p), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          solid
            ? 'bg-white shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" aria-label="T.kays Agrocosmetics — home" className="flex-shrink-0">
            <img
              src={logoSrc}
              alt="T.kays Agrocosmetics"
              className="h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_ITEMS.map(({ label, to }) => {
              const isActive = pathname === to || pathname.startsWith(to + '/');
              return (
                <Link
                  key={to}
                  href={to}
                  className={`text-sm font-medium tracking-wide transition-colors duration-200 relative group ${
                    solid
                      ? isActive
                        ? 'text-primary'
                        : 'text-brand-dark hover:text-primary'
                      : isActive
                      ? 'text-accent'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-current transition-all duration-200 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Account / Login */}
            <Link
              href={user ? '/account' : '/login'}
              aria-label={user ? 'My account' : 'Sign in'}
              className={`p-2.5 rounded-full transition-colors duration-200 flex items-center justify-center ${
                solid
                  ? 'text-brand-dark hover:bg-accent-pale hover:text-primary'
                  : 'text-white hover:text-accent'
              }`}
            >
              {user ? (
                <span className="w-[22px] h-[22px] rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center leading-none">
                  {(user.email?.[0] ?? '?').toUpperCase()}
                </span>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </Link>

            {/* Cart */}
            <button
              type="button"
              onClick={openDrawer}
              className={`relative p-2.5 rounded-full transition-colors duration-200 ${
                solid
                  ? 'text-brand-dark hover:bg-accent-pale hover:text-primary'
                  : 'text-white hover:text-accent'
              }`}
              aria-label={`Open shopping cart${totalItems > 0 ? `, ${totalItems} items` : ''}`}
            >
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </button>

            {/* Hamburger (mobile only) */}
            <button
              type="button"
              className={`md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-full transition-colors duration-200 ${
                solid ? 'text-brand-dark' : 'text-white'
              }`}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={toggleMenu}
            >
              <span className="block w-5 h-px bg-current" />
              <span className="block w-5 h-px bg-current" />
              <span className="block w-3.5 h-px bg-current self-start ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        id="mobile-nav"
        className={`fixed inset-0 z-40 bg-white flex flex-col transition-all duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Close button */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-gray-100">
          <img src={logoSrc} alt="T.kays Agrocosmetics" className="h-10 w-auto" />
          <button
            type="button"
            onClick={closeMenu}
            className="p-2 text-brand-dark hover:text-primary transition-colors"
            aria-label="Close menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-8 pt-8" aria-label="Mobile navigation">
          <ul className="space-y-0">
            {NAV_ITEMS.map(({ label, to }) => {
              const isActive = pathname === to || pathname.startsWith(to + '/');
              return (
                <li key={to} className="border-b border-gray-100">
                  <Link
                    href={to}
                    onClick={closeMenu}
                    className={`block py-5 font-heading text-2xl transition-colors duration-200 ${
                      isActive ? 'text-primary font-semibold' : 'text-brand-dark hover:text-primary'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-12 font-accent text-sm tracking-widest uppercase text-brand-grey">
            Balanced Wellness
          </p>
        </nav>
      </div>
    </>
  );
};

export default Header;
