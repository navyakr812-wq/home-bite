import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext_old';
import DishCard, { Dish } from '../components/DishCard';
import { GridSkeleton } from '../components/Skeletons';
import { Star, Clock, Award, Utensils, MessageSquare, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChefDetailType {
  _id: string;
  bio: string;
  avatarUrl: string;
  coverImageUrl: string;
  specialties: string[];
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  user: {
    name: string;
  };
}

interface Review {
  _id: string;
  reviewer: {
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

const FALLBACK_CHEF: ChefDetailType = {
  _id: 'chef-1',
  bio: 'Award-winning pastry chef and home cook specializing in Mediterranean breakfast & desserts.',
  avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=200',
  coverImageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
  specialties: ['Breakfast', 'Desserts'],
  rating: 4.8,
  reviewsCount: 15,
  deliveryTime: '20-35 mins',
  user: { name: 'Chef Maria' }
};

const FALLBACK_MENU: Dish[] = [];

const FALLBACK_REVIEWS: Review[] = [
  {
    _id: 'rev-1',
    reviewer: { name: 'Alice Smith' },
    rating: 5,
    comment: 'The pancakes are incredible! Fluffy, hot, and delicious.',
    createdAt: '2026-07-20T10:00:00Z'
  },
  {
    _id: 'rev-2',
    reviewer: { name: 'David Johnson' },
    rating: 4,
    comment: 'Great service. Delivered right on time.',
    createdAt: '2026-07-18T12:30:00Z'
  }
];

export default function ChefDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [chef, setChef] = useState<ChefDetailType | null>(null);
  const [menu, setMenu] = useState<Dish[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');

  // Review Form States
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchChefDetails = async () => {
    try {
      const res = await api.get(`/chefs/${id}`);
      setChef(res.data.chef);
      setMenu(res.data.menu);
      setReviews(res.data.reviews);
    } catch (err) {
      console.error('Error fetching chef details:', err);
      setChef(null);
      setMenu([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchChefDetails();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!comment.trim()) {
      setReviewError('Review description cannot be empty.');
      return;
    }

    try {
      await api.post(`/chefs/${id}/reviews`, { rating, comment: comment.trim() });
      setReviewSuccess(true);
      setComment('');
      fetchChefDetails();
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError('Error submitting review. Please check backend connection.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-60 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <GridSkeleton count={4} />
      </div>
    );
  }

  if (!chef) return <div className="text-center py-20">Chef profile not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-20"
    >
      {/* Cover Image */}
      <div className="relative h-60 md:h-80 w-full bg-slate-100 dark:bg-slate-800">
        <img
          src={chef.coverImageUrl || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200"}
          alt={chef.user.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </div>

      {/* Profile Header Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 z-10">
        <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 overflow-hidden shadow-md">
              <img
                src={chef.avatarUrl || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=200"}
                alt={chef.user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                <Award className="w-3.5 h-3.5" /> Certified Home Cook
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{chef.user.name}</h1>
              <p className="text-slate-500 text-sm max-w-xl font-medium">{chef.bio}</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-6 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0 shrink-0">
            <div className="text-center">
              <span className="flex items-center justify-center gap-1 font-bold text-lg">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                {chef.rating}
              </span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reviews ({chef.reviewsCount})</p>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 self-center" />
            <div className="text-center">
              <span className="flex items-center justify-center gap-1 font-bold text-lg">
                <Clock className="w-5 h-5 text-primary" />
                {chef.deliveryTime}
              </span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Est. Delivery</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mt-10 mb-8 font-semibold">
          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-4 px-6 flex items-center gap-2 border-b-2 text-sm transition-all duration-300 ${
              activeTab === 'menu'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Kitchen Menu
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 px-6 flex items-center gap-2 border-b-2 text-sm transition-all duration-300 ${
              activeTab === 'reviews'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chefs Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'menu' ? (
          menu.length === 0 ? (
            <div className="text-center py-20 bg-lightbg-card dark:bg-darkbg-card border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
              <span className="text-4xl block">🍳</span>
              <p className="font-bold text-slate-500">No dishes are available today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fadeIn">
              {menu.map((dish) => (
                <DishCard key={dish._id} dish={dish} />
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fadeIn">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-lightbg-card dark:bg-darkbg-card border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <span className="text-4xl block mb-2">💬</span>
                  <p className="font-bold text-slate-500">No reviews yet. Be the first to leave one!</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                          {rev.reviewer.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-sm">{rev.reviewer.name}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm italic text-slate-600 dark:text-slate-400 font-medium">"{rev.comment}"</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Posted on {new Date(rev.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>

            {/* Leave a review Form */}
            <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
              <h3 className="font-extrabold text-base border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-primary" /> Leave a Review
              </h3>
              
              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Rating star selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Your Rating</label>
                    <div className="flex gap-1" aria-label="Interactive rating star selector">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isSelected = star <= (hoverRating !== null ? hoverRating : rating);
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 text-slate-300 hover:text-yellow-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                          >
                            <Star className={`w-6 h-6 transition-colors ${isSelected ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="review-desc" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Description</label>
                    <textarea
                      id="review-desc"
                      rows={4}
                      value={comment}
                      onChange={(e) => {
                        setComment(e.target.value);
                        setReviewError('');
                      }}
                      placeholder="Share your dining experience..."
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>

                  {reviewError && <p className="text-xs text-red-500 font-bold">{reviewError}</p>}
                  {reviewSuccess && (
                    <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Review submitted successfully!
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">Please sign in to write a testimonial feedback review.</p>
                  <Link
                    to="/auth"
                    className="inline-block bg-primary text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
