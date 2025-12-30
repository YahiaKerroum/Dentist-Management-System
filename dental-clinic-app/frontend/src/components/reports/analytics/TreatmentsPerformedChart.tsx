import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Activity, Loader2 } from 'lucide-react';
import { getTreatmentsPerformed } from '../../../services/report.service';

interface TreatmentsPerformedChartProps {
  token: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export const TreatmentsPerformedChart: React.FC<TreatmentsPerformedChartProps> = ({ token }) => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getTreatmentsPerformed(token);
        setData(
          response.data.treatments.map((t) => ({
            name: t.type,
            value: t.count,
          }))
        );
        setTotal(response.data.total);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const renderLabel = (entry: any) => {
    const percent = entry.percent || 0;
    return percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : '';
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
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-purple-600" size={20} />
        <h3 className="font-semibold text-gray-800">My Treatments Performed</h3>
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
          Total: {total}
        </span>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={renderLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [value, name]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: any) => <span className="text-xs text-gray-600">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No treatment data available
        </div>
      )}
    </div>
  );
};

export default TreatmentsPerformedChart;