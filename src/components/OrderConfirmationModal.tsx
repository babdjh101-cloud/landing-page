import React from 'react';
import { Order } from '../types';
import { CheckCircle, Printer, Copy, Check, X, Truck, ShieldCheck } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ order, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const handleCopyReference = () => {
    navigator.clipboard.writeText(order.public_order_reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-left my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="text-center pb-6 border-b border-neutral-800">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">আপনার অর্ডারটি সফল হয়েছে!</h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            ধন্যবাদ <span className="text-white font-medium">{order.customer_name}</span>, খুব শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।
          </p>

          {/* Reference pill */}
          <div className="mt-4 inline-flex items-center gap-2 p-2 px-3.5 bg-neutral-950 border border-neutral-800 rounded-lg">
            <span className="text-xs text-neutral-400">অর্ডার নম্বর:</span>
            <span className="font-mono text-sm font-bold text-amber-400 tracking-wider">
              {order.public_order_reference}
            </span>
            <button
              type="button"
              onClick={handleCopyReference}
              className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="কপি করুন"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Order Details */}
        <div className="py-4 space-y-4 text-xs">
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-neutral-400">
              ডেলিভারি ঠিকানা
            </h4>
            <div className="text-neutral-300 space-y-0.5">
              <p className="font-medium text-white">{order.customer_name} ({order.customer_phone})</p>
              <p>{order.customer_address}</p>
              <p>{order.area ? `${order.area}, ` : ''}{order.district}</p>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-neutral-400">
              অর্ডারের আইটেম
            </h4>
            <div className="divide-y divide-neutral-900">
              {order.items?.map((it, idx) => (
                <div key={idx} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-white">{it.product_name_snapshot}</span>
                    <span className="text-neutral-400 block text-[11px]">
                      সাইজ: <span className="text-amber-400 font-semibold">{it.size}</span> · পরিমাণ: {it.quantity}টি
                    </span>
                  </div>
                  <span className="font-mono text-neutral-200">৳{it.line_total.toLocaleString('en-BD')}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-neutral-800/80 space-y-1 text-neutral-400 text-xs">
              <div className="flex justify-between">
                <span>পণ্যের সাবটোটাল:</span>
                <span className="font-mono text-white">৳{order.subtotal.toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-mono text-white">৳{order.delivery_charge.toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-neutral-800">
                <span>মোট প্রদেয় টাকা:</span>
                <span className="font-mono text-amber-400">৳{order.total.toLocaleString('en-BD')}</span>
              </div>
            </div>
          </div>

          {/* Cash on Delivery Notice */}
          <div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">ক্যাশ অন ডেলিভারি (COD)</p>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                পার্সেল হাতে পাওয়ার পর পণ্য চেক করে ডেলিভারিম্যানকে মোট ৳{order.total.toLocaleString('en-BD')} পরিশোধ করুন।
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-800">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>ইনভয়েস প্রিন্ট করুন</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            ঠিক আছে, ধন্যবাদ
          </button>
        </div>
      </div>
    </div>
  );
};
