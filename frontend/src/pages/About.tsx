import React from 'react';
import { Award, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 min-h-screen">
      {/* Intro section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Our Mission & Story</h1>
        <p className="text-slate-500 text-base leading-relaxed">
          HomeBite is built on the philosophy that nothing beats a freshly prepared home meal. We connect passionate local chefs with food lovers in their neighborhood, fostering micro-businesses and encouraging clean, healthy eating habits.
        </p>
      </div>

      {/* Grid of Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Talented Home Chefs</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We partner with passionate local home chefs who bring years of home cooking expertise and traditional family recipes to your table.
          </p>
        </div>

        <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Rigorous Safety Standards</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every home kitchen undergoes standard sanitation audit checks to ensure meals are prepared in clean, safe, and hygienic environments.
          </p>
        </div>

        <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Supporting Neighborhoods</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            By ordering from HomeBite, you directly support local home chefs, helping families turn their culinary passion into sustainable livelihoods.
          </p>
        </div>
      </div>
    </div>
  );
}
