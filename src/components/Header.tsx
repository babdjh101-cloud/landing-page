import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  storeName?: string;
  onOpenLookup?: () => void;
  onNavigateToAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  storeName = 'Indigo Crafted',
}) => {
  const { itemCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Logo and Brand Name */}
        <a href="#" className="flex items-center gap-3 text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap">
          <span className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-400 font-mono text-base font-bold shadow-inner">
            I
          </span>
          <span className="tracking-tight">{storeName}</span>
        </a>

        {/* Minimal Cart Indicator */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
          aria-label="View shopping bag"
        >
          <ShoppingBag className="w-4 h-4 text-neutral-950" />
          <span className="hidden xs:inline">ব্যাগ</span>
          <span className="font-mono text-xs bg-neutral-950 text-amber-400 px-1.5 py-0.5 rounded font-bold">
            {itemCount}
          </span>
        </button>
      </div>
    </header>
  );
};
