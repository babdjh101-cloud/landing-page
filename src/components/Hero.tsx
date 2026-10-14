import React from 'react';
import { ArrowDown, Check, ShieldCheck, Truck } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800 bg-neutral-950 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Value Propositions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
              <span>১০০% প্রিমিয়াম কটন টুইল</span>
              <span aria-hidden="true">·</span>
              <span>১২.৫ আউন্স অল-সিজন ডেনিম</span>
              <span aria-hidden="true">·</span>
              <span>ক্যাশ অন ডেলিভারি</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
              বাংলাদেশি আবহাওয়ায় নিখুঁত ফিটিং ও আরামদায়ক প্রিমিয়াম ডেনিম
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl">
              প্রতিদিনের অফিস, ইউনিভার্সিটি কিংবা ক্যাজুয়াল আউটিং—সবখানেই ক্লাসি লুক। ৯৮% পিউর রিং-স্পান কটন ও ২% আরামদায়ক স্প্যানডেক্সের সমন্বয়ে তৈরি, যা দীর্ঘ ব্যবহারে ফিটিং নষ্ট হয় না।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                <div className="text-amber-400 font-bold text-sm flex items-center gap-1.5 mb-1">
                  <Truck className="w-4 h-4 text-amber-400" /> সারা দেশে হোম ডেলিভারি
                </div>
                <p className="text-xs text-neutral-400">ঢাকার ভিতরে ২ দিন, ঢাকার বাইরে ৩-৪ দিনে ডেলিভারি</p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                <div className="text-amber-400 font-bold text-sm flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> চেক করে মূল্য পরিশোধ
                </div>
                <p className="text-xs text-neutral-400">ডেলিভারিম্যানের সামনে কাপড় ও সাইজ দেখে নিশ্চিত হোন</p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                <div className="text-amber-400 font-bold text-sm flex items-center gap-1.5 mb-1">
                  <Check className="w-4 h-4 text-amber-400" /> সহজ সাইজ এক্সচেঞ্জ
                </div>
                <p className="text-xs text-neutral-400">সাইজ না মিললে ৩ দিনের মধ্যে বিনামূল্যে রিপ্লেসমেন্ট</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onExploreClick}
                className="px-6 py-3.5 text-sm font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-400/10"
              >
                <span>পছন্দের ডেনিম নির্বাচন করুন</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <a
                href="#size-guide"
                className="px-5 py-3.5 text-sm font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md transition-colors"
              >
                সাইজ চার্ট দেখুন
              </a>
            </div>
          </div>

          {/* Right Column: Hero Visual Anchor with Fallback */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
              <img
                src="/images/hero-denim.webp"
                alt="Contemporary denim collection lifestyle fit"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
                loading="eager"
                onError={(e) => {
                  // Fallback container in case of path issue
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.img-fallback')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'img-fallback w-full h-full flex flex-col items-center justify-center p-6 text-center bg-neutral-900 text-neutral-400';
                    fallback.innerHTML = '<span class="text-sm font-semibold text-neutral-200">Indigo Crafted Denim</span><span class="text-xs mt-1">100% Pure Ring-Spun Cotton</span>';
                    parent.appendChild(fallback);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-xs text-neutral-300 bg-neutral-950/80 backdrop-blur-sm p-3 rounded border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">সিগনেচার স্লিম-ফিট কাট</p>
                  <p className="text-[11px] text-neutral-400">ক্যাজুয়াল ও সেমি-ফরমাল উভয় লুকেই মানানসই</p>
                </div>
                <span className="font-mono text-amber-400 font-bold text-sm">৳১,২৫০</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
