import React from 'react';
import { Truck, MapPin, Clock, Banknote, ShieldAlert } from 'lucide-react';

interface Props {
  insideDhaka?: number;
  outsideDhaka?: number;
}

export const DeliveryPolicy: React.FC<Props> = ({ insideDhaka = 60, outsideDhaka = 120 }) => {
  return (
    <section id="delivery" className="py-16 bg-neutral-900/30 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
            <span>ডেলিভারি নীতিমালা</span>
            <span aria-hidden="true">·</span>
            <span>ক্যাশ অন ডেলিভারি (COD)</span>
            <span aria-hidden="true">·</span>
            <span>স্বচ্ছ চার্জ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ডেলিভারি চার্জ ও পেমেন্ট পদ্ধতি
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            আমাদের কোনো গোপন চার্জ নেই। সম্পূর্ণ ক্যাশ অন ডেলিভারিতে পণ্য পৌঁছাবে আপনার দরজায়।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 uppercase tracking-wider">ঢাকা মেট্রো</span>
              <MapPin className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-mono text-3xl font-extrabold text-white">৳{insideDhaka}</div>
            <p className="text-xs text-neutral-400">
              ঢাকার যেকোনো ঠিকানায় হোম ডেলিভারি। সময় লাগবে আনুমানিক ২৪ থেকে ৪৮ ঘণ্টা।
            </p>
            <div className="pt-2 text-[11px] text-neutral-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> ১-২ কার্যদিবস
            </div>
          </div>

          <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 uppercase tracking-wider">ঢাকার বাইরে (সারা বাংলাদেশ)</span>
              <Truck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-mono text-3xl font-extrabold text-white">৳{outsideDhaka}</div>
            <p className="text-xs text-neutral-400">
              সকল জেলা ও উপজেলা সদরে রেডেক্স / স্টেডফাস্ট কুরিয়ারের মাধ্যমে সরাসরি হোম ডেলিভারি।
            </p>
            <div className="pt-2 text-[11px] text-neutral-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> ৩-৪ কার্যদিবস
            </div>
          </div>

          <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 uppercase tracking-wider">পেমেন্ট মেথড</span>
              <Banknote className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-white">ক্যাশ অন ডেলিভারি (COD)</div>
            <p className="text-xs text-neutral-400">
              অর্ডারের সময় কোনো অগ্রিম টাকা দিতে হবে না। পার্সেল গ্রহণ করার সময় ক্যাশ টাকা পরিশোধ করবেন।
            </p>
            <div className="pt-2 text-[11px] text-emerald-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> শূন্য অগ্রিম পেমেন্ট ঝুঁকি
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
