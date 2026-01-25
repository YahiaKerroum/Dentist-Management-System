import { PatientCard } from "./PatientCard";

interface Patient {
  name: string;
  age: number;
  addedOn: string;
  phone: string;
}

const recentPatients: Patient[] = [
  { name: 'Patricia Lee', age: 29, addedOn: 'Nov 24, 2024', phone: '+1 (555) 678-9012' },
  { name: 'David Brown', age: 41, addedOn: 'Nov 23, 2024', phone: '+1 (555) 789-0123' },
  { name: 'Jennifer Martinez', age: 38, addedOn: 'Nov 22, 2024', phone: '+1 (555) 890-1234' },
  { name: 'Robert Taylor', age: 55, addedOn: 'Nov 21, 2024', phone: '+1 (555) 901-2345' },
  { name: 'Mary White', age: 27, addedOn: 'Nov 20, 2024', phone: '+1 (555) 012-3456' },
];


// recent Patients list Component
export const PatientsList : React.FC = () => {
  return (
    <div className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recently Added Patients</h3>
            <div className="space-y-3">
              {recentPatients.map((patient, index) => (
                <PatientCard key={index} patient={patient} />
              ))}
            </div>
          </div>
        </div>
  );
};


      