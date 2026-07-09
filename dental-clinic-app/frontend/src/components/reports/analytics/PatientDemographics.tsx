import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users, Loader2 } from 'lucide-react';
import { getPatientDemographics } from '../../../services/report.service';
import { CHART_CATEGORICAL, CHART_OTHER, categoricalColor, chartTooltip } from '../../../lib/chartTheme';

interface PatientDemographicsProps {
  token: string;
}

const GENDER_COLORS: Record<string, string> = {
  MALE: CHART_CATEGORICAL[1], // blue
  FEMALE: CHART_CATEGORICAL[4], // magenta
  OTHER: CHART_CATEGORICAL[3], // violet
  Unknown: CHART_OTHER,
};

export const PatientDemographics: React.FC<PatientDemographicsProps> = ({ token }) => {
  const [genderData, setGenderData] = useState<{ name: string; value: number }[]>([]);
  const [ageData, setAgeData] = useState<{ name: string; value: number }[]>([]);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getPatientDemographics(token);
        
        setGenderData(
          response.data.byGender.map((g) => ({
            name: g.gender,
            value: g.count,
          }))
        );
        
        setAgeData(
          response.data.byAge.map((a) => ({
            name: a.range,
            value: a.count,
          }))
        );
        
        setTotalPatients(response.data.totalPatients);
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
      <div className="flex items-center gap-2 mb-4">
        <Users className="text-primary-600" size={20} />
        <h3 className="font-display font-semibold tracking-tight text-surface-900">Patient Demographics</h3>
        <span className="bg-surface-100 text-surface-600 text-xs px-2 py-1 rounded-full tabular-nums">
          Total: {totalPatients}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender Distribution */}
        <div>
          <h4 className="text-sm font-medium text-surface-600 mb-2 text-center">By Gender</h4>
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={renderLabel}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[entry.name] || CHART_OTHER} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any, name: any) => [value, name]} {...chartTooltip} />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value: any) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-surface-500 text-sm">
              No data
            </div>
          )}
        </div>

        {/* Age Distribution */}
        <div>
          <h4 className="text-sm font-medium text-surface-600 mb-2 text-center">By Age Group</h4>
          {ageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={renderLabel}
                >
                  {ageData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoricalColor(index)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any, name: any) => [value, name]} {...chartTooltip} />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value: any) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-surface-500 text-sm">
              No data
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDemographics;