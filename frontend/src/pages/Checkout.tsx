import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext_old';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';
import { Check, ShieldCheck, MapPin, CreditCard, Landmark, Truck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, addAddress, openAuthModal } = useAuth();
  const { cartItems, subtotal, deliveryFee, packagingFee, discount, total, clearCart } = useCart();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // Custom instructions
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [timeSlot, setTimeSlot] = useState('ASAP');
  
  // Form fields for new address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash on Delivery'>('Card');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !state || !zipCode) return;
    await addAddress({ street, city, state, zipCode });
    setShowAddressForm(false);
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    if (user) {
      setSelectedAddressIndex(user.addresses.length);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      openAuthModal(() => {
        // Re-run handlePlaceOrder after login success
        handlePlaceOrder();
      });
      return;
    }

    const address = user.addresses[selectedAddressIndex];
    if (!address) {
      alert("Please select or add a delivery address!");
      return;
    }

    setLoading(true);
    const orderData = {
      items: cartItems.map(i => ({ foodItem: i.foodItem, name: i.name, price: i.price, quantity: i.quantity, notes: i.notes || '' })),
      shippingAddress: {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode
      },
      paymentMethod,
      discount,
      specialInstructions,
      timeSlot
    };

    try {
      // 1. Create order in our database
      const orderRes = await api.post('/orders', orderData);
      const dbOrder = orderRes.data;

      // 2. If Cash on Delivery, complete immediately
      if (paymentMethod === 'Cash on Delivery') {
        setSuccessOrder(dbOrder);
        clearCart();
        setLoading(false);
        return;
      }

      // 3. Online Payment (Razorpay)
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      // 4. Create Razorpay order from backend
      const rpOrderRes = await api.post('/payments/create-order', {
        amount: dbOrder.total,
        receipt: dbOrder._id
      });
      const razorpayOrder = rpOrderRes.data;

      // 5. Open Razorpay Checkout Dialog
      const options = {
        key: (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || 'rzp_test_mockkey123',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'HomeBite',
        description: 'Authentic Home Cooked Meal Order',
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            setLoading(true);
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: dbOrder._id
            });
            if (verifyRes.data.success) {
              setSuccessOrder(verifyRes.data.order);
              clearCart();
            } else {
              alert('Payment verification failed.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Verification server error. Please contact HomeBite support.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phoneNumber || ''
        },
        theme: {
          color: '#EA580C' // HomeBite Brand Color
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any){
        alert(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
      setLoading(false);
    } catch (err: any) {
      console.error('Order creation error:', err);
      alert(err.response?.data?.message || 'Error initializing transaction.');
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !successOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <h1 className="text-2xl font-bold">No Checkout items</h1>
        <Link to="/menu" className="bg-primary text-white px-8 py-3 rounded-full font-bold">Explore Menu</Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen relative"
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 animate-fadeIn">
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-extrabold text-sm sm:text-base tracking-wide uppercase">Securing Payment transaction...</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {successOrder ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto text-center bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-8 md:p-12 rounded-3xl shadow-xl space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-500 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Order Placed Successfully!</h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Your home chef has been notified and is beginning to prepare your delicious meal.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-left text-sm space-y-2 border border-slate-100 dark:border-slate-800 font-medium">
              <p className="font-bold text-xs text-slate-400 uppercase tracking-wider">Order Details</p>
              <p><strong>Order ID:</strong> #{successOrder._id}</p>
              <p><strong>Total Paid:</strong> ₹{successOrder.total || total}</p>
              <p><strong>Delivery address:</strong> {successOrder.shippingAddress?.street}, {successOrder.shippingAddress?.city}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate('/dashboard?tab=orders')}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Track Order
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Delivery address & Payment Method */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address Step */}
              <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="font-extrabold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Delivery Address
                  </h2>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    {showAddressForm ? 'Cancel' : '+ Add New'}
                  </button>
                </div>

                {/* Form to Add Address */}
                {showAddressForm && (
                  <form onSubmit={handleAddNewAddress} className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-sm">Add New Delivery Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary"
                          required
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary"
                        required
                      />
                      <input
                        type="text"
                        placeholder="ZIP / Postal Code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Save Address
                    </button>
                  </form>
                )}

                {/* Address Selection List */}
                {user?.addresses && user.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedAddressIndex(idx)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative ${
                          selectedAddressIndex === idx
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                        }`}
                      >
                        <p className="font-bold text-sm">Address Option {idx + 1}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                        </p>
                        {selectedAddressIndex === idx && (
                          <span className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-400 font-medium">No saved addresses. Click '+ Add New' above to enter details.</p>
                  </div>
                )}
              </div>

              {/* Delivery Instructions & Scheduling Slot */}
              <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                <h2 className="font-extrabold text-lg flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Clock className="w-5 h-5 text-primary" /> Delivery Scheduling & Instructions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="delivery-slot" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Estimated Time Slot</label>
                    <select
                      id="delivery-slot"
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-semibold"
                    >
                      <option value="ASAP">ASAP (20 - 45 mins)</option>
                      <option value="Today: 6:00 PM - 7:00 PM">Today: 6:00 PM - 7:00 PM</option>
                      <option value="Today: 7:00 PM - 8:00 PM">Today: 7:00 PM - 8:00 PM</option>
                      <option value="Today: 8:00 PM - 9:00 PM">Today: 8:00 PM - 9:00 PM</option>
                      <option value="Tomorrow: 12:00 PM - 1:00 PM">Tomorrow: 12:00 PM - 1:00 PM</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="delivery-notes" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Driver Special Instructions</label>
                    <input
                      id="delivery-notes"
                      type="text"
                      placeholder="e.g. Ring bell, leave package at front door"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                <h2 className="font-extrabold text-lg flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <CreditCard className="w-5 h-5 text-primary" /> Payment Options
                </h2>

                <div className="grid grid-cols-3 gap-4 font-bold">
                  <button
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-4 rounded-2xl border text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'Card' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    Credit Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-4 rounded-2xl border text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'UPI' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <Landmark className="w-5 h-5" />
                    UPI / Wallet
                  </button>
                  <button
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`py-4 rounded-2xl border text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                    COD (Cash)
                  </button>
                </div>

                {/* Form fields depending on payment type */}
                {paymentMethod === 'Card' && (
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 max-w-md animate-fadeIn">
                    <h3 className="font-bold text-sm">Credit / Debit Card Details</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Card Number (e.g. 4111 2222 3333 4444)"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-medium"
                        maxLength={19}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-medium"
                          maxLength={5}
                        />
                        <input
                          type="password"
                          placeholder="CVV"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-medium"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-medium animate-fadeIn">
                    <p>Enter your VPA / UPI ID to receive a payment notification on your UPI app during validation.</p>
                    <input
                      type="text"
                      placeholder="e.g. customer@okupi"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary mt-2 max-w-sm"
                    />
                  </div>
                )}

                {paymentMethod === 'Cash on Delivery' && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-semibold animate-fadeIn">
                    <p className="text-emerald-500 font-bold">No pre-payment required. Pay cash at your doorstep upon hot delivery!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Side Order review and finalize */}
            <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
              <h2 className="font-extrabold text-lg border-b border-slate-100 dark:border-slate-800 pb-3">Final Review</h2>

              <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.foodItem} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Qty: {item.quantity} • ₹{item.price} each</p>
                    </div>
                    <span className="font-extrabold">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Packaging Fee</span>
                  <span>₹{packagingFee.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <div className="flex justify-between text-sm font-extrabold">
                  <span>Grand Total</span>
                  <span className="text-primary text-base">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-md hover:shadow-lg text-xs uppercase tracking-wider"
              >
                {loading ? 'Processing...' : 'Place Order Now'}
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
