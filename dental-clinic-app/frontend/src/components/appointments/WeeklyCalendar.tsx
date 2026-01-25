import React, { useState } from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

export interface AppointmentItem {
  id: string;
  patientName: string;
  type: string;
  date: string; // ISO date
  time: string; // HH:mm
  duration: number; // minutes
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface WeeklyCalendarProps {
  appointments: AppointmentItem[];
  onAppointmentClick: (a: AppointmentItem) => void;
  selectedAppointment: AppointmentItem | null;
}

const timeSlots = [
  '08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'
];

const weekDays = [
  { date: 25, day: 'Saturday', month: 'Oct', year: 2025, dateStr: '2025-10-25' },
  { date: 26, day: 'Sunday', month: 'Oct', year: 2025, dateStr: '2025-10-26' },
  { date: 27, day: 'Monday', month: 'Oct', year: 2025, dateStr: '2025-10-27' },
  { date: 28, day: 'Tuesday', month: 'Oct', year: 2025, dateStr: '2025-10-28' },
  { date: 29, day: 'Wednesday', month: 'Oct', year: 2025, dateStr: '2025-10-29' },
  { date: 30, day: 'Thursday', month: 'Oct', year: 2025, dateStr: '2025-10-30' },
  { date: 31, day: 'Friday', month: 'Oct', year: 2025, dateStr: '2025-10-31' },
];

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ appointments, onAppointmentClick, selectedAppointment }) => {
  const [activeView, setActiveView] = useState<'day'|'week'|'month'>('week');

  const getAppointmentForSlot = (dateStr: string, time: string) => {
    return appointments.find(apt => apt.date === dateStr && apt.time === time);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-gray-900">October 2025</span>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="overflow-auto" style={{ maxHeight: '600px' }}>
        <div className="min-w-[900px]">
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
            <div className="p-3"></div>
            {weekDays.map(day => (
              <div key={day.dateStr} className="p-3 text-center border-l border-gray-200">
                <div className="text-gray-500">{day.day}</div>
                <div className="text-gray-900">{day.date} {day.month} {day.year}</div>
              </div>
            ))}
          </div>

          <div className="relative">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 border-b border-gray-200" style={{ height: '5rem' }}>
                <div className="p-3 text-gray-500 border-r border-gray-200 bg-gray-50">{time}</div>
                {weekDays.map((day) => {
                  const appointment = getAppointmentForSlot(day.dateStr, time);
                  return (
                    <div key={`${day.dateStr}-${time}`} className="relative border-l border-gray-200 hover:bg-blue-50/30 cursor-pointer transition-colors p-1">
                      {appointment && (
                        <div onClick={() => onAppointmentClick(appointment)} className={`h-full w-full rounded-lg p-2 cursor-pointer transition-all overflow-hidden ${selectedAppointment?.id === appointment.id ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400' : appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-900 hover:bg-blue-200' : appointment.status === 'pending' ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                          <div className="truncate">{appointment.patientName}</div>
                          <div className="truncate opacity-80">{appointment.type}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 flex">
        <button onClick={() => setActiveView('day')} className={`flex-1 py-3 transition-colors ${activeView === 'day' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Day</button>
        <button onClick={() => setActiveView('week')} className={`flex-1 py-3 transition-colors ${activeView === 'week' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Week</button>
        <button onClick={() => setActiveView('month')} className={`flex-1 py-3 transition-colors ${activeView === 'month' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Month</button>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
