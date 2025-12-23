import React from 'react';
import { Clock } from 'lucide-react';
import { Appointment } from '../../types/appointment';


interface AppointmentTableProps {
  appointments: Appointment[];
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({ appointments }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-yellow-50 text-yellow-700';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] mb-8">
      <div className="overflow-x-auto">
        {appointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No appointments scheduled for today
          </div>
        ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Date</th>
              <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Time</th>
              <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Patient Name</th>
              <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Treatment</th>
              <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC]">
                  {/* date */}
                  <td className="px-6 py-4 text-[#0F172A] text-[14px] font-[500]">
                    {formatDate(a.dateOfTreatment)}
                  </td>
                  {/* time */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <Clock size={16} strokeWidth={2} />
                      <span className="text-[14px] font-[500]">{formatTime(a.dateOfTreatment)}</span>
                    </div>
                  </td>
                  {/* patient data*/}
                  <td className="px-6 py-4 text-[#0F172A] text-[14px] font-[500]">
                    {a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'N/A'}
                  </td>
                  {/*Handling null treatment types ==================== */}
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 bg-[#EEF4FF] text-[#1D4ED8] text-[13px] font-[500] rounded-full">
                      {a.typeOfTreatment || 'Not specified'}
                    </span>
                  </td>
                  {/*Status badge */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-[13px] font-[500] rounded-full ${getStatusColor(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table> )}
      </div>
    </div>
  );
};

export default AppointmentTable;
