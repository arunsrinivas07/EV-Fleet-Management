import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
      <div className="w-16 h-6 bg-gray-200 rounded-full" />
    </div>
    <div className="w-24 h-8 bg-gray-200 rounded-lg mb-2" />
    <div className="w-32 h-4 bg-gray-100 rounded-lg" />
  </div>
);

export const SkeletonVehicleCard = () => (
  <div className="bg-white rounded-3xl p-5 shadow-card border border-gray-100 animate-pulse">
    <div className="w-full h-40 bg-gray-200 rounded-2xl mb-4" />
    <div className="w-32 h-5 bg-gray-200 rounded mb-2" />
    <div className="w-24 h-4 bg-gray-100 rounded mb-4" />
    <div className="grid grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-xl" />
      ))}
    </div>
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
    <div className="w-16 h-6 bg-gray-200 rounded-full" />
  </div>
);

export default function LoadingSkeleton({ type = 'card', count = 4 }) {
  const Component = type === 'card' ? SkeletonCard : type === 'vehicle' ? SkeletonVehicleCard : SkeletonRow;
  return (
    <div className={`grid gap-4 ${type === 'card' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : type === 'vehicle' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
      {[...Array(count)].map((_, i) => <Component key={i} />)}
    </div>
  );
}
