import {AppointmentRow} from "./AppointmentCard.tsx"

import { useState } from "react";

//filling data
const appointments = [
  { date: 'Nov 25, 2024', time: '9:00 AM', patientName: 'Sarah Johnson', treatment: 'Routine Checkup' },
  { date: 'Nov 25, 2024', time: '10:30 AM', patientName: 'Michael Chen', treatment: 'Teeth Cleaning' },
  { date: 'Nov 25, 2024', time: '2:00 PM', patientName: 'Emma Davis', treatment: 'Root Canal' },
  { date: 'Nov 25, 2024', time: '3:45 PM', patientName: 'James Wilson', treatment: 'Dental Implant Consultation' },
  { date: 'Nov 25, 2024', time: '5:00 PM', patientName: 'Lisa Anderson', treatment: 'Cavity Filling' },
];

interface Appointment {
  id: number;
  date: string;
  time: string;
  patientName: string;
  treatment: string;
  description: string;
  phone: string;
  email: string;
  age: number;
  sex: string;
  address: string;
}


export const AppointmentTable: React.FC = () => {

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const appointments: Appointment[] = [
    {
      id: 1,
      date: "Nov 25, 2024",
      time: "9:00 AM",
      patientName: "Sarah Johnson",
      treatment: "Routine Checkup",
      description: "Regular dental examination and cleaning. Patient has been experiencing minor sensitivity in upper left molar.",
      phone: "+1 (555) 123-4567",
      email: "sarah.j@email.com",
      age: 32,
      sex: "Female",
      address: "123 Main St, New York, NY",
    },
    {
      id: 2,
      date: "Nov 25, 2024",
      time: "10:30 AM",
      patientName: "Michael Chen",
      treatment: "Teeth Cleaning",
      description: "Professional teeth cleaning and fluoride treatment. Follow-up from previous visit.",
      phone: "+1 (555) 234-5678",
      email: "m.chen@email.com",
      age: 45,
      sex: "Male",
      address: "456 Oak Ave, Brooklyn, NY",
    },
    {
      id: 3,
      date: "Nov 25, 2024",
      time: "2:00 PM",
      patientName: "Emma Davis",
      treatment: "Root Canal",
      description: "Root canal therapy for tooth #14. Second session to complete the procedure.",
      phone: "+1 (555) 345-6789",
      email: "emma.davis@email.com",
      age: 28,
      sex: "Female",
      address: "789 Pine Rd, Queens, NY",
    },
    {
      id: 4,
      date: "Nov 25, 2024",
      time: "3:45 PM",
      patientName: "James Wilson",
      treatment: "Dental Implant Consultation",
      description: "Initial consultation for dental implant placement. Patient missing tooth #19.",
      phone: "+1 (555) 456-7890",
      email: "j.wilson@email.com",
      age: 52,
      sex: "Male",
      address: "321 Elm St, Manhattan, NY",
    },
    {
      id: 5,
      date: "Nov 25, 2024",
      time: "5:00 PM",
      patientName: "Lisa Anderson",
      treatment: "Cavity Filling",
      description: "Composite filling for cavity on tooth #30. Patient prefers tooth-colored filling.",
      phone: "+1 (555) 567-8901",
      email: "lisa.a@email.com",
      age: 35,
      sex: "Female",
      address: "654 Maple Dr, Bronx, NY",
    },
  ];
  return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] mb-8">
        <div className="p-6 border-b border-[#E5E7EB]">
          <h2 className="text-[#0F172A] text-[18px] font-[600]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Today's Appointments
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Date
                </th>
                <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Time
                </th>
                <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Patient Name
                </th>
                <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Treatment
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => (
                <AppointmentRow key={index} appointment={appointment} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
};
