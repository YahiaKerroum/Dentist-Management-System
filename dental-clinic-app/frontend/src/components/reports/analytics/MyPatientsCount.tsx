import React, { useEffect, useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { getMyPatientsCount } from '../../../services/report.service';

interface MyPatientsCountProps {
  token: string;
}

export const MyPatientsCount: React.FC<MyPatientsCountProps> = ({ token }) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getMyPatientsCount(token);
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
        <Loader2 className="animate-spin text-primary-600" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-surface-200 rounded-lg p-4">
        <p className="text-danger-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-surface-200 rounded-lg p-4 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-primary-50 text-primary-600">
        <Users size={24} />
      </div>
      <div>
        <div className="text-sm text-surface-500">My Patients</div>
        <div className="font-display text-2xl font-semibold tracking-tight text-surface-900 tabular-nums">{count}</div>
        <div className="text-xs text-surface-400">Assigned to you</div>
      </div>
    </div>
  );
};

export default MyPatientsCount;