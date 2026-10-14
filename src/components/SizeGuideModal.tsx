import React from 'react';
import { SIZE_CHART } from '../config/site';
import { ShieldCheck } from 'lucide-react';

export const SizeGuideSection: React.FC = () => {
  return (
    <section id="size-guide" className="py-10 bg-neutral-900/40 border-b border-neutral-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">সাইজ চার্ট (ইঞ্চিতে পরিমাপ)</h3>
            <p className="text-xs text-neutral-400">আপনার সাধারণ প্যান্টের কোমরের মাপ অনুযায়ী সঠিক সাইজ নির্বাচন করুন।</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>সাইজ না মিললে ৩ দিনে ফ্রি এক্সচেঞ্জ</span>
          </div>
        </div>

        {/* Compact Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-neutral-900 text-neutral-300 border-b border-neutral-800 font-semibold">
                <th className="py-3 px-4">সাইজ</th>
                <th className="py-3 px-4">কোমর (Waist)</th>
                <th className="py-3 px-4">লম্বা (Length)</th>
                <th className="py-3 px-4">থাই (Thigh)</th>
                <th className="py-3 px-4">পায়ের মুহুরি (Opening)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 font-mono">
              {SIZE_CHART.map((row) => (
                <tr key={row.size} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-amber-400 text-sm">{row.size}</td>
                  <td className="py-2.5 px-4 text-white font-semibold">{row.waist}</td>
                  <td className="py-2.5 px-4 text-neutral-300">{row.length}</td>
                  <td className="py-2.5 px-4 text-neutral-400">{row.thigh}</td>
                  <td className="py-2.5 px-4 text-neutral-400">{row.opening}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
