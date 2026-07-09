import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { getTotalRevenueTrend } from '../../../services/report.service';
import { CHART_STATUS, chartTooltip, CHART_GRID_COLOR, CHART_AXIS_TICK } from '../../../lib/chartTheme';

interface RevenueTrendChartProps {
  token: string;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ token }) => {
  const [data, setData] = useState<{ month: string; revenue: number; expenses: number; profit: number }[]>([]);
  const [months, setMonths] = useState<number>(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async (selectedMonths: number) => {
    try {
      setLoading(true);
      const response = await getTotalRevenueTrend(token, selectedMonths);
      setData(response.data.trends);
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

  // Calculate totals
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;

  if (loading) {
    return (
      <div className="bg-white border border-surface-200 rounded-lg p-4 flex items-center justify-center h-96">
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
          <TrendingUp className="text-primary-600" size={20} />
          <h3 className="font-display font-semibold tracking-tight text-surface-900">Revenue vs Expenses Trend</h3>
        </div>

        <div className="flex gap-1 bg-surface-100 rounded-lg p-1">
          {[6, 12].map((m) => (
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

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xs text-surface-500">Total Revenue</div>
          <div className="font-display text-lg font-semibold text-success-700 tabular-nums">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-surface-500">Total Expenses</div>
          <div className="font-display text-lg font-semibold text-danger-600 tabular-nums">{formatCurrency(totalExpenses)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-surface-500">Net Profit</div>
          <div className={`font-display text-lg font-semibold tabular-nums ${totalProfit >= 0 ? 'text-info-700' : 'text-danger-600'}`}>
            {formatCurrency(totalProfit)}
          </div>
        </div>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
            <XAxis dataKey="month" tick={CHART_AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis
              tick={CHART_AXIS_TICK}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={(value: any, name: any) => [formatCurrency(value), name]} {...chartTooltip} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke={CHART_STATUS.positive} strokeWidth={2} name="Revenue" dot={false} />
            <Line type="monotone" dataKey="expenses" stroke={CHART_STATUS.negative} strokeWidth={2} name="Expenses" dot={false} />
            <Line type="monotone" dataKey="profit" stroke={CHART_STATUS.neutral} strokeWidth={2} name="Profit" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-surface-500">
          No trend data available
        </div>
      )}
    </div>
  );
};

export default RevenueTrendChart;