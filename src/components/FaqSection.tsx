import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'আমি কীভাবে পেমেন্ট করব? আগে কি কোনো টাকা দিতে হবে?',
    answer: 'না, অর্ডার করার সময় কোনো অগ্রিম টাকা দিতে হবে না। সম্পূর্ণ ক্যাশ অন ডেলিভারি (COD)। ডেলিভারিম্যান পার্সেল নিয়ে আপনার ঠিকানায় পৌঁছালে কাপড় চেক করে নগদ টাকা পরিশোধ করবেন।'
  },
  {
    question: 'ডেলিভারি পেতে কতদিন সময় লাগবে?',
    answer: 'ঢাকা সিটির ভেতরে ১ থেকে ২ কার্যদিবস এবং ঢাকার বাইরে জেলা বা থানা সদরে ৩ থেকে ৪ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।'
  },
  {
    question: 'সাইজ যদি না মিলে তবে কি পরিবর্তন করা যাবে?',
    answer: 'অবশ্যই। পার্সেল পাওয়ার পর সাইজে সমস্যা হলে ৩ কার্যদিবসের মধ্যে আমাদের কাস্টমার সার্ভিসে জানালে আমরা নতুন সাইজের প্যান্ট পাঠিয়ে এক্সচেঞ্জ করিয়ে দেব।'
  },
  {
    question: 'কম্বো প্যাকেজে কি ভিন্ন ভিন্ন সাইজ নেওয়া যাবে?',
    answer: 'হ্যাঁ, আপনি চাইলে অর্ডার করার সময় বিশেষ নোটে উল্লেখ করে দিতে পারেন (যেমন: ব্ল্যাক L সাইজ এবং লাইট ব্লু M সাইজ), অথবা আমাদের কাস্টমার টিম অর্ডার কনফার্ম করার সময় সাইজ যাচাই করে নেবে।'
  },
  {
    question: 'ডেনিম প্যান্ট কীভাবে যত্ন নিলে রঙ দীর্ঘদিন ভালো থাকবে?',
    answer: 'প্রথম কয়েকবার ধোয়ার সময় সাধারণ ঠান্ডা পানিতে মৃদু ডিটারজেন্ট দিয়ে উল্টো করে ধোয়ার পরামর্শ দেওয়া হয়। সরাসরি কড়া রোদে বেশিক্ষণ না রেখে ছায়ায় শুকালে কাপড়ের ডাই সবচেয়ে দীর্ঘস্থায়ী হয়।'
  }
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-neutral-900/20 border-b border-neutral-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-400 mb-2">
            <span>সাধারণ জিজ্ঞাসা</span>
            <span aria-hidden="true">·</span>
            <span>এফএকিউ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            সচরাচর জিজ্ঞাসিত প্রশ্নসমূহ
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            আপনার প্রয়োজনীয় প্রশ্নের উত্তর সহজেই খুঁজে নিন।
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-neutral-800 bg-neutral-950/70 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-900 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
