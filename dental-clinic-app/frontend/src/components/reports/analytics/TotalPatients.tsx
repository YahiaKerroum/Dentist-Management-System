import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, Loader2 } from 'lucide-react';
import { getTotalPatients } from '../../../services/report.service';

interface TotalPatientsProps {
  token: string;
}

export const TotalPatients: React.FC<TotalPatientsProps> = ({ token }) => {
  const [total, setTotal] = useState<number>(0);
  const [newThisMonth, setNewThisMonth] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getTotalPatients(token);
        setTotal(response.data.total);
        setNewThisMonth(response.data.newThisMonth);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="bg-white border border-surface-200 rounded-lg p-4 flex items-center justify-center h-24">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-surface-200 rounded-lg p-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-surface-200 rounded-lg p-4 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-green-50 text-green-600">
        <Users size={24} />
      </div>
      <div className="flex-1">
        <div className="text-sm text-surface-500">Total Patients</div>
        <div className="text-2xl font-semibold text-surface-800">{total}</div>
        <div className="flex items-center text-xs text-green-600">
          <TrendingUp size={12} className="mr-1" />
          +{newThisMonth} this month
        </div>
      </div>
    </div>
  );
};

export default TotalPatients;