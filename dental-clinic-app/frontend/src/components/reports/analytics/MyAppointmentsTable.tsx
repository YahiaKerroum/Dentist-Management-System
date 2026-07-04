import React, { useEffect, useState } from 'react';
import { Calendar, Loader2, Clock } from 'lucide-react';
import { getMyAppointments } from '../../../services/report.service';
import { MyAppointment } from '../../../types/report.types';

interface MyAppointmentsTableProps {
  token: string;
}

export const MyAppointmentsTable: React.FC<MyAppointmentsTableProps> = ({ token }) => {
  const [appointments, setAppointments] = useState<MyAppointment[]>([]);
  const [count, setCount] = useState<number>(0);
  const [period, setPeriod] = useState<'today' | 'week'>('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async (selectedPeriod: 'today' | 'week') => {
    try {
      setLoading(true);
      const response = await getMyAppointments(token, selectedPeriod);
      setAppointments(response.data.appointments);
      setCount(response.data.count);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(period);
  }, [token, period]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-surface-100 text-surface-800';
    }
  };

  return (
    <div className="bg-white border border-surface-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-blue-600" size={20} />
          <h3 className="font-semibold text-surface-800">My Appointments</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {count}
          </span>
        </div>
        
        {/* Period Toggle */}
        <div className="flex gap-1 bg-surface-100 rounded-lg p-1">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              period === 'today'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-surface-600 hover:text-surface-800'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              period === 'week'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-surface-600 hover:text-surface-800'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-blue-600" size={24} />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-red-500 text-sm py-4">{error}</div>
      )}

      {/* Empty State */}
      {!loading && !error && appointments.length === 0 && (
        <div className="text-center py-8 text-surface-500">
          <Clock size={32} className="mx-auto mb-2 text-surface-300" />
          <p>No appointments {period === 'today' ? 'today' : 'this week'}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && appointments.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-surface-500 uppercase">
                <th className="pb-2">Patient</th>
                <th className="pb-2">Date & Time</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {appointments.map((apt) => (
                <tr key={apt.id} className="text-sm">
                  <td className="py-2">
                    <div className="font-medium text-surface-800">
                      {apt.patient.firstName} {apt.patient.lastName}
                    </div>
                    <div className="text-xs text-surface-500">{apt.patient.phone || 'No phone'}</div>
                  </td>
                  <td className="py-2">
                    <div className="text-surface-800">{formatDate(apt.dateOfTreatment)}</div>
                    <div className="text-xs text-surface-500">{formatTime(apt.dateOfTreatment)}</div>
                  </td>
                  <td className="py-2 text-surface-600">
                    {apt.typeOfTreatment || 'General'}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsTable;