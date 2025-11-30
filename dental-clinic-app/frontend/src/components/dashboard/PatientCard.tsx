import React from 'react';
import { User } from 'lucide-react';

interface PatientSmall {
  id?: string;
  name: string;
  age?: number;
  addedOn?: string;
  phone?: string;
}

export const PatientCard: React.FC<{ patient: PatientSmall }> = ({ patient }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="text-blue-600" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{patient.name}</h3>
          <p className="text-sm text-gray-500">{patient.age ? `Age: ${patient.age}` : ''} {patient.addedOn ? `• Added on ${patient.addedOn}` : ''}</p>
        </div>
      </div>
      <div className="text-gray-600">{patient.phone}</div>
    </div>
  );
};

export default PatientCard;
