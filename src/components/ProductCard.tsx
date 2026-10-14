import React, { useState } from 'react';
import { ShoppingBag, Check, AlertCircle } from 'lucide-react';
import { Product, DenimSize } from '../types';
import { useCart } from '../context/CartContext';
import { trackViewItem } from '../lib/tracking';

interface ProductCardProps {
  product: Product;
  onQuickOrder?: (product: Product, size: DenimSize) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickOrder }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<DenimSize>('M');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const isConfigured = product.price > 0 || (product.sale_price !== null && product.sale_price > 0);
  const activePrice = product.sale_price ?? product.price;
  const regularPrice = product.price;
  const hasDiscount = product.sale_price !== null && product.sale_price < product.price;

  const handleSizeClick = (size: DenimSize) => {
    setSelectedSize(size);
    trackViewItem(product, size);
  };

  const handleAddToCart = () => {
    if (!isConfigured) return;
    addToCart(product, selectedSize, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleDirectOrder = () => {
    if (!isConfigured) return;
    addToCart(product, selectedSize, quantity);
    if (onQuickOrder) {
      onQuickOrder(product, selectedSize);
    }
  };

  return (
    <div className="flex flex-col bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all duration-200">
      {/* Product Image Slot */}
      <div className="relative aspect-[3/4] bg-neutral-950 overflow-hidden group">
        <img
          src={product.image_path}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.img-fallback')) {
              const fallback = document.createElement('div');
              fallback.className = 'img-fallback w-full h-full flex flex-col items-center justify-center p-4 text-center bg-neutral-900 text-neutral-400';
              fallback.innerHTML = `<span class="text-xs uppercase tracking-wider text-neutral-500">${product.color}</span><span class="text-sm font-semibold text-neutral-200 mt-1">${product.name}</span>`;
              parent.appendChild(fallback);
            }
          }}
        />

        {/* Clean Unboxed Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-neutral-950/90 text-amber-400 border border-amber-400/30 text-[11px] font-bold px-2 py-0.5 rounded tracking-wide">
            {product.badge}
          </div>
        )}

        <div className="absolute top-3 right-3 bg-neutral-950/80 text-neutral-300 text-[11px] px-2 py-0.5 rounded border border-neutral-800">
          রং: {product.color}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1.5">
            <span>১০০% কটন ডেনিম</span>
            <span aria-hidden="true">·</span>
            <span>স্লিম ফিট</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">স্টক আছে</span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">{product.name}</h3>

          <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>

          {/* Pricing Display */}
          <div className="mt-3 flex items-baseline gap-2">
            {isConfigured ? (
              <>
                <span className="font-mono text-xl sm:text-2xl font-bold text-amber-400">
                  ৳{activePrice.toLocaleString('en-BD')}
                </span>
                {hasDiscount && (
                  <span className="font-mono text-sm text-neutral-500 line-through">
                    ৳{regularPrice.toLocaleString('en-BD')}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-[11px] font-medium text-emerald-400 ml-1">
                    (৳{(regularPrice - activePrice).toLocaleString('en-BD')} ছাড়)
                  </span>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>মূল্য কনফিগার করা হয়নি</span>
              </div>
            )}
          </div>
        </div>

        {/* Size Selection */}
        <div className="space-y-2 pt-1 border-t border-neutral-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-300">সাইজ নির্বাচন করুন:</span>
            <a href="#size-guide" className="text-neutral-400 hover:text-amber-400 underline transition-colors">
              সাইজ চার্ট
            </a>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['S', 'M', 'L'] as DenimSize[]).map((size) => {
              const isSelected = selectedSize === size;
              const waistLabel = size === 'S' ? '২৮-৩০"' : size === 'M' ? '৩১-৩৩"' : '৩৪-৩৬"';
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeClick(size)}
                  className={`py-2 px-2 text-center rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-sm'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                  }`}
                >
                  <div className="text-sm font-bold">{size}</div>
                  <div className={`text-[10px] ${isSelected ? 'text-neutral-900 font-semibold' : 'text-neutral-500'}`}>
                    কোমর {waistLabel}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-neutral-400">পরিমাণ:</span>
          <div className="flex items-center border border-neutral-800 rounded-lg bg-neutral-900">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              -
            </button>
            <span className="font-mono text-xs px-2.5 text-white font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              disabled={quantity >= 10}
              className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleDirectOrder}
            disabled={!isConfigured}
            className="w-full py-2.5 px-4 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isConfigured}
            className="w-full py-2 px-4 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            {addedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">ব্যাগে যোগ হয়েছে!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-neutral-400" />
                <span>ব্যাগে যোগ করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
