"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  foodItem: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  notes?: string; // Chef notes
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (foodItemId: string) => void;
  updateQuantity: (foodItemId: string, quantity: number) => void;
  updateNotes: (foodItemId: string, notes: string) => void;
  clearCart: () => void;
  couponCode: string;
  discount: number;
  applyCoupon: (code: string) => boolean;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('hb_cart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('hb_cart', JSON.stringify(items));
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    const existing = cartItems.find((i) => i.foodItem === item.foodItem);
    if (existing) {
      const updated = cartItems.map((i) =>
        i.foodItem === item.foodItem ? { ...i, quantity: i.quantity + 1 } : i
      );
      saveCart(updated);
    } else {
      saveCart([...cartItems, { ...item, quantity: 1, notes: '' }]);
    }
  };

  const removeFromCart = (foodItemId: string) => {
    const updated = cartItems.filter((i) => i.foodItem !== foodItemId);
    saveCart(updated);
  };

  const updateQuantity = (foodItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodItemId);
      return;
    }
    const updated = cartItems.map((i) =>
      i.foodItem === foodItemId ? { ...i, quantity } : i
    );
    saveCart(updated);
  };

  const updateNotes = (foodItemId: string, notes: string) => {
    const updated = cartItems.map((i) =>
      i.foodItem === foodItemId ? { ...i, notes } : i
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    setCouponCode('');
    setDiscount(0);
  };

  const applyCoupon = (code: string): boolean => {
    const cleanCode = code.toUpperCase().trim();
    if (cleanCode === 'WELCOME10') {
      setCouponCode('WELCOME10');
      setDiscount(10);
      return true;
    }
    if (cleanCode === 'HOMEBITE5') {
      setCouponCode('HOMEBITE5');
      setDiscount(5);
      return true;
    }
    return false;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 5 : 0;
  const packagingFee = subtotal > 0 ? 2 : 0;
  const total = Math.max(0, subtotal + deliveryFee + packagingFee - discount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
        clearCart,
        couponCode,
        discount,
        applyCoupon,
        subtotal,
        deliveryFee,
        packagingFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
};
