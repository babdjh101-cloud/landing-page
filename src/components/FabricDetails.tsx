import React from 'react';
import { Layers, Droplets, Wind, ShieldCheck } from 'lucide-react';

export const FabricDetails: React.FC = () => {
  return (
    <section id="fabric" className="py-16 bg-neutral-950 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
            <span>কটন টুইল গঠন</span>
            <span aria-hidden="true">·</span>
            <span>১২.৫ ওজেড স্ট্যান্ডার্ড ওয়েট</span>
            <span aria-hidden="true">·</span>
            <span>প্রি-শ্রাঙ্ক ফিনিশিং</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            যেকোনো ঋতুতে সহনশীল ডেনিম ফেব্রিক ইঞ্জিনিয়ারিং
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 mt-2">
            বাংলাদেশের আর্দ্র ও উষ্ণ আবহাওয়ার কথা বিবেচনা করে আমাদের ডেনিম বিশেষভাবে তৈরি। এতে রয়েছে সঠিক পরিমাণে ব্রিদেবল কটন এবং স্ট্রেচেবল স্প্যানডেক্স।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">৯৮% রিং-স্পান কটন</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              উচ্চ ঘনত্বের লং-স্টেপল কটন সুতা ব্যবহার করায় কাপড় দীর্ঘস্থায়ী হয় এবং ধোয়ার পরেও সহজে পাতলা বা ছিঁড়ে যায় না।
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400">
              <Wind className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">২% কমফোর্ট স্প্যানডেক্স</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              হাঁটাচলা, বাইক রাইডিং বা দীর্ঘক্ষণ বসে থাকার সময় অস্বস্তি রোধ করতে এতে রয়েছে ২-ওয়ে ন্যাচারাল স্ট্রেচ।
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">কালার-লক ডাইয়িং</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              ডিপ সালফার ডাইয়িং টেকনোলজি থাকায় ব্ল্যাক ডেনিম সাধারণ ডিটারজেন্ট ধোয়ার পরও ফেড হওয়া প্রতিরোধ করে।
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">ব্রাস মেটাল রিভেটস ও জিপার</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              হেভি-ডিউটি মেটাল জিপার এবং পকেটের স্ট্রেন পয়েন্টগুলোতে অ্যান্টি-রাস্ট ব্রাস রিভেট যুক্ত করা হয়েছে।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
