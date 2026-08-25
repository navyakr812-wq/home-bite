import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext_old';
import { Heart, Star, Clock, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';

export interface Dish {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  rating: number;
  prepTime: string;
  chef: {
    _id: string;
    user: {
      name: string;
    };
  };
}

interface DishCardProps {
  dish: Dish;
}

export default function DishCard({ dish }: DishCardProps) {
  const { addToCart } = useCart();
  const { user, toggleWishlist, openAuthModal } = useAuth();

  const isStarred = user?.wishlist?.includes(dish._id) || false;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal(() => {
        // Toggle wishlist immediately after successful login
        api.post('/auth/wishlist', { foodItemId: dish._id }).then(() => {
          // Trigger a refresh or window update if necessary, or just rely on state sync.
          // Since context exposes toggleWishlist, we can call toggleWishlist(dish._id) directly:
          toggleWishlist(dish._id);
        });
      });
      return;
    }
    toggleWishlist(dish._id);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-lightbg-card dark:bg-darkbg-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-premium dark:hover:shadow-premiumDark transition-all duration-300 flex flex-col h-full group"
    >
      {/* Dish Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={dish.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"}
          alt={`Photograph of ${dish.name}`}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-red-500 dark:hover:text-red-500 shadow-md hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={isStarred ? `Remove ${dish.name} from wishlist` : `Add ${dish.name} to wishlist`}
        >
          <Heart className={`w-5 h-5 ${isStarred ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
        {/* Rating tag */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm text-slate-800 dark:text-slate-100">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span>{dish.rating}</span>
        </div>
      </div>

      {/* Dish Details */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <h3 className="font-extrabold text-base sm:text-lg leading-snug group-hover:text-primary transition-colors">
              {dish.name}
            </h3>
            <span className="font-black text-lg sm:text-xl text-primary shrink-0">₹{dish.price}</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {dish.description}
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {dish.prepTime}
            </span>
            <span>•</span>
            <span className="truncate">
              By <strong className="text-slate-700 dark:text-slate-200 font-bold">{dish.chef?.user?.name || "Premium Chef"}</strong>
            </span>
          </div>
        </div>

        {/* Add To Cart */}
        <button
          onClick={() => addToCart({ foodItem: dish._id, name: dish.name, price: dish.price, imageUrl: dish.imageUrl })}
          className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={`Add one ${dish.name} to shopping cart`}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
