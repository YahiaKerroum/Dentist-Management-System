import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Loader2 } from 'lucide-react';
import { getRevenueGenerated } from '../../../services/report.service';
import { CHART_STATUS, chartTooltip, CHART_GRID_COLOR, CHART_AXIS_TICK } from '../../../lib/chartTheme';

interface RevenueGeneratedChartProps {
  token: string;
}

export const RevenueGeneratedChart: React.FC<RevenueGeneratedChartProps> = ({ token }) => {
  const [data, setData] = useState<{ month: string; revenue: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [months, setMonths] = useState<number>(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async (selectedMonths: number) => {
    try {
      setLoading(true);
      const response = await getRevenueGenerated(token, selectedMonths);
      setData(response.data.trends);
      setTotalRevenue(response.data.totalRevenue);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(months);
  }, [token, months]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

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

  return (
    <div className="bg-white border border-surface-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="text-primary-600" size={20} />
          <h3 className="font-display font-semibold tracking-tight text-surface-900">Revenue Generated</h3>
          <span className="bg-success-100 text-success-700 text-xs px-2 py-1 rounded-full tabular-nums">
            {formatCurrency(totalRevenue)}
          </span>
        </div>

        <div className="flex gap-1 bg-surface-100 rounded-lg p-1">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                months === m
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-surface-600 hover:text-surface-800'
              }`}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_STATUS.positive} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_STATUS.positive} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
            <XAxis dataKey="month" tick={CHART_AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis
              tick={CHART_AXIS_TICK}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={(value: any) => [formatCurrency(value), 'Revenue']} {...chartTooltip} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CHART_STATUS.positive}
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-surface-500">
          No revenue data available
        </div>
      )}
    </div>
  );
};

export default RevenueGeneratedChart;