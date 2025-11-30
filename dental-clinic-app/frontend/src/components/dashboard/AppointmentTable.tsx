import React from 'react';
import { Clock } from 'lucide-react';

interface Appointment {
  id: number;
  date: string;
  time: string;
  patientName: string;
  treatment: string;
}

const APPTS: Appointment[] = [
  { id: 1, date: 'Nov 25, 2024', time: '9:00 AM', patientName: 'Sarah Johnson', treatment: 'Routine Checkup' },
  { id: 2, date: 'Nov 25, 2024', time: '10:30 AM', patientName: 'Michael Chen', treatment: 'Teeth Cleaning' },
  { id: 3, date: 'Nov 25, 2024', time: '2:00 PM', patientName: 'Emma Davis', treatment: 'Root Canal' },
  { id: 4, date: 'Nov 25, 2024', time: '3:45 PM', patientName: 'James Wilson', treatment: 'Dental Implant Consultation' },
  { id: 5, date: 'Nov 25, 2024', time: '5:00 PM', patientName: 'Lisa Anderson', treatment: 'Cavity Filling' },
];

export const AppointmentTable: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] mb-8">
      <div className="p-6 border-b border-[#E5E7EB]">
        <h2 className="text-[#0F172A] text-[18px] font-[600]">Today's Appointments</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Date</th>
              <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Time</th>
              <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Patient Name</th>
              <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Treatment</th>
            </tr>
          </thead>
          <tbody>
            {APPTS.map((a) => (
              <tr key={a.id} className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC]">
                <td className="px-6 py-4 text-[#0F172A] text-[14px] font-[500]">{a.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Clock size={16} strokeWidth={2} />
                    <span className="text-[14px] font-[500]">{a.time}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#0F172A] text-[14px] font-[500]">{a.patientName}</td>
                <td className="px-6 py-4"><span className="inline-flex px-3 py-1 bg-[#EEF4FF] text-[#1D4ED8] text-[13px] font-[500] rounded-full">{a.treatment}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentTable;
