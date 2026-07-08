import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, Loader2 } from 'lucide-react';
import { getExpensesByCategory } from '../../../services/report.service';
import { categoricalColor, chartTooltip, CHART_GRID_COLOR, CHART_AXIS_TICK } from '../../../lib/chartTheme';

interface ExpensesByCategoryChartProps {
  token: string;
}

export const ExpensesByCategoryChart: React.FC<ExpensesByCategoryChartProps> = ({ token }) => {
  const [data, setData] = useState<{ category: string; total: number; count: number }[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getExpensesByCategory(token);
        setData(response.data.byCategory);
        setTotalAmount(response.data.totalAmount);
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
      maximumFractionDigits: 0,
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="text-primary-600" size={20} />
          <h3 className="font-display font-semibold tracking-tight text-surface-900">Expenses by Category</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-surface-500">Total Expenses</div>
          <div className="font-display text-lg font-semibold text-surface-900 tabular-nums">{formatCurrency(totalAmount)}</div>
        </div>
      </div>

      {/* Chart */}
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCurrency(value)}
              tick={CHART_AXIS_TICK}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={CHART_AXIS_TICK}
              width={75}
            />
            <Tooltip formatter={(value: any) => [formatCurrency(value), 'Amount']} {...chartTooltip} />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={categoricalColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-surface-500">
          No expense data available
        </div>
      )}

      {/* Summary List */}
      {data.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.slice(0, 6).map((item, index) => (
            <div key={item.category} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: categoricalColor(index) }}
              />
              <span className="text-surface-600 truncate">{item.category}</span>
              <span className="text-surface-400 tabular-nums">({item.count})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpensesByCategoryChart;