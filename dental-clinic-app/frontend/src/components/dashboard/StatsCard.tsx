import React from 'react';

export const StatsCard: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({ icon, value, label }) => {
  return (
    <div className="grid grid-cols-1 mx-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">{icon}</div>
        </div>
        <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;
