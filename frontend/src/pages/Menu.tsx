import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import DishCard, { Dish } from '../components/DishCard';
import { GridSkeleton } from '../components/Skeletons';
import { Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];

const MOCK_ITEMS: Dish[] = [];

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract query params on load
  useEffect(() => {
    const categoryQuery = searchParams.get('category');
    const searchQuery = searchParams.get('search');

    if (categoryQuery) setSelectedCategory(categoryQuery);
    if (searchQuery) setSearchTerm(searchQuery);
  }, [searchParams]);

  useEffect(() => {
    const fetchDishes = async () => {
      setLoading(true);
      try {
        const catParam = selectedCategory !== 'All' ? selectedCategory : '';
        const res = await api.get(`/dishes?category=${catParam}&search=${searchTerm}`);
        setDishes(res.data);
      } catch (err) {
        console.error('Error fetching dishes:', err);
        setDishes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [selectedCategory, searchTerm]);

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Our Kitchen Menu</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-semibold">Order delicious meals cooked directly by experienced home chefs</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <label htmlFor="menu-search-input" className="sr-only">Search dishes</label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            id="menu-search-input"
            type="text"
            placeholder="Search for a recipe..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchParams({ ...Object.fromEntries(searchParams.entries()), search: e.target.value });
            }}
            className="w-full pl-12 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm font-semibold"
          />
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-3 overflow-x-auto pb-3 border-b border-slate-200/50 dark:border-slate-800/40 no-scrollbar scroll-smooth">
        <SlidersHorizontal className="w-5 h-5 text-slate-400 shrink-0 hidden sm:block" />
        <div className="flex gap-2.5">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchParams({ ...Object.fromEntries(searchParams.entries()), category: cat === 'All' ? '' : cat });
              }}
              className={`px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                selectedCategory === cat
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <GridSkeleton count={8} />
        ) : dishes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-24 bg-lightbg-card dark:bg-darkbg-card border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-5"
          >
            <span className="text-5xl block">🍛</span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-700 dark:text-slate-200">No dishes found matching filters</h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto font-medium leading-relaxed">
              We couldn't find any dishes under category "{selectedCategory}"{searchTerm && ` matching "${searchTerm}"`}.
            </p>
            <button
              onClick={handleClearFilters}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {dishes.map((dish) => (
              <DishCard key={dish._id} dish={dish} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
