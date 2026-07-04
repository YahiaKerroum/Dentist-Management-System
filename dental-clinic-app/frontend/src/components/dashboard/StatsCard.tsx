import React from 'react';
import { motion } from 'framer-motion';

export const StatsCard: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({ icon, value, label }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg border border-surface-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary-50">{icon}</div>
      <h3 className="text-2xl font-semibold text-surface-900">{value}</h3>
      <p className="mt-0.5 text-sm text-surface-500">{label}</p>
    </motion.div>
  );
};

export default StatsCard;
