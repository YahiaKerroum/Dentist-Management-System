import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, Loader2 } from 'lucide-react';
import { getExpensesByCategory } from '../../../services/report.service';

interface ExpensesByCategoryChartProps {
  token: string;
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
];

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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="text-purple-600" size={20} />
          <h3 className="font-semibold text-gray-800">Expenses by Category</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Total Expenses</div>
          <div className="text-lg font-semibold text-purple-600">{formatCurrency(totalAmount)}</div>
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
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCurrency(value)}
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="category"
              fontSize={12}
              width={75}
            />
            <Tooltip
              formatter={(value: any) => [formatCurrency(value), 'Amount']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
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
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-600 truncate">{item.category}</span>
              <span className="text-gray-400">({item.count})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpensesByCategoryChart;