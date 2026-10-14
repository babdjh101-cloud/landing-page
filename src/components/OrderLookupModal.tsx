import React, { useState } from 'react';
import { X, Search, Loader2, Package, CheckCircle2, Clock, Truck, AlertCircle } from 'lucide-react';
import { lookupOrder } from '../lib/api';
import { Order } from '../types';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({ isOpen, onClose }) => {
  const [reference, setReference] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);

    if (!reference.trim() || !phone.trim()) {
      setError('অর্ডার নম্বর এবং ব্যবহৃত মোবাইল নম্বর উভয়ই লিখুন');
      return;
    }

    setLoading(true);
    try {
      const res = await lookupOrder(reference.trim(), phone.trim());
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(res.error || 'অর্ডারটি খুঁজে পাওয়া যায়নি। নম্বর দুটি পুনরায় মিলিয়ে নিন।');
      }
    } catch {
      setError('তথ্য যাচাই করতে সমস্যা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="text-amber-400 font-semibold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> অপেক্ষমাণ (Pending)</span>;
      case 'CONFIRMED':
        return <span className="text-sky-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> কনফার্মড (Confirmed)</span>;
      case 'PROCESSING':
        return <span className="text-indigo-400 font-semibold flex items-center gap-1"><Package className="w-3.5 h-3.5" /> প্রসেসিং (Packaging)</span>;
      case 'SHIPPED':
        return <span className="text-blue-400 font-semibold flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> কুরিয়ারে হস্তান্তর (Shipped)</span>;
      case 'DELIVERED':
        return <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> ডেলিভারি সম্পন্ন (Delivered)</span>;
      case 'CANCELLED':
        return <span className="text-rose-400 font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> বাতিল (Cancelled)</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-left my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">অর্ডার ট্র্যাকিং ও বর্তমান অবস্থা</h2>
          <p className="text-xs text-neutral-400 mt-1">
            অর্ডারের সময় পাওয়া অর্ডার কোড ও মোবাইল নম্বর দিয়ে আপনার পার্সেলের অবস্থান জানুন।
          </p>
        </div>

        <form onSubmit={handleLookup} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              অর্ডার রেফারেন্স নম্বর
            </label>
            <input
              type="text"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder="যেমন: BD-XXXXX"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              ব্যবহৃত মোবাইল নম্বর
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="যেমন: 017XXXXXXXX"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>ট্র্যাক করুন</span>
          </button>
        </form>

        {/* Found Order Card */}
        {order && (
          <div className="mt-6 p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div>
                <span className="text-[11px] text-neutral-400">অর্ডার নম্বর:</span>
                <p className="font-mono font-bold text-white text-sm">{order.public_order_reference}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-neutral-400">বর্তমান স্ট্যাটাস:</span>
                <div className="text-xs">{getStatusBadge(order.order_status)}</div>
              </div>
            </div>

            <div className="space-y-1 text-neutral-300">
              <p><span className="text-neutral-500">গ্রাহক:</span> {order.customer_name}</p>
              <p><span className="text-neutral-500">ঠিকানা:</span> {order.customer_address}, {order.district}</p>
              <p><span className="text-neutral-500">পেমেন্ট:</span> ক্যাশ অন ডেলিভারি ({order.payment_status === 'PAID' ? 'পরিশোধিত' : 'অপেক্ষমাণ'})</p>
            </div>

            <div className="pt-2 border-t border-neutral-800 flex justify-between items-baseline font-mono">
              <span className="text-neutral-400 text-xs">মোট প্রদেয়:</span>
              <span className="text-base font-bold text-amber-400">৳{order.total.toLocaleString('en-BD')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
