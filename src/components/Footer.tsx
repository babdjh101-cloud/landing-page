import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

interface FooterProps {
  storeName?: string;
  storePhone?: string;
  storeEmail?: string;
  storeAddress?: string;
  onOpenLookup?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  storeName = 'Indigo Crafted',
  storePhone = '+880 1700-000000',
  storeEmail = 'contact@indigocrafted.com',
  storeAddress = 'House 14, Road 11, Banani, Dhaka-1213, Bangladesh',
  onOpenLookup,
}) => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-white tracking-tight">
              <span className="w-6 h-6 rounded bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-400 font-mono text-xs">
                I
              </span>
              <span>{storeName}</span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              বাংলাদেশি ক্রেতাদের জন্য প্রিমিয়াম ডেনিম প্যান্টের নির্ভরযোগ্য ব্র্যান্ড। শতভাগ খাঁটি ফেব্রিক, সেরা ফিনিশিং এবং ক্যাশ অন ডেলিভারিতে ঝামেলাহীন কেনাকাটা।
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>১০০% অথেনটিক কোয়ালিটি নিশ্চয়তা</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">কালেকশন ও তথ্য</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#products" className="hover:text-amber-400 transition-colors">ব্ল্যাক ডেনিম প্যান্ট</a>
              </li>
              <li>
                <a href="#products" className="hover:text-amber-400 transition-colors">লাইট ব্লু ডেনিম প্যান্ট</a>
              </li>
              <li>
                <a href="#combo" className="hover:text-amber-400 transition-colors">২-ইন-১ কম্বো অফার (সাশ্রয়ী)</a>
              </li>
              <li>
                <a href="#size-guide" className="hover:text-amber-400 transition-colors">সাইজ ও পরিমাপ গাইড</a>
              </li>
              <li>
                <a href="#delivery" className="hover:text-amber-400 transition-colors">ডেলিভারি ও ক্যাশ অন তথ্য</a>
              </li>
            </ul>
          </div>

          {/* Customer Service Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">নীতিমালা ও সহায়তা</h4>
            <ul className="space-y-2 text-xs">
              <li className="text-neutral-400">
                <span className="text-neutral-300 font-medium">ক্যাশ অন ডেলিভারি:</span> পণ্য দেখে মূল্য পরিশোধ
              </li>
              <li className="text-neutral-400">
                <span className="text-neutral-300 font-medium">রিপ্লেসমেন্ট পলিসি:</span> ৩ দিনের মধ্যে সাইজ এক্সচেঞ্জ
              </li>
              <li className="text-neutral-400">
                <span className="text-neutral-300 font-medium">রিটার্ন পলিসি:</span> অপছন্দ হলে তাৎক্ষণিক ফেরত
              </li>
              <li className="text-neutral-400">
                <span className="text-neutral-300 font-medium">গোপনীয়তা:</span> আপনার ফোন ও ঠিকানা নিরাপদ
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">যোগাযোগ</h4>
            <div className="space-y-2.5 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{storePhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{storeEmail}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{storeAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar with Copyright & Customer Order Tracking */}
        <div className="pt-6 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-4 text-[11px] text-neutral-400">
          <p>© ২০২৬ {storeName}. সর্বস্বত্ব সংরক্ষিত। মেক ইন বাংলাদেশ।</p>
          {onOpenLookup && (
            <button
              type="button"
              onClick={onOpenLookup}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              অর্ডার ট্র্যাকিং
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
