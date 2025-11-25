import React from "react";
import { Clock } from "lucide-react";
//import { Appointment } from "../../../backend/src/types";

interface Appointment {
  id: number;
  date: string;
  time: string;
  patientName: string;
  treatment: string;
}

export const AppointmentRow: React.FC< {appointment:Appointment} > = ({appointment}) => {
  return (
    <tr
                  key={appointment.id}   
                  className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-[#0F172A] text-[14px] font-[500]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {appointment.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <Clock size={16} strokeWidth={2} />
                      <span className="text-[14px] font-[500]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {appointment.time}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#0F172A] text-[14px] font-[500]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {appointment.patientName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 bg-[#EEF4FF] text-[#1D4ED8] text-[13px] font-[500] rounded-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                      {appointment.treatment}
                    </span>
                  </td>
                </tr>
  );
};

