import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { CartItem, DenimSize, Product } from '../types';
import { trackAddToCart, trackRemoveFromCart } from '../lib/tracking';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: DenimSize, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'indigo_cart_items_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not persist cart to storage', e);
    }
  }, [items]);

  const addToCart = (product: Product, size: DenimSize, quantity: number = 1) => {
    const activePrice = product.sale_price ?? product.price;
    const cartItemId = `${product.id}_${size}`;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((it) => it.cart_item_id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        trackAddToCart(updated[existingIndex]);
        return updated;
      } else {
        const newItem: CartItem = {
          cart_item_id: cartItemId,
          product_id: product.id,
          product_name: product.name,
          color: product.color,
          size,
          unit_price: activePrice,
          quantity,
          image_path: product.image_path,
        };
        trackAddToCart(newItem);
        return [...prevItems, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => {
      const itemToRemove = prev.find((it) => it.cart_item_id === cartItemId);
      if (itemToRemove) {
        trackRemoveFromCart(itemToRemove);
      }
      return prev.filter((it) => it.cart_item_id !== cartItemId);
    });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((it) => (it.cart_item_id === cartItemId ? { ...it, quantity: Math.min(10, quantity) } : it))
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const itemCount = useMemo(() => items.reduce((sum, it) => sum + it.quantity, 0), [items]);

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.unit_price * it.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
