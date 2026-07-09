import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Stethoscope, Loader2 } from 'lucide-react';
import { getCommonTreatments } from '../../../services/report.service';
import { categoricalColor, chartTooltip } from '../../../lib/chartTheme';

interface CommonTreatmentsChartProps {
  token: string;
}

export const CommonTreatmentsChart: React.FC<CommonTreatmentsChartProps> = ({ token }) => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getCommonTreatments(token);
        
        setData(
          response.data.map((item) => ({
            name: item.type,
            value: item.count,
          }))
        );
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
      <div className="bg-white border border-surface-200 rounded-lg p-4 flex items-center justify-center h-80">
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

  const totalTreatments = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white border border-surface-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Stethoscope className="text-primary-600" size={20} />
        <h3 className="font-display font-semibold tracking-tight text-surface-900">Most Common Treatments</h3>
        <span className="bg-surface-100 text-surface-600 text-xs px-2 py-1 rounded-full tabular-nums">
          Total: {totalTreatments}
        </span>
      </div>

      {/* Chart */}
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={categoricalColor(index)} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any, name: any) => [value, name]} {...chartTooltip} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: any) => <span className="text-xs text-surface-600">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-surface-500">
          No treatment data available
        </div>
      )}
    </div>
  );
};

export default CommonTreatmentsChart;