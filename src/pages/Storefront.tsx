import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { ComboCard } from '../components/ComboCard';
import { SizeGuideSection } from '../components/SizeGuideModal';
import { CheckoutSection } from '../components/CheckoutSection';
import { CartDrawer } from '../components/CartDrawer';
import { OrderConfirmationModal } from '../components/OrderConfirmationModal';
import { OrderLookupModal } from '../components/OrderLookupModal';
import { Footer } from '../components/Footer';
import { Product, Order, DenimSize, SiteSettings } from '../types';
import { getProducts } from '../lib/api';
import { initializeGTM } from '../lib/tracking';
import { DEFAULT_SITE_SETTINGS } from '../config/site';

interface StorefrontProps {
  onNavigateToAdmin?: () => void;
}

export const Storefront: React.FC<StorefrontProps> = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  useEffect(() => {
    initializeGTM(settings.gtm_container_id, settings.gtm_enabled);

    getProducts()
      .then((res) => {
        if (res.success && res.data) {
          setProducts(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const blackDenim = products.find((p) => p.id === 'denim-black');
  const lightBlueDenim = products.find((p) => p.id === 'denim-light-blue');
  const comboProduct = products.find((p) => p.id === 'denim-combo-black-light-blue');

  const scrollToCheckout = () => {
    const el = document.getElementById('checkout');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickOrder = (_product: Product, _size: DenimSize) => {
    scrollToCheckout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* Header (Logo + Name + Bag) */}
      <Header storeName={settings.store_name} />

      <main className="flex-1">
        {/* 3. Hero Section */}
        <Hero onExploreClick={scrollToProducts} />

        {/* 4. Products Section (Black & Light Blue) */}
        <section id="products" className="py-12 bg-neutral-950 border-b border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-semibold text-amber-400 block mb-1">
                পছন্দের ডেনিম ও সাইজ নির্বাচন করুন
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                প্রিমিয়াম ডেনিম কালেকশন
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-96 rounded-xl bg-neutral-900 animate-pulse border border-neutral-800" />
                <div className="h-96 rounded-xl bg-neutral-900 animate-pulse border border-neutral-800" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {blackDenim && (
                  <ProductCard product={blackDenim} onQuickOrder={handleQuickOrder} />
                )}
                {lightBlueDenim && (
                  <ProductCard product={lightBlueDenim} onQuickOrder={handleQuickOrder} />
                )}
              </div>
            )}
          </div>
        </section>

        {/* 5. Special Combo Offer */}
        {comboProduct && (
          <ComboCard comboProduct={comboProduct} onQuickOrder={handleQuickOrder} />
        )}

        {/* 6. Compact Size Guide */}
        <SizeGuideSection />

        {/* 7. Direct Cash on Delivery Checkout Form */}
        <CheckoutSection
          insideDhakaFee={settings.delivery_inside_dhaka}
          outsideDhakaFee={settings.delivery_outside_dhaka}
          products={products}
          onOrderSuccess={(order) => setConfirmedOrder(order)}
        />
      </main>

      {/* 8. Clean Footer */}
      <Footer
        storeName={settings.store_name}
        storePhone={settings.store_phone}
        storeEmail={settings.store_email}
        storeAddress={settings.store_address}
        onOpenLookup={() => setIsLookupOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer onProceedToCheckout={scrollToCheckout} />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />

      {/* Order Lookup Modal */}
      <OrderLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
      />
    </div>
  );
};
