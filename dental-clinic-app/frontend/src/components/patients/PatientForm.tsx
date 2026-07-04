import { useState, useEffect } from 'react';
import { Patient, CreatePatientDTO } from '../../types/patient';
import { Button } from '../ui/Button';
import { User, Mail, Phone, Calendar, Stethoscope, AlertCircle } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-surface-400" />
            </div>
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#26a37e]/30 focus:border-[#26a37e] transition-all"
              placeholder="Enter first name"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-surface-400" />
            </div>
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#26a37e]/30 focus:border-[#26a37e] transition-all"
              placeholder="Enter last name"
            />
          </div>
        </div>
      </div>

      {/* Contact Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-surface-400" />
            </div>
            <input
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#26a37e]/30 focus:border-[#26a37e] transition-all"
              placeholder="email@example.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Phone
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone size={18} className="text-surface-400" />
            </div>
            <input
              name="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#26a37e]/30 focus:border-[#26a37e] transition-all"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          Date of Birth
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar size={18} className="text-surface-400" />
          </div>
          <input
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#26a37e]/30 focus:border-[#26a37e] transition-all"
          />
        </div>
      </div>

      {/* Primary Doctor Selection */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          Primary Doctor
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Stethoscope size={18} className="text-surface-400" />
          </div>
          <select
            name="primaryDentistId"
            value={formData.primaryDentistId || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, primaryDentistId: e.target.value }))}
            disabled={loadingDoctors}
            className="w-full pl-10 pr-10 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#26a37e]/30 focus:border-[#26a37e] transition-all appearance-none bg-white disabled:bg-surface-50 disabled:cursor-not-allowed"
          >
            <option value="">Select a doctor (optional)</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.doctorProfile?.id}>
                Dr. {doctor.firstName} {doctor.lastName}
                {doctor.doctorProfile?.specialization && ` - ${doctor.doctorProfile.specialization}`}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {loadingDoctors && (
          <p className="text-xs text-surface-500 mt-1 ml-1">Loading doctors...</p>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-surface-100">
        <Button type="submit" className="flex-1 bg-[#26a37e] hover:bg-[#35a892] text-white">
          {mode === 'add' ? 'Add Patient' : 'Save Changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}

