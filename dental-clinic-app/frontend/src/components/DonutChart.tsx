import type {TreatmentData, GenderData}  from "../types"
//import { Appointment } from "../../../backend/src/types";

// Donut Chart Component
export const DonutChart: React.FC<{ data: (TreatmentData | GenderData)[] }> = ({ data }) => {
  let cumulativePercent = 0;

  const createArc = (percent: number, color: string) => {
    const startAngle = (cumulativePercent * 360) / 100;
    const endAngle = ((cumulativePercent + percent) * 360) / 100;
    cumulativePercent += percent;

    const start = polarToCartesian(100, 100, 70, endAngle);
    const end = polarToCartesian(100, 100, 70, startAngle);
    const largeArcFlag = percent > 50 ? 1 : 0;

    return `M 100 100 L ${start.x} ${start.y} A 70 70 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
                <div className="flex flex-col items-center">
                  <svg viewBox="0 0 200 200" className="w-64 h-64">
                    <circle cx="100" cy="100" r="50" fill="white" />
                    {data.map((item, index) => (
                      <path
                        key={index}
                        d={createArc(item.percentage, item.color)}
                        fill={item.color}
                      />
                    ))}
                    <circle cx="100" cy="100" r="50" fill="white" />
                  </svg>
                
                  <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                    {data.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600">
                          {item.label} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
  );
};

//usage in dashboard page
/*          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Treatment Distribution</h3>
              <DonutChart data={treatmentData} />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Patient Gender Distribution</h3>
              <DonutChart data={genderData} />
            </div>
          </div>

*/