import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, subtotal, itemCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">আপনার শপিং ব্যাগ ({itemCount})</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                <ShoppingBag className="w-12 h-12 text-neutral-600 mb-3" />
                <p className="text-sm font-semibold text-neutral-300">আপনার ব্যাগ খালি</p>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  পছন্দের ডেনিম প্যান্টের সাইজ নির্বাচন করে ব্যাগে যোগ করুন।
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  কালেকশন দেখুন
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="flex gap-3 p-3 rounded-lg bg-neutral-950/70 border border-neutral-800"
                >
                  <img
                    src={item.image_path}
                    alt={item.product_name}
                    className="w-16 h-20 object-cover rounded bg-neutral-900 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white truncate">{item.product_name}</h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cart_item_id)}
                          className="text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                        <span>কালার: {item.color}</span>
                        <span>·</span>
                        <span className="font-semibold text-amber-400">সাইজ: {item.size}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-neutral-800 rounded bg-neutral-900 text-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                          className="px-2 py-0.5 text-neutral-400 hover:text-white cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono px-2 text-white font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                          className="px-2 py-0.5 text-neutral-400 hover:text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono text-sm font-bold text-amber-400">
                        ৳{(item.unit_price * item.quantity).toLocaleString('en-BD')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Direct Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>পণ্যের মোট মূল্য (Subtotal):</span>
                <span className="font-mono text-base font-bold text-white">
                  ৳{subtotal.toLocaleString('en-BD')}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                ডেলিভারি চার্জ (ঢাকা ৬০৳, ঢাকার বাইরে ১২০৳) চেকআউটে যুক্ত হবে।
              </p>

              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 text-xs sm:text-sm font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2"
              >
                <span>অর্ডার সম্পন্ন করতে এগিয়ে যান</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
