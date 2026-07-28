import React from 'react';

export function CardSkeleton() {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-4 space-y-4 animate-pulse">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3" />
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-2/3" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl items-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
          <div className="flex-grow space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-pulse">
      <div className="h-10 bg-slate-100 dark:bg-slate-800 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-11/12" />
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-10/12" />
      </div>
    </div>
  );
}
