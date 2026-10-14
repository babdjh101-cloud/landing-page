import React, { useState, useId } from 'react';
import { useCart } from '../context/CartContext';
import { BANGLADESH_DISTRICTS } from '../config/site';
import { validateBangladeshiPhone } from '../lib/validation';
import { submitOrder } from '../lib/api';
import { trackBeginCheckout, trackAddShippingInfo, trackPurchase } from '../lib/tracking';
import { Order, Product } from '../types';
import { ShieldCheck, Truck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface CheckoutSectionProps {
  insideDhakaFee?: number;
  outsideDhakaFee?: number;
  products?: Product[];
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutSection: React.FC<CheckoutSectionProps> = ({
  insideDhakaFee = 60,
  outsideDhakaFee = 120,
  products = [],
  onOrderSuccess,
}) => {
  const { items, subtotal, clearCart, updateQuantity, removeFromCart, addToCart } = useCart();
  const formUid = useId();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [area, setArea] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Generate unique idempotency key for this checkout attempt
  const [idempotencyKey] = useState(() => `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  // Delivery calculation
  const isDhaka = district.trim().toLowerCase() === 'dhaka';
  const deliveryCharge = items.length === 0 ? 0 : isDhaka ? insideDhakaFee : outsideDhakaFee;
  const grandTotal = subtotal + deliveryCharge;

  // Track begin_checkout when items exist
  React.useEffect(() => {
    if (items.length > 0) {
      trackBeginCheckout(items, subtotal);
    }
  }, [items.length]);

  const handlePhoneBlur = () => {
    if (!customerPhone.trim()) {
      setPhoneError('ফোন নম্বর দেওয়া আবশ্যক');
      return;
    }
    const check = validateBangladeshiPhone(customerPhone);
    if (!check.isValid) {
      setPhoneError(check.error || 'সঠিক ১১ ডিজিটের নম্বর দিন');
    } else {
      setPhoneError(null);
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const fee = newDistrict.trim().toLowerCase() === 'dhaka' ? insideDhakaFee : outsideDhakaFee;
    trackAddShippingInfo(items, newDistrict, fee, subtotal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Frontend validations
    if (items.length === 0) {
      setErrorMessage('আপনার ব্যাগ খালি! দয়া করে প্রথমে একটি ডেনিম বা কম্বো সিলেক্ট করুন।');
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('আপনার পূর্ণ নাম লিখুন');
      return;
    }

    const phoneCheck = validateBangladeshiPhone(customerPhone);
    if (!phoneCheck.isValid) {
      setPhoneError(phoneCheck.error || 'সঠিক ফোন নম্বর দিন');
      setErrorMessage(phoneCheck.error || 'সঠিক ফোন নম্বর দিন');
      return;
    }

    if (!customerAddress.trim() || customerAddress.trim().length < 5) {
      setErrorMessage('আপনার বিস্তারিত ডেলিভারি ঠিকানা লিখুন (বাসা/রোড/এলাকা)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitOrder(
        {
          customer_name: customerName.trim(),
          customer_phone: phoneCheck.normalized,
          customer_address: customerAddress.trim(),
          district,
          area: area.trim(),
          notes: notes.trim(),
          idempotency_key: idempotencyKey,
        },
        items
      );

      if (!response.success || !response.data?.order) {
        throw new Error(response.error || 'অর্ডার প্রক্রিয়াধীন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }

      const createdOrder = response.data.order;

      // Track purchase event strictly after confirmed persistence (PII is excluded)
      trackPurchase({
        public_order_reference: createdOrder.public_order_reference,
        subtotal: createdOrder.subtotal,
        delivery_charge: createdOrder.delivery_charge,
        items,
      });

      // Clear the cart only after confirmed success
      clearCart();

      // Trigger order success modal
      onOrderSuccess(createdOrder);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'অর্ডার সম্পন্ন হতে ব্যর্থ হয়েছে। সার্ভার যোগাযোগ নিশ্চিত করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="checkout" className="py-16 bg-neutral-950 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
            <span>সহজ ১-মিনিট ক্যাশ অন ডেলিভারি চেকআউট</span>
            <span aria-hidden="true">·</span>
            <span>কোনো কার্ড বা অনলাইন পেমেন্ট তথ্য লাগবে না</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            অর্ডার নিশ্চিত করতে নিচের তথ্যগুলো পূরণ করুন
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            পার্সেল পাওয়ার পর চেক করে মূল্য পরিশোধ করবেন। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Customer Details Form */}
          <div className="lg:col-span-7 bg-neutral-900/40 p-6 sm:p-8 rounded-2xl border border-neutral-800 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <span>১. কাস্টমার ও ডেলিভারি তথ্য</span>
            </h3>

            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor={`name-${formUid}`} className="block text-xs font-medium text-neutral-300 mb-1">
                  আপনার সম্পূর্ণ নাম <span className="text-rose-400">*</span>
                </label>
                <input
                  id={`name-${formUid}`}
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="যেমন: মোঃ সাকিব আহমেদ"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label htmlFor={`phone-${formUid}`} className="block text-xs font-medium text-neutral-300 mb-1">
                  ১১ ডিজিটের মোবাইল নম্বর <span className="text-rose-400">*</span>
                </label>
                <input
                  id={`phone-${formUid}`}
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  onBlur={handlePhoneBlur}
                  placeholder="যেমন: 01712345678"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-950 border rounded-lg text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                    phoneError ? 'border-rose-500 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-400'
                  }`}
                />
                {phoneError ? (
                  <p className="text-[11px] text-rose-400 mt-1">{phoneError}</p>
                ) : (
                  <p className="text-[11px] text-neutral-500 mt-1">ডেলিভারিম্যান এই নম্বরে কল দিয়ে পার্সেল পৌঁছাবে।</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`district-${formUid}`} className="block text-xs font-medium text-neutral-300 mb-1">
                    জেলা <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id={`district-${formUid}`}
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                  >
                    {BANGLADESH_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist} className="bg-neutral-900 text-white">
                        {dist} {dist === 'Dhaka' ? '(ডেলিভারি ৬০৳)' : '(ডেলিভারি ১২০৳)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={`area-${formUid}`} className="block text-xs font-medium text-neutral-300 mb-1">
                    থানা / এরিয়া
                  </label>
                  <input
                    id={`area-${formUid}`}
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="যেমন: মিরপুর / গুলশান / সদর"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`address-${formUid}`} className="block text-xs font-medium text-neutral-300 mb-1">
                  সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id={`address-${formUid}`}
                  rows={2}
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="যেমন: বাড়ি নং ১২, রোড নং ৫, ব্লক বি, ধানমন্ডি, ঢাকা"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label htmlFor={`notes-${formUid}`} className="block text-xs font-medium text-neutral-300 mb-1">
                  বিশেষ নির্দেশনা / নোট (ঐচ্ছিক)
                </label>
                <input
                  id={`notes-${formUid}`}
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যেমন: অফিস টাইমে কল করবেন, ইত্যাদি"
                  className="w-full px-3.5 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Fixed Payment Method Notice */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-neutral-300 mb-1">পেমেন্ট মেথড</label>
              <div className="p-3 rounded-lg bg-neutral-950 border border-amber-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
                </div>
                <span className="text-[11px] text-amber-400 font-semibold">পণ্য হাতে পেয়ে পেমেন্ট</span>
              </div>
            </div>
          </div>

          {/* Order Summary & Final Total */}
          <div className="lg:col-span-5 bg-neutral-900/40 p-6 sm:p-8 rounded-2xl border border-neutral-800 space-y-5">
            <h3 className="text-base font-bold text-white border-b border-neutral-800 pb-3">
              ২. অর্ডার সারাংশ
            </h3>

            {items.length === 0 ? (
              <div className="py-4 space-y-3">
                <p className="text-xs text-neutral-300 font-semibold">অর্ডার করতে নিচের যেকোনো একটি নির্বাচন করুন:</p>
                <div className="space-y-2">
                  {products.map((p) => {
                    const price = p.sale_price ?? p.price;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addToCart(p, 'M', 1)}
                        className="w-full p-3 rounded-lg border border-neutral-800 bg-neutral-950 hover:border-amber-400 flex items-center justify-between text-left text-xs transition-colors cursor-pointer group"
                      >
                        <div>
                          <p className="font-bold text-white group-hover:text-amber-400">{p.name}</p>
                          <span className="text-[11px] text-neutral-500">সাইজ: M (কোমর ৩১-৩৩") · ক্লিক করে যোগ করুন</span>
                        </div>
                        <span className="font-mono text-amber-400 font-bold text-sm">৳{price.toLocaleString('en-BD')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.cart_item_id} className="flex gap-3 text-xs pb-3 border-b border-neutral-800/80">
                    <img
                      src={it.image_path}
                      alt={it.product_name}
                      className="w-12 h-16 object-cover rounded bg-neutral-950 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between font-semibold text-white">
                          <span className="truncate">{it.product_name}</span>
                          <span className="font-mono text-amber-400 ml-2">৳{(it.unit_price * it.quantity).toLocaleString('en-BD')}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          সাইজ: <span className="text-amber-400 font-bold">{it.size}</span> · কালার: {it.color}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <div className="flex items-center border border-neutral-800 rounded bg-neutral-950">
                          <button
                            type="button"
                            onClick={() => updateQuantity(it.cart_item_id, it.quantity - 1)}
                            className="px-1.5 py-0.5 text-neutral-400 hover:text-white"
                          >
                            -
                          </button>
                          <span className="font-mono px-2 text-white">{it.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(it.cart_item_id, it.quantity + 1)}
                            className="px-1.5 py-0.5 text-neutral-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(it.cart_item_id)}
                          className="text-neutral-500 hover:text-rose-400 text-[10px]"
                        >
                          মুছুন
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Subtotal & Delivery Calculation */}
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>পণ্যের মূল্য (Subtotal):</span>
                    <span className="font-mono text-white font-medium">৳{subtotal.toLocaleString('en-BD')}</span>
                  </div>

                  <div className="flex justify-between text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-neutral-400" />
                      ডেলিভারি চার্জ ({isDhaka ? 'ঢাকা' : 'ঢাকার বাইরে'}):
                    </span>
                    <span className="font-mono text-white font-medium">৳{deliveryCharge.toLocaleString('en-BD')}</span>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-bold text-white block">সর্বমোট পরিশোধযোগ্য:</span>
                      <span className="text-[11px] text-neutral-500">(ক্যাশ অন ডেলিভারিতে প্রদেয়)</span>
                    </div>
                    <span className="font-mono text-2xl font-extrabold text-amber-400">
                      ৳{grandTotal.toLocaleString('en-BD')}
                    </span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full py-4 px-6 text-sm sm:text-base font-extrabold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xl shadow-amber-400/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-neutral-950" />
                        <span>অর্ডার সম্পন্ন হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 text-neutral-950" />
                        <span>ক্যাশ অন ডেলিভারিতে অর্ডার নিশ্চিত করুন</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center mt-2.5">
                    অর্ডার করার সাথে সাথে আপনার ফোনে কনফার্মেশন কোড ও মেসেজ আসবে।
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};
