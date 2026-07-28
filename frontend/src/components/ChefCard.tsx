import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Chef {
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

interface ChefCardProps {
  chef: Chef;
}

export default function ChefCard({ chef }: ChefCardProps) {
  const handleCoverError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400";
  };

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=150";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-lightbg-card dark:bg-darkbg-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-premium dark:hover:shadow-premiumDark transition-all duration-300 flex flex-col h-full group"
    >
      {/* Cover Image & Avatar */}
      <div className="relative h-32 w-full bg-slate-100 dark:bg-slate-800">
        <img
          src={chef.coverImageUrl || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400"}
          alt={`${chef.user.name}'s Kitchen Cover`}
          onError={handleCoverError}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Avatar */}
        <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 overflow-hidden shadow-md">
          <img
            src={chef.avatarUrl || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=150"}
            alt={`${chef.user.name}'s Chef Portrait`}
            onError={handleAvatarError}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* Chef Details */}
      <div className="p-6 pt-8 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-extrabold text-base sm:text-lg leading-snug group-hover:text-primary transition-colors">
              {chef.user.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{chef.rating}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
            {chef.bio}
          </p>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {chef.specialties.map((spec, i) => (
              <span
                key={i}
                className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
          <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {chef.deliveryTime}
          </span>

          <Link
            to={`/chef/${chef._id}`}
            className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors group-hover:translate-x-0.5 duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
            aria-label={`View chef kitchen and menu of ${chef.user.name}`}
          >
            View Kitchen
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
