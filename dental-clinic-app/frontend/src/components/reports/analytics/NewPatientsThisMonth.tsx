import React, { useEffect, useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { getNewPatientsThisMonth } from '../../../services/report.service';

interface NewPatientsThisMonthProps {
  token: string;
}

export const NewPatientsThisMonth: React.FC<NewPatientsThisMonthProps> = ({ token }) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getNewPatientsThisMonth(token);
        setCount(response.data.count);
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
        <Loader2 className="animate-spin text-green-600" size={24} />
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
        <UserPlus size={24} />
      </div>
      <div>
        <div className="text-sm text-surface-500">New Patients</div>
        <div className="text-2xl font-semibold text-surface-800">{count}</div>
        <div className="text-xs text-surface-400">This month</div>
      </div>
    </div>
  );
};

export default NewPatientsThisMonth;