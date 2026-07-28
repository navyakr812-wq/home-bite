import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext_old';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User as UserIcon, LogOut, Menu, X, ShieldAlert, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2.5 focus:rounded-xl focus:m-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-bold text-xs"
      >
        Skip to main content
      </a>

      <nav 
        className="sticky top-0 z-40 bg-lightbg-card/90 dark:bg-darkbg-card/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-sm"
        aria-label="Main Navigation Menu"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg" aria-label="HomeBite Brand Page Home">
                <span className="text-2xl font-black bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent tracking-tight">
                  HomeBite
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 font-semibold text-xs tracking-wide uppercase" role="menubar">
              <Link
                to="/"
                role="menuitem"
                className={`transition-colors py-1 relative ${isActive('/') ? 'text-primary' : 'hover:text-primary'}`}
              >
                Home
                {isActive('/') && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </Link>
              <Link
                to="/menu"
                role="menuitem"
                className={`transition-colors py-1 relative ${isActive('/menu') ? 'text-primary' : 'hover:text-primary'}`}
              >
                Menu
                {isActive('/menu') && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </Link>
              <Link
                to="/about"
                role="menuitem"
                className={`transition-colors py-1 relative ${isActive('/about') ? 'text-primary' : 'hover:text-primary'}`}
              >
                About Us
                {isActive('/about') && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </Link>
              <Link
                to="/contact"
                role="menuitem"
                className={`transition-colors py-1 relative ${isActive('/contact') ? 'text-primary' : 'hover:text-primary'}`}
              >
                Contact
                {isActive('/contact') && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </Link>
              {(user?.role === 'chef' || user?.role === 'admin') && (
                <Link
                  to="/kitchen"
                  role="menuitem"
                  className={`transition-colors py-1 relative ${isActive('/kitchen') ? 'text-primary' : 'hover:text-primary'}`}
                >
                  Kitchen
                  {isActive('/kitchen') && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  role="menuitem"
                  className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors font-bold uppercase"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Action Icons */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard?tab=wishlist"
                className="relative text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                title="Wishlist"
                aria-label={`View Wishlist containing ${user?.wishlist?.length || 0} items`}
              >
                <Heart className="w-5.5 h-5.5" />
                {user && user.wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                    {user.wishlist.length}
                  </span>
                )}
              </Link>
              
              <Link
                to="/cart"
                className="relative text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                title="Cart"
                aria-label={`View Cart containing ${cartCount} items`}
              >
                <ShoppingBag className="w-5.5 h-5.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                    aria-label="User Account Dashboard"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="max-w-[100px] truncate text-sm font-semibold">{user.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg p-1"
                    title="Logout"
                    aria-label="Logout account"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-3">
              <Link to="/cart" className="relative p-2 text-slate-600 dark:text-slate-300" aria-label="Shopping Cart">
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-lightbg-card dark:bg-darkbg-card border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2 flex flex-col font-semibold text-sm"
            >
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Home</Link>
              <Link to="/menu" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Menu</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">About Us</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Contact</Link>
              {(user?.role === 'chef' || user?.role === 'admin') && (
                <Link to="/kitchen" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Kitchen</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 text-red-500 font-bold flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> Admin Panel
                </Link>
              )}
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <UserIcon className="w-5 h-5" /> My Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 text-left text-red-500 flex items-center gap-2 w-full"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 block w-full text-center bg-primary text-white py-2.5 rounded-xl font-bold text-xs uppercase"
                >
                  Sign In
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
