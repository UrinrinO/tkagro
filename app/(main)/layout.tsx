'use client';
export const dynamic = 'force-dynamic';
import { usePathname } from 'next/navigation';
import Header from '@/components/Navigation/Header';
import Footer from '@/components/Footer/Footer';
import CookieConsent from '@/components/CookieConsent';
import CartDrawer from '@/components/Cart/CartDrawer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-1 ${isHome ? '' : 'pt-20'}`}>
        {children}
      </main>
      <footer role="contentinfo">
        <Footer />
      </footer>
      <CartDrawer />
      <CookieConsent />
    </div>
  );
}
