import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const useCountUp = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, gradient, suffix = '', prefix = '', delay = 0 }) {
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const animatedValue = useCountUp(numericValue);
  const isPositive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative bg-white rounded-3xl p-6 shadow-card border border-gray-100 overflow-hidden cursor-pointer group"
    >
      {/* Background gradient accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 ${gradient}`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl ${gradient} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        </div>

        <div className="mt-2">
          <div className="text-3xl font-bold text-gray-800 tabular-nums">
            {prefix}{typeof value === 'string' && isNaN(numericValue) ? value : `${animatedValue.toLocaleString()}${suffix}`}
          </div>
          <div className="text-sm text-gray-500 font-medium mt-1">{title}</div>
          {trendLabel && (
            <div className="text-xs text-gray-400 mt-1">{trendLabel}</div>
          )}
        </div>
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </motion.div>
  );
}
