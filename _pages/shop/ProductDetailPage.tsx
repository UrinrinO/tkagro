'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../hooks/useCart';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  id: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_approved: boolean;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  shortDescription: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  shortDescription: string;
  description: string;
  imageUrl: string;
  images: string[];
  category: string;
  concern: string[];
  inStock: boolean;
  stockCount: number | null;
  weightGrams: number | null;
  isNew: boolean;
  isBestSeller: boolean;
}

type TabKey = 'description' | 'additional' | 'reviews';

// ─── Star component ───────────────────────────────────────────────────────────

const Stars: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ rating, size = 'md' }) => {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`${sz} ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
          viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
};

// ─── RatingBar component ──────────────────────────────────────────────────────

const RatingBar: React.FC<{ star: number; count: number; total: number }> = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-10 text-gray-600 text-right flex-shrink-0">{star} Star</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-gray-400 text-xs flex-shrink-0">{pct}%</span>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem, openDrawer } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [added, setAdded] = useState(false);
  const [reviewSort, setReviewSort] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [wishlist, setWishlist] = useState(false);

  // ── Fetch product ──
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setError(null);

    const API_URL = '';
    fetch(`${API_URL}/api/products/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then((json) => {
        if (!json) return;
        if (!json.success) throw new Error(json.message ?? 'Not found');
        const raw = json.data.product;
        const p: Product = {
          ...raw,
          images: raw.imageUrl ? [raw.imageUrl] : [],
          shortDescription: raw.shortDescription ?? '',
        };
        setProduct(p);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Fetch reviews when tab opens ──
  const fetchReviews = useCallback(async (productId: string) => {
    try {
      const API_URL = '';
      const r = await fetch(`${API_URL}/api/reviews?productId=${productId}`);
      if (!r.ok) return;
      const data: Review[] = await r.json();
      setReviews(data.filter((rv) => rv.is_approved));
    } catch { /* no reviews API yet — show empty */ }
  }, []);

  useEffect(() => {
    if (activeTab === 'reviews' && product && reviews.length === 0) {
      fetchReviews(product.id);
    }
  }, [activeTab, product, reviews.length, fetchReviews]);

  // ── Derived ──
  const images = product?.images?.length ? product.images : (product?.imageUrl ? [product.imageUrl] : []);
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const starCounts = [5, 4, 3, 2, 1].map((s) => ({ star: s, count: reviews.filter((r) => Math.round(r.rating) === s).length }));
  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewSort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (reviewSort === 'highest') return b.rating - a.rating;
    return a.rating - b.rating;
  });

  const handleAddToCart = () => {
    if (!product) return;
    const maxQty = product.stockCount ?? Infinity;
    const safeQty = typeof maxQty === 'number' ? Math.min(quantity, maxQty) : quantity;
    for (let i = 0; i < safeQty; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, image: product.imageUrl, slug: product.slug, stockCount: product.stockCount ?? null });
    }
    setAdded(true);
    openDrawer();
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const prevImage = () => setActiveImage((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveImage((i) => (i + 1) % images.length);
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // ── States ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="flex gap-3">{[0,1,2,3].map((i) => <div key={i} className="w-20 h-20 bg-gray-200 rounded-xl" />)}</div>
          </div>
          <div className="space-y-4 py-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20">
      <h1 className="text-2xl font-semibold text-gray-800">Product not found</h1>
      <Link href="/shop" className="text-primary hover:underline text-sm">← Back to Shop</Link>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20">
      <p className="text-red-500 text-sm">{error}</p>
      <button onClick={() => window.location.reload()} className="text-primary text-sm hover:underline">Try again</button>
    </div>
  );

  if (!product) return null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'description', label: 'Description' },
    { key: 'additional', label: 'Additional Information' },
    { key: 'reviews', label: `Review${reviews.length > 0 ? ` (${reviews.length})` : ''}` },
  ];

  return (
    <div className="min-h-screen bg-white pt-20">

      {/* ── Page Hero / Breadcrumb ── */}
      <section className="relative h-[45vh] min-h-[320px] overflow-hidden" aria-label="Product hero">
        {/* Background — product image or fallback colour */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-primary-pale" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/75" />

        {/* Breadcrumb — top-left, matching site pattern */}
        <nav className="absolute top-24 left-6 lg:left-16 z-20" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-white text-xs font-medium [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li aria-hidden="true" className="opacity-40">/</li>
            <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
            <li aria-hidden="true" className="opacity-40">/</li>
            <li className="text-white" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        {/* Title — centered at bottom */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-6 text-center">
          <span className="text-accent font-body text-xs font-bold tracking-[0.18em] uppercase mb-3">
            {product.category}
          </span>
          <h1 className="font-heading text-white text-4xl sm:text-5xl md:text-6xl leading-tight">
            {product.name}
          </h1>
        </div>
      </section>

      {/* ── Main Product Section ── */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Left: Image Gallery ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square bg-[#f5f5f0] rounded-2xl overflow-hidden">
              {images.length > 0 ? (
                <img src={images[activeImage]} alt={product.name}
                  className="w-full h-full object-cover object-center" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>
              )}
              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={nextImage} aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
              {/* Badges */}
              {product.isNew && (
                <span className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">New</span>
              )}
              {product.isBestSeller && (
                <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Best Seller</span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} aria-label={`View image ${i + 1}`}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-primary' : 'border-gray-200 hover:border-gray-400'
                    }`}>
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div className="flex flex-col gap-4">

            {/* Category */}
            <p className="text-sm text-primary font-medium capitalize">{product.category}</p>

            {/* Name + stock badge */}
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="font-heading text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              {product.inStock ? (
                <span className="mt-1.5 flex-shrink-0 px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-full">In Stock</span>
              ) : (
                <span className="mt-1.5 flex-shrink-0 px-3 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-full">Out of Stock</span>
              )}
            </div>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <Stars rating={avgRating} />
                <span className="text-sm font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({reviews.length} Review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">£{product.price.toFixed(2)}</span>
              {product.compareAtPrice && (
                <span className="text-xl text-gray-400 line-through">£{product.compareAtPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Low stock warning */}
            {product.stockCount !== null && product.stockCount !== undefined && product.stockCount > 0 && product.stockCount <= 5 && (
              <p className="text-amber-600 text-sm font-medium flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Only {product.stockCount} left in stock — order soon
              </p>
            )}

            {/* Short description */}
            <p className="text-gray-600 text-sm leading-relaxed">{product.shortDescription}</p>

            <hr className="border-gray-100" />

            {/* Quantity + Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Quantity */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"
                  className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium">−</button>
                <span className="w-10 text-center text-sm font-semibold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => {
                    const max = product.stockCount ?? Infinity;
                    return typeof max === 'number' ? Math.min(q + 1, max) : q + 1;
                  })}
                  disabled={typeof (product.stockCount ?? Infinity) === 'number' && quantity >= (product.stockCount ?? Infinity)}
                  aria-label="Increase quantity"
                  className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-medium">+</button>
              </div>

              {/* Add to Cart */}
              <button onClick={handleAddToCart} disabled={!product.inStock}
                className="flex-1 min-w-[140px] h-11 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
                {added ? '✓ Added!' : 'Add to Cart'}
              </button>

              {/* Buy Now */}
              <button onClick={handleBuyNow} disabled={!product.inStock}
                className="flex-1 min-w-[120px] h-11 bg-[#8b7355] hover:bg-[#7a6448] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
                Buy Now
              </button>

              {/* Wishlist */}
              <button onClick={() => setWishlist((w) => !w)} aria-label="Add to wishlist"
                className={`w-11 h-11 flex items-center justify-center rounded-lg border transition-colors ${
                  wishlist ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-gray-400'
                }`}>
                <svg className="w-5 h-5" fill={wishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            <hr className="border-gray-100" />

            {/* Meta info */}
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-400 w-12 flex-shrink-0">SKU</span>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <span className="text-gray-700 font-medium uppercase tracking-wide">{product.slug.replace(/-/g, '').slice(0, 10).toUpperCase()}</span>
              </div>
              {product.concern?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <span className="text-gray-400 w-12 flex-shrink-0">Tags</span>
                  <span className="text-gray-400 flex-shrink-0">:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.concern.map((c) => (
                      <span key={c} className="text-gray-700 capitalize">{c.replace(/-/g, ' ')}{product.concern.indexOf(c) < product.concern.length - 1 ? ',' : ''}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 items-center pt-1">
                <span className="text-gray-400 w-12 flex-shrink-0">Share</span>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <div className="flex gap-2 ml-1">
                  {[
                    { label: 'Facebook', href: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, color: '#1877f2', d: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                    { label: 'Twitter', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}`, color: '#1da1f2', d: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                    { label: 'Pinterest', href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}`, color: '#e60023', d: 'M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z' },
                  ].map(({ label, href, color, d }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${label}`}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                      style={{ backgroundColor: color }}>
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-16">
          {/* Tab bar */}
          <div className="border-b border-gray-200 flex gap-0">
            {tabs.map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-8 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  activeTab === key
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="py-10">

            {/* Description */}
            {activeTab === 'description' && (
              <div className="max-w-3xl">
                {product.description ? (
                  <div className="prose prose-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p className="text-gray-400 text-sm italic">No description provided.</p>
                )}
              </div>
            )}

            {/* Additional Information */}
            {activeTab === 'additional' && (
              <div className="max-w-xl">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { label: 'Category', value: product.category },
                      { label: 'Weight', value: product.weightGrams ? `${product.weightGrams}g` : '—' },
                      { label: 'Stock', value: product.stockCount !== null ? `${product.stockCount} units` : '—' },
                      { label: 'Skin Concerns', value: product.concern?.length ? product.concern.map((c) => c.replace(/-/g, ' ')).join(', ') : '—' },
                      { label: 'Status', value: product.inStock ? 'In Stock' : 'Out of Stock' },
                    ].map(({ label, value }) => (
                      <tr key={label}>
                        <td className="py-3 pr-8 text-gray-500 font-medium w-40 capitalize">{label}</td>
                        <td className="py-3 text-gray-800 capitalize">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-10">
                {reviews.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">No reviews yet. Be the first to share your thoughts!</p>
                ) : (
                  <>
                    {/* Overview */}
                    <div className="flex flex-col sm:flex-row gap-10">
                      {/* Big number */}
                      <div className="flex flex-col items-center justify-center gap-2 w-36 flex-shrink-0">
                        <span className="text-6xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                        <Stars rating={avgRating} size="md" />
                        <span className="text-xs text-gray-400">out of 5</span>
                        <span className="text-xs text-gray-400">({reviews.length} Review{reviews.length !== 1 ? 's' : ''})</span>
                      </div>

                      {/* Bars */}
                      <div className="flex-1 space-y-2.5 max-w-md">
                        {starCounts.map(({ star, count }) => (
                          <RatingBar key={star} star={star} count={count} total={reviews.length} />
                        ))}
                      </div>
                    </div>

                    {/* Sort + List */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-gray-500">
                          Showing 1–{sortedReviews.length} of {sortedReviews.length} results
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Sort by :</span>
                          <select value={reviewSort} onChange={(e) => setReviewSort(e.target.value as typeof reviewSort)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="newest">Newest</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {sortedReviews.map((rv) => (
                          <div key={rv.id} className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                                  {rv.reviewer_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{rv.reviewer_name}</p>
                                  <p className="text-xs text-green-600 font-medium">Verified</p>
                                </div>
                              </div>
                              <span className="text-xs text-gray-400 flex-shrink-0">{fmtDate(rv.created_at)}</span>
                            </div>
                            <Stars rating={rv.rating} size="sm" />
                            <p className="text-sm text-gray-600 leading-relaxed">{rv.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="mt-12 border-t border-gray-100 pt-12">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.slice(0, 4).map((p) => (
                <article key={p.id} className="group cursor-pointer" onClick={() => router.push(`/shop/${p.slug}`)}>
                  <div className="aspect-square bg-[#f5f5f0] rounded-2xl overflow-hidden mb-3">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🌿</div>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900">{p.name}</h3>
                  <p className="text-primary font-bold text-sm mt-1">£{p.price.toFixed(2)}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
