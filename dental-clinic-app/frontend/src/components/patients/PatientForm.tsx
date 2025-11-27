import { useState, useEffect } from 'react';
import { Patient, CreatePatientDTO } from '../../types/patient';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface PatientFormProps {
  mode: 'add' | 'edit';
  initialData?: Patient | null;
  onSubmit: (data: CreatePatientDTO) => void;
  onCancel: () => void;
  token: string;
}

export function PatientForm({ mode, initialData, onSubmit, onCancel, token }: PatientFormProps) {
  const [formData, setFormData] = useState<CreatePatientDTO>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    primaryDentistId: '',
  });
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    // Fetch doctors list
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/users?role=DOCTOR', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setDoctors(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [token]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email || '',
        phone: initialData.phone || '',
        dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
        primaryDentistId: initialData.primaryDentistId || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        {mode === 'add' ? 'Add New Patient' : 'Edit Patient'}
      </h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name *"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <Input
          label="Last Name *"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
        />
        <Input
          label="Phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
        />
      </div>

      <Input
        label="Date of Birth"
        name="dateOfBirth"
        type="date"
        value={formData.dateOfBirth || ''}
        onChange={handleChange}
      />

      {/* Primary Doctor Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Primary Doctor
        </label>
        <select
          name="primaryDentistId"
          value={formData.primaryDentistId || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, primaryDentistId: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loadingDoctors}
        >
          <option value="">Select a doctor (optional)</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.doctorProfile?.id}>
              Dr. {doctor.firstName} {doctor.lastName}
              {doctor.doctorProfile?.specialization && ` - ${doctor.doctorProfile.specialization}`}
            </option>
          ))}
        </select>
        {loadingDoctors && (
          <p className="text-xs text-gray-500 mt-1">Loading doctors...</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">
          {mode === 'add' ? 'Add Patient' : 'Save Changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

