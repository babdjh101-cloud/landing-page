import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  location: string;
  productName: string;
  variant: string;
  rating: number;
  date: string;
  comment: string;
}

const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'তানভীর আহমেদ',
    location: 'মিরপুর, ঢাকা',
    productName: 'Black + Light Blue Combo',
    variant: 'Size M',
    rating: 5,
    date: '০৮ অক্টোবর ২০২৬',
    comment: 'কম্বো অফারে নিয়েছিলাম। দুটি প্যান্টের ফেব্রিক এবং সেলাই অসাধারণ। বিশেষ করে ব্ল্যাক কালারটির ফিনিশ খুবই প্রিমিয়াম। ডেলিভারিম্যান সামনে দাঁড়িয়ে কাপড় চেক করার সুযোগ দিয়েছে।'
  },
  {
    id: 'rev-2',
    name: 'মাহমুদুল হাসান',
    location: 'আগ্রাবাদ, চট্টগ্রাম',
    productName: 'Light Blue Denim Pant',
    variant: 'Size L',
    rating: 5,
    date: '০২ অক্টোবর ২০২৬',
    comment: 'আমি একটু চিন্তিত ছিলাম সাইজ নিয়ে। তবে সাইজ চার্ট দেখে L সাইজ অর্ডার করেছিলাম, একদম পারফেক্ট হয়েছে। গরমে পরার জন্য যথেষ্ট আরামদায়ক ও স্ট্রেচেবল।'
  },
  {
    id: 'rev-3',
    name: 'ইমতিয়াজ সাজিদ',
    location: 'উত্তরা, ঢাকা',
    productName: 'Black Denim Pant',
    variant: 'Size S',
    rating: 5,
    date: '২৬ সেপ্টেম্বর ২০২৬',
    comment: 'অর্ডার করার পরের দিনই পেয়েছি। মেটাল জিপার আর পকেটের ব্রাস রিভেটগুলো অনেক মজবুত। রেগুলার ব্যবহারের জন্য বেস্ট ডেনিম।'
  }
];

export const CustomerReviews: React.FC = () => {
  return (
    <section className="py-16 bg-neutral-950 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
            <span>ক্রেতাদের অভিজ্ঞতা</span>
            <span aria-hidden="true">·</span>
            <span>ভেরিফাইড পারচেজ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            যারা আমাদের ডেনিম নিয়মিত ব্যবহার করছেন
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            আমাদের কাস্টমারদের অকপট প্রতিক্রিয়া ও বাস্তব অভিজ্ঞতা।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev) => (
            <div key={rev.id} className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      {rev.name}
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    </h4>
                    <span className="text-[11px] text-neutral-400">{rev.location}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">{rev.date}</span>
                </div>
                <div className="mt-2 text-[11px] text-amber-400/90 font-medium">
                  {rev.productName} · {rev.variant}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
