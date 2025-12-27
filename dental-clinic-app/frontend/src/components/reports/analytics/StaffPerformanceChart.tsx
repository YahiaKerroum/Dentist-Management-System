import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Loader2 } from 'lucide-react';
import { getStaffPerformance } from '../../../services/report.service';
import { StaffMember } from '../../../types/report.types';

interface StaffPerformanceChartProps {
  token: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const StaffPerformanceChart: React.FC<StaffPerformanceChartProps> = ({ token }) => {
  const [data, setData] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'revenue' | 'appointments' | 'treatments'>('revenue');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getStaffPerformance(token);
        setData(response.data.performance);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getDataKey = () => {
    switch (view) {
      case 'revenue':
        return 'revenue';
      case 'appointments':
        return 'completedAppointments';
      case 'treatments':
        return 'treatments';
    }
  };

  const getLabel = () => {
    switch (view) {
      case 'revenue':
        return 'Revenue';
      case 'appointments':
        return 'Completed Appointments';
      case 'treatments':
        return 'Treatments';
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-center h-80">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-800">Staff Performance</h3>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['revenue', 'appointments', 'treatments'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${
                view === v
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              fontSize={12}
              tickFormatter={(value) => (view === 'revenue' ? `$${(value / 1000).toFixed(0)}k` : value.toString())}
            />
            <YAxis type="category" dataKey="name" fontSize={12} width={95} />
            <Tooltip
              formatter={(value: any) => [view === 'revenue' ? formatCurrency(value) : value, getLabel()]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey={getDataKey()} radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No staff performance data available
        </div>
      )}

      {/* Stats Table */}
      {data.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="pb-2">Doctor</th>
                <th className="pb-2 text-right">Revenue</th>
                <th className="pb-2 text-right">Appointments</th>
                <th className="pb-2 text-right">Treatments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((staff, index) => (
                <tr key={staff.doctorId}>
                  <td className="py-2 flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {staff.name}
                  </td>
                  <td className="py-2 text-right font-medium">{formatCurrency(staff.revenue)}</td>
                  <td className="py-2 text-right">{staff.completedAppointments}</td>
                  <td className="py-2 text-right">{staff.treatments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffPerformanceChart;