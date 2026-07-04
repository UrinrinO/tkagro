'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PageSEO from '@/components/SEO/PageSEO';

type Tab = 'signin' | 'signup';

const PANEL_IMG = 'https://images.unsplash.com/photo-1643366749-4dad497ea0a0?w=1200&q=85&fit=crop';

const LoginPage: React.FC = () => {
  const { user, signIn, signUp } = useAuth();
  const router = useRouter();

  const [tab, setTab]           = useState<Tab>('signin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirst]   = useState('');
  const [lastName, setLast]     = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    if (user) router.replace('/account');
  }, [user, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    const err = await signIn(email, password);
    if (err) setError(err);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    const err = await signUp(email, password, firstName, lastName);
    if (err) { setError(err); } else {
      setSuccess('Account created! Check your email to confirm, then sign in.');
      setTab('signin');
    }
    setLoading(false);
  };

  const inputCls = [
    'w-full px-4 py-3.5 text-sm rounded-xl border border-gray-200 bg-white',
    'placeholder:text-gray-300 focus:outline-none focus:border-primary/50',
    'focus:ring-2 focus:ring-primary/10 transition-all',
  ].join(' ');

  const EyeIcon = () => showPw ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );

  return (
    <>
      <PageSEO
        title={tab === 'signin' ? 'Sign In' : 'Create Account'}
        description="Sign in or create a T.kays Agrocosmetics account."
        canonicalPath="/login"
      />

      <div className="min-h-screen flex bg-white">

        {/* ── Left: full-bleed editorial image ── */}
        <div className="hidden lg:block lg:w-[42%] xl:w-[45%] relative overflow-hidden flex-shrink-0">
          <img
            src={PANEL_IMG}
            alt="T.kays — glowing skin"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Dark gradient overlay for text legibility */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(160deg, rgba(28,15,10,0.15) 0%, rgba(28,15,10,0.72) 100%)'
          }} />

          {/* Content over image */}
          <div className="relative z-10 h-full flex flex-col justify-between p-10">
            {/* Logo */}
            <Link href="/" className="inline-block">
              <span className="font-heading text-xl font-bold text-white tracking-wide">T.kays</span>
              <span className="block text-white/50 text-xs tracking-[0.2em] uppercase mt-0.5">Agrocosmetics</span>
            </Link>

            {/* Headline */}
            <div>
              <div className="w-8 h-0.5 bg-[#C9973A] mb-5" />
              <h2 className="font-heading text-white text-4xl xl:text-5xl font-bold leading-tight">
                Potent African<br />botanicals for<br />skin that glows.
              </h2>
              <p className="text-white/60 text-sm mt-5 leading-relaxed max-w-xs">
                Vegan · Herbal · Organic · Natural<br />
                Every formula rooted in botanical wisdom.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: form panel ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-20 bg-[#FAFAF9]">
          <div className="w-full max-w-[400px]">

            {/* Mobile logo */}
            <div className="lg:hidden mb-10 text-center">
              <Link href="/">
                <span className="font-heading text-2xl font-bold text-primary">T.kays</span>
                <span className="block text-xs tracking-widest uppercase text-gray-400 mt-0.5">Agrocosmetics</span>
              </Link>
            </div>

            {/* Tab toggle — pill style */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
              {(['signin', 'signup'] as Tab[]).map((t) => (
                <button key={t} type="button"
                  onClick={() => { setTab(t); setError(null); setSuccess(''); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  }`}>
                  {t === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="font-heading text-2xl font-bold text-gray-900">
                {tab === 'signin' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {tab === 'signin' ? 'Sign in to manage your orders and wishlist.' : 'Join T.kays for a personalised experience.'}
              </p>
            </div>

            {/* Alerts */}
            {success && (
              <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
                {error}
              </div>
            )}

            {/* Sign In */}
            {tab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2" htmlFor="si-email">Email</label>
                  <input id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required autoComplete="email" className={inputCls} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2" htmlFor="si-password">Password</label>
                  <div className="relative">
                    <input id="si-password" type={showPw ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required autoComplete="current-password" className={`${inputCls} pr-12`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPw((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                      <EyeIcon />
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 mt-1 rounded-xl text-sm font-bold text-white tracking-wide transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #C9973A 0%, #7A3B2E 100%)' }}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            ) : (
              /* Sign Up */
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2" htmlFor="su-first">First name</label>
                    <input id="su-first" type="text" value={firstName} onChange={(e) => setFirst(e.target.value)}
                      required autoComplete="given-name" className={inputCls} placeholder="Adaeze" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2" htmlFor="su-last">Last name</label>
                    <input id="su-last" type="text" value={lastName} onChange={(e) => setLast(e.target.value)}
                      required autoComplete="family-name" className={inputCls} placeholder="Obi" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2" htmlFor="su-email">Email</label>
                  <input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required autoComplete="email" className={inputCls} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2" htmlFor="su-password">Password</label>
                  <div className="relative">
                    <input id="su-password" type={showPw ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required minLength={6} autoComplete="new-password" className={`${inputCls} pr-12`} placeholder="Min 6 characters" />
                    <button type="button" onClick={() => setShowPw((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                      <EyeIcon />
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 mt-1 rounded-xl text-sm font-bold text-white tracking-wide transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #C9973A 0%, #7A3B2E 100%)' }}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  By signing up you agree to our{' '}
                  <Link href="/about" className="text-primary hover:underline">privacy practices</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
