import React from 'react';
import { ShieldCheck, Truck, RefreshCw, CheckCircle } from 'lucide-react';

export const Benefits: React.FC = () => {
  return (
    <section className="py-16 bg-neutral-950 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-400 mb-2">
            <span>বিশ্বাস ও প্রতিশ্রুতি</span>
            <span aria-hidden="true">·</span>
            <span>১০০% কাস্টমার সন্তুষ্টি</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            কেন আমাদের ডেনিম প্যান্ট বেছে নেবেন?
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            কোনো মনগড়া বা কৃত্রিম প্রতিশ্রুতি নয়—আমরা দিচ্ছি পণ্যের নিখুঁত মান এবং সম্পূর্ণ ঝুঁকিমুক্ত কেনাকাটার অভিজ্ঞতা।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 text-center flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">ক্যাশ অন ডেলিভারি</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              অনলাইনে কোনো অগ্রিম পেমেন্ট বা বিকাশ করতে হবে না। পণ্য হাতে পেয়ে ডেলিভারিম্যানকে টাকা দিন।
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 text-center flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">চেক করে রিসিভ</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              পার্সেল খুলে ফেব্রিকের গুণগত মান এবং সঠিক কালার ও সাইজ যাচাই করার পূর্ণ সুযোগ রয়েছে।
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 text-center flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">৩ দিনে সাইজ বদল</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              সাইজে সামান্যতম অসঙ্গতি থাকলে ৩ কার্যদিবসের মধ্যে সহজ সাইজ এক্সচেঞ্জ সুবিধা।
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 text-center flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">সারাদেশে হোম ডেলিভারি</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              ঢাকা সিটিতে ২ কার্যদিবস এবং ঢাকার বাইরে থানা সদর পর্যন্ত ৩-৪ কার্যদিবসে দ্রুত ডেলিভারি।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
