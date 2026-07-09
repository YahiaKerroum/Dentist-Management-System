import React, { useEffect, useState } from 'react';
import { Calendar, Loader2, Clock } from 'lucide-react';
import { getTodaysAppointments } from '../../../services/report.service';
import { TodayAppointment } from '../../../types/report.types';

interface TodaysAppointmentsTableProps {
  token: string;
}

export const TodaysAppointmentsTable: React.FC<TodaysAppointmentsTableProps> = ({ token }) => {
  const [appointments, setAppointments] = useState<TodayAppointment[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getTodaysAppointments(token);
        setAppointments(response.data.appointments);
        setCount(response.data.count);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-info-100 text-info-700';
      case 'COMPLETED':
        return 'bg-success-100 text-success-700';
      case 'CANCELLED':
        return 'bg-danger-100 text-danger-700';
      case 'NO_SHOW':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-surface-100 text-surface-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-surface-200 rounded-lg p-4 flex items-center justify-center h-64">
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
    <div className="bg-white border border-surface-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="text-primary-600" size={20} />
        <h3 className="font-display font-semibold tracking-tight text-surface-900">Today's Appointments</h3>
        <span className="bg-surface-100 text-surface-600 text-xs px-2 py-1 rounded-full tabular-nums">
          {count}
        </span>
      </div>

      {/* Empty State */}
      {appointments.length === 0 && (
        <div className="text-center py-8 text-surface-500">
          <Clock size={32} className="mx-auto mb-2 text-surface-300" />
          <p>No appointments scheduled for today</p>
        </div>
      )}

      {/* Table */}
      {appointments.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-surface-500 uppercase">
                <th className="pb-2">Time</th>
                <th className="pb-2">Patient</th>
                <th className="pb-2">Doctor</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {appointments.map((apt) => (
                <tr key={apt.id} className="text-sm">
                  <td className="py-2 font-medium text-surface-800">
                    {formatTime(apt.dateOfTreatment)}
                  </td>
                  <td className="py-2">
                    <div className="text-surface-800">
                      {apt.patient.firstName} {apt.patient.lastName}
                    </div>
                    <div className="text-xs text-surface-500">{apt.patient.phone || 'No phone'}</div>
                  </td>
                  <td className="py-2 text-surface-600">
                    Dr. {apt.doctor.user.firstName} {apt.doctor.user.lastName}
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

export default TodaysAppointmentsTable;