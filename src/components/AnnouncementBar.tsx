import React from 'react';
import { Truck, ShieldCheck, RefreshCw } from 'lucide-react';

interface Props {
  text?: string;
}

export const AnnouncementBar: React.FC<Props> = ({ text }) => {
  return (
    <div className="bg-neutral-900 border-b border-neutral-800 text-neutral-300 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="font-semibold text-amber-400">অফার:</span>
          <span className="text-neutral-200">
            {text || 'কম্বো প্যাকেজে ৯১০৳ পর্যন্ত ছাড়! সারাদেশে ক্যাশ অন ডেলিভারি ও সহজে ট্রায়াল সুবিধা।'}
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-6 text-neutral-400 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-neutral-400" /> সারাদেশে হোম ডেলিভারি
          </span>
          <span className="text-neutral-700">·</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" /> প্রোডাক্ট দেখে মূল্য পরিশোধ
          </span>
          <span className="text-neutral-700">·</span>
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-neutral-400" /> সহজ সাইজ এক্সচেঞ্জ
          </span>
        </div>
      </div>
    </div>
  );
};
