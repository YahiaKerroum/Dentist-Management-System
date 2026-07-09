import React, { useEffect, useState } from 'react';
import { CalendarClock, Loader2 } from 'lucide-react';
import { getUpcomingAppointments } from '../../../services/report.service';

interface UpcomingAppointmentsProps {
  token: string;
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ token }) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getUpcomingAppointments(token);
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
      <div className="p-3 rounded-lg bg-info-50 text-info-600">
        <CalendarClock size={24} />
      </div>
      <div>
        <div className="text-sm text-surface-500">Upcoming Appointments</div>
        <div className="font-display text-2xl font-semibold tracking-tight text-surface-900 tabular-nums">{count}</div>
        <div className="text-xs text-surface-400">Next 7 days</div>
      </div>
    </div>
  );
};

export default UpcomingAppointments;