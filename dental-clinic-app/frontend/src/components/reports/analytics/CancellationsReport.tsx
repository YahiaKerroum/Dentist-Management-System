import React, { useEffect, useState } from 'react';
import { XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { getCancellations } from '../../../services/report.service';
import { Cancellation } from '../../../types/report.types';

interface CancellationsReportProps {
  token: string;
}

export const CancellationsReport: React.FC<CancellationsReportProps> = ({ token }) => {
  const [cancellations, setCancellations] = useState<Cancellation[]>([]);
  const [count, setCount] = useState<number>(0);
  const [period, setPeriod] = useState<'today' | 'week'>('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async (selectedPeriod: 'today' | 'week') => {
    try {
      setLoading(true);
      const response = await getCancellations(token, selectedPeriod);
      setCancellations(response.data.cancellations);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Header with Stat Card */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-50 text-red-600">
            <XCircle size={24} />
          </div>
          <div>
            <div className="text-sm text-gray-500">Cancellations</div>
            <div className="text-2xl font-semibold text-gray-800">{count}</div>
            <div className="text-xs text-gray-400">
              {period === 'today' ? 'Today' : 'This week'}
            </div>
          </div>
        </div>

        {/* Period Toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              period === 'today'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              period === 'week'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-red-600" size={24} />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-red-500 text-sm py-4">{error}</div>
      )}

      {/* Empty State */}
      {!loading && !error && cancellations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle size={32} className="mx-auto mb-2 text-gray-300" />
          <p>No cancellations {period === 'today' ? 'today' : 'this week'}</p>
          <p className="text-xs text-green-600 mt-1">Great news!</p>
        </div>
      )}

      {/* Cancellations List */}
      {!loading && !error && cancellations.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {cancellations.map((cancellation) => (
            <div
              key={cancellation.id}
              className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-800">
                  {cancellation.patient.firstName} {cancellation.patient.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  Dr. {cancellation.doctor.user.firstName} {cancellation.doctor.user.lastName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {formatDate(cancellation.updatedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CancellationsReport;