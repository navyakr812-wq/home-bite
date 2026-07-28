import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Trash2, ArrowRight, Ticket, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    updateNotes,
    subtotal,
    deliveryFee,
    packagingFee,
    discount,
    applyCoupon,
    couponCode,
    total
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const success = applyCoupon(promoInput.trim());
    if (success) {
      setPromoMessage({ type: 'success', text: `Coupon applied successfully!` });
    } else {
      setPromoMessage({ type: 'error', text: 'Invalid promo code. Try WELCOME10 or HOMEBITE5' });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <span className="text-6xl block">🛒</span>
        <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
        <p className="text-slate-500 max-w-sm mx-auto text-sm">
          Looks like you haven't added anything to your cart yet. Explore our fresh homemade dishes and chefs!
        </p>
        <Link
          to="/menu"
          className="inline-block bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen"
    >
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {cartItems.map((item) => (
              <motion.div
                layout
                key={item.foodItem}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
                className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:justify-between"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=150"}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="w-full sm:w-auto">
                    <h3 className="font-bold text-sm sm:text-base">{item.name}</h3>
                    <p className="text-primary font-extrabold text-sm mt-0.5">₹{item.price}</p>
                    <input
                      type="text"
                      placeholder="Add preparation notes..."
                      value={item.notes || ''}
                      onChange={(e) => updateNotes(item.foodItem, e.target.value)}
                      className="mt-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold rounded-lg w-full max-w-[200px] focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                    <button
                      onClick={() => updateQuantity(item.foodItem, item.quantity - 1)}
                      className="p-1 text-slate-500 hover:text-primary transition-colors focus:outline-none"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.foodItem, item.quantity + 1)}
                      className="p-1 text-slate-500 hover:text-primary transition-colors focus:outline-none"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-base w-16 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeFromCart(item.foodItem)}
                      className="text-slate-400 hover:text-red-500 transition-colors focus:outline-none"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary Card */}
        <div className="space-y-6">
          <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            <h2 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3">Order Summary</h2>

            <div className="space-y-3.5 text-sm font-medium">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Packaging Fee</span>
                <span>₹{packagingFee.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount ({couponCode})</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
              <div className="flex justify-between text-base font-extrabold">
                <span>Total Amount</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-2 pt-2">
              <label htmlFor="promo-input" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Have a Coupon?</label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    id="promo-input"
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setPromoMessage(null);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-primary uppercase font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Apply
                </button>
              </div>
              <AnimatePresence mode="wait">
                {promoMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-xs font-bold flex items-center gap-1 ${
                      promoMessage.type === 'success' ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {promoMessage.type === 'success' && <Check className="w-3.5 h-3.5" />}
                    {promoMessage.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>

            <Link
              to="/checkout"
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Simple Coupon helper guide card */}
          <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl text-xs space-y-1">
            <p className="font-bold text-primary">Available Promo Codes for Testing:</p>
            <ul className="list-disc list-inside text-slate-500 space-y-0.5 font-medium">
              <li><strong className="text-slate-700 dark:text-slate-300">WELCOME10</strong> - Save $10 on your first order</li>
              <li><strong className="text-slate-700 dark:text-slate-300">HOMEBITE5</strong> - Save $5 on any order</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
