import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext_old';
import { Mail, Lock, User as UserIcon, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth() {
  const navigate = useNavigate();
  const { login, signup, user } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'chef'>('customer');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    // Quick validation checks
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    
    if (mode !== 'forgot' && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        navigate('/');
      } else if (mode === 'signup') {
        if (!name.trim() || !email.trim() || !password) {
          setErrorMsg('All registration fields are required.');
          setLoading(false);
          return;
        }
        await signup(name.trim(), email.trim(), password, role);
        navigate('/');
      } else if (mode === 'forgot') {
        setSuccessMsg(`A password reset link has been dispatched to ${email.trim()}.`);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen flex items-center justify-center"
    >
      <div className="w-full max-w-md bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl p-8 relative">
        
        {/* Title */}
        <div className="text-center mb-8 space-y-1.5">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            HomeBite
          </span>
          <h2 className="text-2xl font-black tracking-tight">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-400 font-semibold">
            {mode === 'login' && 'Sign in to order fresh homemade delicacies'}
            {mode === 'signup' && 'Join the home cooking revolution'}
            {mode === 'forgot' && 'Enter email to receive password reset links'}
          </p>
        </div>

        {/* Error / Success Alerts */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/30 p-3.5 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2"
            >
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border border-emerald-100 dark:border-emerald-900/30 p-3.5 rounded-2xl text-xs font-bold mb-6"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                    required
                  />
                </div>

                {/* Role Switcher */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">I want to register as:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        role === 'customer'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      Customer / Foodie
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('chef')}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        role === 'chef'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      Home Chef / Cook
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg('');
              }}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                required
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-primary font-bold hover:underline focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-2xl font-bold transition-all duration-300 shadow-md hover:shadow-lg text-xs uppercase tracking-wider"
          >
            {loading ? 'Processing...' : (
              mode === 'login' ? 'Sign In' : (mode === 'signup' ? 'Create Account' : 'Request Reset Link')
            )}
          </button>
        </form>

        {/* Footer Toggle links */}
        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-6 space-y-2 font-medium">
          {mode === 'login' ? (
            <p>
              New to HomeBite?{' '}
              <button onClick={() => setMode('signup')} className="text-primary font-bold hover:underline focus:outline-none">
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-primary font-bold hover:underline focus:outline-none">
                Sign In
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <button onClick={() => setMode('login')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline font-semibold focus:outline-none">
              Back to Login
            </button>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl text-[11px] text-slate-500 border border-slate-100 dark:border-slate-800 space-y-1 font-semibold">
          <p className="font-bold text-slate-700 dark:text-slate-300">Quick Testing Credentials:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Customer: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">user@homebite.com</code> / <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">user123</code></li>
            <li>Home Chef: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">chef@homebite.com</code> / <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">chef123</code></li>
            <li>Admin: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">admin@homebite.com</code> / <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">admin123</code></li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
