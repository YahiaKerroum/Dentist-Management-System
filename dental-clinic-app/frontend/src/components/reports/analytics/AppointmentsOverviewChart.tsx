import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { getAppointmentsOverview } from '../../../services/report.service';
import { CHART_STATUS, chartTooltip } from '../../../lib/chartTheme';

interface AppointmentsOverviewChartProps {
  token: string;
}

const COLORS = {
  scheduled: CHART_STATUS.neutral,
  completed: CHART_STATUS.positive,
  cancelled: CHART_STATUS.negative,
  noShow: CHART_STATUS.attention,
};

export const AppointmentsOverviewChart: React.FC<AppointmentsOverviewChartProps> = ({ token }) => {
  const [data, setData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getAppointmentsOverview(token);
        const { scheduled, completed, cancelled, noShow, total } = response.data;

        setData([
          { name: 'Scheduled', value: scheduled, color: COLORS.scheduled },
          { name: 'Completed', value: completed, color: COLORS.completed },
          { name: 'Cancelled', value: cancelled, color: COLORS.cancelled },
          { name: 'No Show', value: noShow, color: COLORS.noShow },
        ].filter(item => item.value > 0));

        setTotal(total);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Custom label renderer
  const renderLabel = (entry: any) => {
    const percent = entry.percent || 0;
    return `${entry.name} ${(percent * 100).toFixed(0)}%`;
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
      <div className="flex items-center gap-2 mb-4">
        <CalendarCheck className="text-primary-600" size={20} />
        <h3 className="font-display font-semibold tracking-tight text-surface-900">Appointments Overview</h3>
        <span className="bg-surface-100 text-surface-600 text-xs px-2 py-1 rounded-full tabular-nums">
          Total: {total}
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
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={renderLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => [value, 'Count']} {...chartTooltip} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: any) => <span className="text-sm text-surface-600">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-surface-500">
          No appointment data available
        </div>
      )}
    </div>
  );
};

export default AppointmentsOverviewChart;