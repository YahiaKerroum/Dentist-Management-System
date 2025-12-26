import React, { useEffect, useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { getAppointmentHeatmap } from '../../../services/report.service';

interface AppointmentHeatmapProps {
  token: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export const AppointmentHeatmap: React.FC<AppointmentHeatmapProps> = ({ token }) => {
  const [heatmapData, setHeatmapData] = useState<{ day: number; hour: number; count: number }[]>([]);
  const [maxCount, setMaxCount] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getAppointmentHeatmap(token);
        setHeatmapData(response.data.heatmap);
        
        // Find max count for color scaling
        const max = Math.max(...response.data.heatmap.map((h) => h.count), 1);
        setMaxCount(max);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getCount = (day: number, hour: number): number => {
    const cell = heatmapData.find((h) => h.day === day && h.hour === hour);
    return cell ? cell.count : 0;
  };

  const getColor = (count: number): string => {
    if (count === 0) return 'bg-gray-100';
    
    const intensity = count / maxCount;
    
    if (intensity <= 0.25) return 'bg-blue-200';
    if (intensity <= 0.5) return 'bg-blue-400';
    if (intensity <= 0.75) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  const getTextColor = (count: number): string => {
    if (count === 0) return 'text-gray-400';
    
    const intensity = count / maxCount;
    
    if (intensity <= 0.5) return 'text-gray-800';
    return 'text-white';
  };

  const formatHour = (hour: number): string => {
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-center h-96">
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

  // Calculate busiest time
  const busiestCell = heatmapData.reduce(
    (max, cell) => (cell.count > max.count ? cell : max),
    { day: 0, hour: 8, count: 0 }
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-800">Appointment Heatmap</h3>
        </div>
        {busiestCell.count > 0 && (
          <div className="text-xs text-gray-500">
            Busiest: <span className="font-medium text-blue-600">
              {DAYS[busiestCell.day]} at {formatHour(busiestCell.hour)}
            </span>
          </div>
        )}
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour Headers */}
          <div className="flex mb-1">
            <div className="w-12" /> {/* Empty corner */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex-1 text-center text-xs text-gray-500 pb-1"
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Rows (Days) */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              {/* Day Label */}
              <div className="w-12 text-xs text-gray-500 font-medium pr-2">
                {day}
              </div>

              {/* Hour Cells */}
              {HOURS.map((hour) => {
                const count = getCount(dayIndex, hour);
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`flex-1 h-8 mx-0.5 rounded flex items-center justify-center text-xs font-medium transition-colors ${getColor(count)} ${getTextColor(count)}`}
                    title={`${day} ${formatHour(hour)}: ${count} appointments`}
                  >
                    {count > 0 ? count : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <span>Less busy</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-gray-100" />
          <div className="w-4 h-4 rounded bg-blue-200" />
          <div className="w-4 h-4 rounded bg-blue-400" />
          <div className="w-4 h-4 rounded bg-blue-600" />
          <div className="w-4 h-4 rounded bg-blue-800" />
        </div>
        <span>More busy</span>
      </div>
    </div>
  );
};

export default AppointmentHeatmap;