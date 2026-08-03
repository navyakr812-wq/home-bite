import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import DishCard, { Dish } from '../components/DishCard';
import ChefCard, { Chef } from '../components/ChefCard';
import { GridSkeleton } from '../components/Skeletons';
import { Search, MapPin, Award, ShieldCheck, HeartHandshake, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: 'Breakfast', icon: '🥞', description: 'Fresh morning starters' },
  { name: 'Lunch', icon: '🍛', description: 'Wholesome noon meals' },
  { name: 'Dinner', icon: '🥗', description: 'Light & tasty dinners' },
  { name: 'Snacks', icon: '🍟', description: 'Quick bites & crisps' },
  { name: 'Desserts', icon: '🧁', description: 'Sweet cravings' }
];

const REVIEWS = [
  { name: 'Alice Smith', role: 'Daily Customer', rating: 5, comment: 'The butter chicken tasted exactly like home! Knowing it is cooked in a clean home kitchen makes it even better.' },
  { name: 'David Johnson', role: 'Busy Professional', rating: 5, comment: 'HomeBite has solved my weekday lunch struggle. The meals are fresh, light, and delivered hot.' },
  { name: 'Sophie Miller', role: 'Dessert Lover', rating: 4, comment: 'Chef Marias crème brûlée is absolute heaven! Better than most five-star restaurants in town.' }
];

const FALLBACK_DISHES: Dish[] = [];

const FALLBACK_CHEFS: Chef[] = [];

export default function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dishesRes, chefsRes] = await Promise.all([
          api.get('/dishes'),
          api.get('/chefs')
        ]);
        setDishes(dishesRes.data.slice(0, 4));
        setChefs(chefsRes.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching home page data:', err);
        setDishes([]);
        setChefs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/menu?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-20 pb-20"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40 py-20 lg:py-28 border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          {/* Left Text Column */}
          <div className="space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" /> Neighborhood Home Cooks
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Fresh Homemade Food <br />
              <span className="text-primary">Delivered to Your Door</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
              Ditch the commercial kitchens. Taste the love, warmth, and high-quality ingredients of home-cooked culinary magic in every single bite.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <div className="relative flex-grow">
                <label htmlFor="hero-search" className="sr-only">Search dishes or home kitchens</label>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="hero-search"
                  type="text"
                  placeholder="Search dishes or home kitchens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm font-semibold"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right Image Column */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-[480px] h-[360px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"
                alt="Assorted delicious healthy home-cooked meals layout"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Badges floating */}
            <div className="absolute top-8 left-0 md:-left-8 bg-white dark:bg-slate-900 shadow-lg px-4 py-3 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
              <Award className="w-8 h-8 text-primary" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Certified Cooks</p>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">100% Home Chefs</p>
              </div>
            </div>
            <div className="absolute bottom-8 right-0 md:-right-8 bg-white dark:bg-slate-900 shadow-lg px-4 py-3 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Hygiene Checked</p>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">Premium Safety</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Explore Categories</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold">Select your cravings and explore customized curated homemade menus</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <Link key={idx} to={`/menu?category=${cat.name}`} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center justify-center p-6 bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center hover:border-primary dark:hover:border-primary transition-all duration-300 cursor-pointer"
              >
                <span className="text-4xl mb-3" role="img" aria-label={cat.name}>{cat.icon}</span>
                <span className="font-bold text-base block mb-0.5">{cat.name}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cat.description}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Dishes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Featured Dishes</h2>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">Hottest home meals prepared fresh today</p>
          </div>
          <Link to="/menu" className="text-primary hover:text-primary-dark font-extrabold text-sm flex items-center gap-1">
            View All Dishes &rarr;
          </Link>
        </div>

        {loading ? (
          <GridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {dishes.map((dish) => (
              <DishCard key={dish._id} dish={dish} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Home Chefs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/20 py-16 rounded-3xl border border-slate-200/40 dark:border-slate-800/40">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Popular Home Chefs</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold">Meet the passionate cooks serving in your neighborhood</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {chefs.map((chef) => (
              <ChefCard key={chef._id} chef={chef} />
            ))}
          </div>
        )}
      </section>

      {/* Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Customer Testimonials</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold">Hear what foodies say about the delicious homemade tastes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((rev, idx) => (
            <div key={idx} className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-0.5" aria-label={`Rating score ${rev.rating} stars`}>
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-sm text-slate-600 dark:text-slate-400">"{rev.comment}"</p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{rev.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{rev.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Download App Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary to-orange-600 text-white rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">Order On The Go!</h2>
            <p className="text-sm md:text-base text-orange-55 leading-relaxed">
              Download the HomeBite mobile app to trace delivery status in real-time, save your favorite recipes, and receive instant notifications.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#" className="bg-white text-slate-900 font-bold px-6 py-3.5 rounded-full hover:bg-orange-50 transition-colors shadow-md text-xs uppercase tracking-wider">
                Google Play Store
              </a>
              <a href="#" className="bg-slate-950 text-white font-bold px-6 py-3.5 rounded-full hover:bg-slate-900 transition-colors shadow-md text-xs uppercase tracking-wider border border-slate-800">
                Apple App Store
              </a>
            </div>
          </div>
          <div className="w-full md:w-[320px] h-[240px] md:h-[320px] relative shrink-0 overflow-hidden rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            <HeartHandshake className="w-24 h-24 text-white/50" />
          </div>
        </div>
      </section>
    </motion.div>
  );
}
