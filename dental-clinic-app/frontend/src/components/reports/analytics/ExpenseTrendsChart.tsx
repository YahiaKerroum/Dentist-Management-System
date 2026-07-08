import React, { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingDown, Loader2 } from 'lucide-react';
import { getExpenseTrends } from '../../../services/report.service';
import { CHART_STATUS, chartTooltip, CHART_GRID_COLOR, CHART_AXIS_TICK } from '../../../lib/chartTheme';

interface ExpenseTrendsChartProps {
  token: string;
}

export const ExpenseTrendsChart: React.FC<ExpenseTrendsChartProps> = ({ token }) => {
  const [data, setData] = useState<{ month: string; total: number }[]>([]);
  const [months, setMonths] = useState<number>(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async (selectedMonths: number) => {
    try {
      setLoading(true);
      const response = await getExpenseTrends(token, selectedMonths);
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
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate stats
  const totalExpenses = data.reduce((sum, item) => sum + item.total, 0);
  const avgExpenses = data.length > 0 ? totalExpenses / data.length : 0;
  const maxExpense = data.length > 0 ? Math.max(...data.map(d => d.total)) : 0;
  const minExpense = data.length > 0 ? Math.min(...data.map(d => d.total)) : 0;

  // Calculate trend (comparing last month to first month)
  const trendPercentage = data.length >= 2 && data[0].total > 0
    ? ((data[data.length - 1].total - data[0].total) / data[0].total) * 100
    : 0;

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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="text-primary-600" size={20} />
          <h3 className="font-display font-semibold tracking-tight text-surface-900">Expense Trends</h3>
          {trendPercentage !== 0 && (
            <span
              className={`text-xs px-2 py-1 rounded-full tabular-nums ${
                trendPercentage > 0
                  ? 'bg-danger-100 text-danger-700'
                  : 'bg-success-100 text-success-700'
              }`}
            >
              {trendPercentage > 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
            </span>
          )}
        </div>

        {/* Month Selector */}
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

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xs text-surface-500">Total</div>
          <div className="text-sm font-semibold text-surface-800 tabular-nums">{formatCurrency(totalExpenses)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-surface-500">Average</div>
          <div className="text-sm font-semibold text-surface-800 tabular-nums">{formatCurrency(avgExpenses)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-surface-500">Highest</div>
          <div className="text-sm font-semibold text-danger-600 tabular-nums">{formatCurrency(maxExpense)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-surface-500">Lowest</div>
          <div className="text-sm font-semibold text-success-700 tabular-nums">{formatCurrency(minExpense)}</div>
        </div>
      </div>

      {/* Chart */}
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_STATUS.negative} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_STATUS.negative} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
            <XAxis
              dataKey="month"
              tick={CHART_AXIS_TICK}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={CHART_AXIS_TICK}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={(value: any) => [formatCurrency(value), 'Expenses']} {...chartTooltip} />
            <Area
              type="monotone"
              dataKey="total"
              stroke={CHART_STATUS.negative}
              strokeWidth={2}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-surface-500">
          No expense trend data available
        </div>
      )}
    </div>
  );
};

export default ExpenseTrendsChart;