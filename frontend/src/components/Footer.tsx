import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800" aria-label="HomeBite Page Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand & Slogan */}
          <div className="space-y-4">
            <span className="text-2xl font-black bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent tracking-tight">
              HomeBite
            </span>
            <p className="text-sm text-slate-400 leading-relaxed">
              Fresh, nutritious, and delicious homemade food delivered directly to your doorstep. Supporting local chefs and families.
            </p>
            <div className="flex gap-4 pt-1">
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-primary hover:text-white transition-colors" aria-label="Facebook Link"><Facebook className="w-4.5 h-4.5" /></a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-primary hover:text-white transition-colors" aria-label="Instagram Link"><Instagram className="w-4.5 h-4.5" /></a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-primary hover:text-white transition-colors" aria-label="Twitter Link"><Twitter className="w-4.5 h-4.5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-extrabold mb-4 text-sm tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li><Link to="/" className="hover:text-primary transition-colors focus:outline-none focus:text-primary">Home</Link></li>
              <li><Link to="/menu" className="hover:text-primary transition-colors focus:outline-none focus:text-primary">Browse Menu</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors focus:outline-none focus:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors focus:outline-none focus:text-primary">Contact Support</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors focus:outline-none focus:text-primary">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-extrabold mb-4 text-sm tracking-wider uppercase">Get in Touch</h3>
            <ul className="space-y-3.5 text-sm text-slate-400 font-medium">
              <li className="flex items-center gap-3">
                <MapPin className="w-4.5 h-4.5 text-primary shrink-0" />
                <span>123 Culinary Drive, Foodie Town, CA</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4.5 h-4.5 text-primary shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4.5 h-4.5 text-primary shrink-0" />
                <span>support@homebite.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter signup */}
          <div className="space-y-4">
            <h3 className="text-white font-extrabold text-sm tracking-wider uppercase">Newsletter</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Subscribe to receive recipe updates, discount coupons, and new chef alerts.</p>
            
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <label htmlFor="newsletter-email" className="sr-only">Newsletter Email</label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-800 text-white border border-slate-700 px-4 py-2.5 rounded-l-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white px-5 rounded-r-xl transition-all duration-300 font-bold text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  Join
                </button>
              </div>
              <AnimatePresence mode="wait">
                {submitted && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-emerald-400 font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Subscribed successfully!
                  </motion.p>
                )}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-400 font-bold"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} HomeBite Inc. All rights reserved.</span>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:underline focus:outline-none">Privacy Policy</a>
            <a href="#" className="hover:underline focus:outline-none">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
