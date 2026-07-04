import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Patient, CreatePatientDTO } from '../../types/patient';
import { Button } from '../ui/Button';
import { getAvatarColor } from '../../utils/avatarColor';
import { User, Mail, Phone, Calendar, Stethoscope, AlertCircle, IdCard } from 'lucide-react';

interface PatientFormProps {
  mode: 'add' | 'edit';
  initialData?: Patient | null;
  onSubmit: (data: CreatePatientDTO) => void;
  onCancel: () => void;
  token: string;
}

const SECTION_TONE: Record<'primary' | 'info' | 'surface', string> = {
  primary: 'bg-primary-50 text-primary-700 border-primary-100',
  info: 'bg-info-50 text-info-700 border-info-100',
  surface: 'bg-surface-100 text-surface-600 border-surface-200',
};

function FormSection({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: LucideIcon;
  title: string;
  tone: keyof typeof SECTION_TONE;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-surface-200">
      <div className={`flex items-center gap-2 border-b px-4 py-2.5 ${SECTION_TONE[tone]}`}>
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
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

  const inputClass =
    'w-full rounded-lg border border-surface-300 bg-white pl-10 pr-4 py-2.5 text-sm text-surface-800 transition focus:border-primary-500 focus:outline-none focus:shadow-focus disabled:cursor-not-allowed disabled:bg-surface-50';

  const fullName = `${formData.firstName} ${formData.lastName}`.trim();
  const avatar = getAvatarColor(fullName || 'New Patient');
  const initials = `${formData.firstName?.[0] ?? ''}${formData.lastName?.[0] ?? ''}`.toUpperCase() || '?';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Live identity preview */}
      <div className="flex items-center gap-3 rounded-lg border border-surface-200 bg-surface-50 p-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold ${avatar.bg} ${avatar.text}`}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-surface-900">{fullName || 'New patient'}</p>
          <p className="text-xs text-surface-500">{mode === 'add' ? 'Creating a new patient record' : 'Editing patient record'}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger-100 bg-danger-50 p-3 text-sm text-danger-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <FormSection icon={IdCard} title="Identity" tone="primary">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-surface-700">
              First name <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User size={18} className="text-surface-400" />
              </div>
              <input
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Enter first name"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-surface-700">
              Last name <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User size={18} className="text-surface-400" />
              </div>
              <input
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Enter last name"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-surface-700">Date of birth</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Calendar size={18} className="text-surface-400" />
            </div>
            <input
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
      </FormSection>

      <FormSection icon={Mail} title="Contact Information" tone="info">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-surface-700">Email</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail size={18} className="text-surface-400" />
              </div>
              <input
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                className={inputClass}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-surface-700">Phone</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone size={18} className="text-surface-400" />
              </div>
              <input
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={handleChange}
                className={inputClass}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection icon={Stethoscope} title="Care Team" tone="surface">
        <div>
          <label className="mb-2 block text-sm font-medium text-surface-700">Primary doctor</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
              <Stethoscope size={18} className="text-surface-400" />
            </div>
            <select
              name="primaryDentistId"
              value={formData.primaryDentistId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, primaryDentistId: e.target.value }))}
              disabled={loadingDoctors}
              className={`${inputClass} appearance-none pr-10`}
            >
              <option value="">Select a doctor (optional)</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.doctorProfile?.id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                  {doctor.doctorProfile?.specialization && ` - ${doctor.doctorProfile.specialization}`}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-4 w-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {loadingDoctors && <p className="ml-1 mt-1 text-xs text-surface-500">Loading doctors...</p>}
        </div>
      </FormSection>

      <div className="flex gap-3 border-t border-surface-100 pt-4">
        <Button type="submit" className="flex-1">
          {mode === 'add' ? 'Add Patient' : 'Save Changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
