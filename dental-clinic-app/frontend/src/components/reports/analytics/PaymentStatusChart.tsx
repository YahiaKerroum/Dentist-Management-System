import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CreditCard, Loader2 } from 'lucide-react';
import { getPaymentStatus } from '../../../services/report.service';

interface PaymentStatusChartProps {
  token: string;
}

const COLORS = {
  paid: '#10B981',
  pending: '#F59E0B',
  overdue: '#EF4444',
};

export const PaymentStatusChart: React.FC<PaymentStatusChartProps> = ({ token }) => {
  const [data, setData] = useState<{ name: string; value: number; amount: number; color: string }[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getPaymentStatus(token);
        const { counts, amounts } = response.data;

        setData([
          { name: 'Paid', value: counts.paid, amount: amounts.paid, color: COLORS.paid },
          { name: 'Pending', value: counts.pending, amount: amounts.pending, color: COLORS.pending },
          { name: 'Overdue', value: counts.overdue, amount: amounts.overdue, color: COLORS.overdue },
        ].filter((item) => item.value > 0));

        setTotal(counts.total);
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

  const renderLabel = (entry: any) => {
    const percent = entry.percent || 0;
    return `${(percent * 100).toFixed(0)}%`;
  };

  if (loading) {
    return (
      <div className="bg-white border border-surface-200 rounded-lg p-4 flex items-center justify-center h-80">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-surface-200 rounded-lg p-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-surface-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="text-green-600" size={20} />
        <h3 className="font-semibold text-surface-800">Payment Status</h3>
        <span className="bg-surface-100 text-surface-600 text-xs px-2 py-1 rounded-full">
          Total: {total}
        </span>
      </div>

      {data.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart margin={{ top: 8, right: 28, bottom: 8, left: 28 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
                label={renderLabel}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [value, 'Count']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Amount Summary */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {data.map((item) => (
              <div key={item.name} className="text-center">
                <div className="text-xs text-surface-500">{item.name}</div>
                <div className="text-sm font-semibold" style={{ color: item.color }}>
                  {formatCurrency(item.amount)}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-surface-500">
          No payment data available
        </div>
      )}
    </div>
  );
};

export default PaymentStatusChart;