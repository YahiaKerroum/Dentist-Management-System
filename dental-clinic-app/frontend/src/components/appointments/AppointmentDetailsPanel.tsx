import React from 'react';
import { X, Calendar, Clock, User, FileText, CheckCircle } from 'lucide-react';

export interface AppointmentItem {
  id: string;
  patientName: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

interface Props {
  appointment: AppointmentItem | null;
  onClose: () => void;
}

const defaultAppointment: AppointmentItem = {
  id: 'default',
  patientName: 'Sarah Johnson',
  type: 'Dental Cleaning',
  date: '2025-10-27',
  time: '09:00',
  duration: 60,
  status: 'confirmed',
  notes: 'Regular 6-month checkup and professional cleaning.'
};

export const AppointmentDetailsPanel: React.FC<Props> = ({ appointment, onClose }) => {
  const displayAppointment = appointment || defaultAppointment;
  const isDefaultView = !appointment;

  return (
    <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-gray-900">Appointment Details</h3>
        {!isDefaultView && (
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-2"><Calendar className="w-4 h-4" /><span>Appointment Date</span></div>
          <div className="text-gray-900">
            {new Date(displayAppointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="border-t border-gray-100"></div>

        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-2"><Clock className="w-4 h-4" /><span>Appointment Time</span></div>
          <div className="text-gray-900">{displayAppointment.time} ({displayAppointment.duration} minutes)</div>
        </div>

        <div className="border-t border-gray-100"></div>

        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-2"><User className="w-4 h-4" /><span>Patient Name</span></div>
          <div className="text-gray-900">{displayAppointment.patientName}</div>
        </div>

        <div className="border-t border-gray-100"></div>

        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-2"><FileText className="w-4 h-4" /><span>Appointment Type</span></div>
          <div className="text-gray-900">{displayAppointment.type}</div>
        </div>

        <div className="border-t border-gray-100"></div>

        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-2"><CheckCircle className="w-4 h-4" /><span>Appointment Status</span></div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full ${displayAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : displayAppointment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
              {displayAppointment.status.charAt(0).toUpperCase() + displayAppointment.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100"></div>
        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-2"><FileText className="w-4 h-4" /><span>Notes</span></div>
          <div className="text-gray-700 bg-gray-50 rounded-lg p-3">{displayAppointment.notes || 'No additional notes for this appointment.'}</div>
        </div>

        <div className="pt-4 space-y-2">
          <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Edit Appointment</button>
          <button className="w-full py-2 px-4 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel Appointment</button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsPanel;
