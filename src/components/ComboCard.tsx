import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { Product, DenimSize } from '../types';
import { useCart } from '../context/CartContext';
import { trackViewItem } from '../lib/tracking';

interface ComboCardProps {
  comboProduct: Product;
  onQuickOrder?: (product: Product, size: DenimSize) => void;
}

export const ComboCard: React.FC<ComboCardProps> = ({ comboProduct, onQuickOrder }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<DenimSize>('M');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const activePrice = comboProduct.sale_price ?? comboProduct.price;
  const regularPrice = comboProduct.price;
  const savings = regularPrice - activePrice;

  const handleSizeClick = (size: DenimSize) => {
    setSelectedSize(size);
    trackViewItem(comboProduct, size);
  };

  const handleAddToCart = () => {
    addToCart(comboProduct, selectedSize, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleDirectOrder = () => {
    addToCart(comboProduct, selectedSize, quantity);
    if (onQuickOrder) {
      onQuickOrder(comboProduct, selectedSize);
    }
  };

  return (
    <section id="combo" className="py-12 bg-neutral-900/30 border-y border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-amber-500/30 p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Combo Image with Dual Denim Indicator */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-neutral-700/80 bg-neutral-950 shadow-lg">
                <img
                  src={comboProduct.image_path}
                  alt={comboProduct.name}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.img-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'img-fallback w-full h-full flex flex-col items-center justify-center p-6 text-center bg-neutral-900 text-neutral-400';
                      fallback.innerHTML = `<span class="text-sm font-bold text-amber-400">2-IN-1 COMBO DEAL</span><span class="text-xs mt-1 text-neutral-300">Black + Light Blue Denim Set</span>`;
                      parent.appendChild(fallback);
                    }
                  }}
                />
                <div className="absolute top-3 left-3 bg-amber-400 text-neutral-950 text-xs font-extrabold px-2.5 py-1 rounded shadow-md">
                  স্পেশাল কম্বো অফার
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-neutral-950/85 backdrop-blur-sm p-2.5 rounded border border-neutral-800 text-xs flex items-center justify-between">
                  <span className="text-neutral-300 font-medium">১টি ব্ল্যাক + ১টি লাইট ব্লু</span>
                  <span className="text-amber-400 font-bold font-mono">মোট ২টি প্যান্ট</span>
                </div>
              </div>
            </div>

            {/* Value Proposition & Purchase Box */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>সর্বোচ্চ সাশ্রয়ী প্যাকেজ (৯১০৳ ইনস্ট্যান্ট ছাড়)</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {comboProduct.name}
                </h2>

                <p className="text-sm sm:text-base text-neutral-300 mt-2 leading-relaxed">
                  এক অর্ডারে পেয়ে যান আমাদের সবচেয়ে জনপ্রিয় ২টি কালার—ফরমাল ড্রেসিংয়ের জন্য জেট ব্ল্যাক এবং ক্যাজুয়াল আউটডোরের জন্য রিফ্রেশিং লাইট ব্লু। আলাদা কিনলে ৩,১০০৳, কিন্তু কম্বোতে পাচ্ছেন মাত্র ২,১৯০৳-তে!
                </p>
              </div>

              {/* Bundle Contents Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-neutral-900 border border-neutral-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">প্যান্ট ১: ডিপ ব্ল্যাক ডেনিম</p>
                    <p className="text-neutral-400 text-[11px]">১২.৫ আউন্স কালার-লক কটন টুইল</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">প্যান্ট ২: লাইট ব্লু ওয়াশ ডেনিম</p>
                    <p className="text-neutral-400 text-[11px]">স্টোনওয়াশড ভিন্টেজ ফ্যাব্রিক</p>
                  </div>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <span className="text-xs text-neutral-400 block mb-0.5">কম্বো স্পেশাল অফার প্রাইস:</span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-3xl font-extrabold text-amber-400">
                      ৳{activePrice.toLocaleString('en-BD')}
                    </span>
                    {savings > 0 && (
                      <span className="font-mono text-base text-neutral-500 line-through">
                        ৳{regularPrice.toLocaleString('en-BD')}
                      </span>
                    )}
                  </div>
                </div>

                {savings > 0 && (
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-1 rounded inline-block">
                      মোট সাশ্রয়: ৳{savings.toLocaleString('en-BD')}
                    </span>
                  </div>
                )}
              </div>

              {/* Size Selector for Combo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-300">উভয় প্যান্টের জন্য সাইজ সিলেক্ট করুন:</span>
                  <a href="#size-guide" className="text-neutral-400 hover:text-amber-400 underline">
                    সাইজ পরিমাপ গাইড
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['S', 'M', 'L'] as DenimSize[]).map((size) => {
                    const isSelected = selectedSize === size;
                    const waistLabel = size === 'S' ? '২৮-৩০"' : size === 'M' ? '৩১-৩৩"' : '৩৪-৩৬"';
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeClick(size)}
                        className={`py-2 px-3 text-center rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-sm'
                            : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="text-sm font-bold">{size}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-neutral-950 font-semibold' : 'text-neutral-500'}`}>
                          কোমর {waistLabel}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDirectOrder}
                  className="w-full py-3.5 px-4 text-xs sm:text-sm font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2"
                >
                  <span>কম্বো সরাসরি অর্ডার করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-4 text-xs sm:text-sm font-medium text-neutral-300 hover:text-white bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">কম্বো ব্যাগে যোগ হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-neutral-400" />
                      <span>ব্যাগে যোগ করুন</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>পার্সেল খুলে ২টি প্যান্টের কাপড় ও সাইজ চেক করে ডেলিভারিম্যানকে ক্যাশ পেমেন্ট করতে পারবেন।</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
