import React, { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { User, CreateUserDTO, UpdateUserDTO, Role } from '../../types/user';
import { UserIcon, Mail, Lock, Phone, Stethoscope, Clock, Plus, Shield, X } from 'lucide-react';
import { getUserPermissions, grantUserPermission, revokeUserPermission } from '../../services/user.service';
import { Button } from '../ui/Button';
import { getAvatarColor } from '../../utils/avatarColor';

interface StaffFormProps {
  onSubmit: (data: CreateUserDTO | UpdateUserDTO) => Promise<any> | void;
  onCancel: () => void;
  staff?: User | null;
  loading?: boolean;
  token: string;
}

const SECTION_TONE: Record<'primary' | 'info' | 'surface' | 'warning', string> = {
  primary: 'bg-primary-50 text-primary-700 border-primary-100',
  info: 'bg-info-50 text-info-700 border-info-100',
  surface: 'bg-surface-100 text-surface-600 border-surface-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-100',
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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const permissionGroups: Array<{
  key: string;
  label: string;
  actions: { label: string; value?: string }[];
}> = [
  {
    key: 'patients',
    label: 'Patients',
    actions: [
      { label: 'View', value: 'patients.view' },
      { label: 'Create', value: 'patients.create' },
      { label: 'Update', value: 'patients.update' },
      { label: 'Delete', value: 'patients.delete' },
    ],
  },
  {
    key: 'appointments',
    label: 'Appointments',
    actions: [
      { label: 'View', value: 'appointments.view' },
      { label: 'Create', value: 'appointments.create' },
      { label: 'Update', value: 'appointments.update' },
      { label: 'Delete', value: 'appointments.cancel' },
    ],
  },
  {
    key: 'treatments',
    label: 'Treatments',
    actions: [
      { label: 'View', value: 'treatments.view' },
      { label: 'Create', value: 'treatments.create' },
      { label: 'Update', value: 'treatments.update' },
      { label: 'Delete', value: 'treatments.delete' },
    ],
  },
  {
    key: 'payments',
    label: 'Payments',
    actions: [
      { label: 'View', value: 'payment.view' },
      { label: 'Create', value: 'payment.create' },
      { label: 'Update', value: 'payment.update' },
      { label: 'Delete', value: 'payment.delete' },
    ],
  },
  {
    key: 'documents',
    label: 'Documents',
    actions: [
      { label: 'View', value: 'documents.view' },
      { label: 'Create', value: 'documents.create' },
      { label: 'Update', value: 'documents.update' },
      { label: 'Delete', value: 'documents.delete' },
    ],
  },
  {
    key: 'expenses',
    label: 'Expenses',
    actions: [
      { label: 'View', value: 'expenses.view' },
      { label: 'Create', value: 'expenses.create' },
      { label: 'Update', value: 'expenses.update' },
      { label: 'Delete', value: 'expenses.delete' },
    ],
  },
];

export const StaffForm: React.FC<StaffFormProps> = ({ onSubmit, onCancel, staff, loading = false, token }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    role: 'ASSISTANT' as Role,
    phone: '',
    specialization: '',
    workingTime: [] as Array<{ day: string; hours: string }>,
  });

  const [permissions, setPermissions] = useState<string[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (staff) {
      let workingTimeArray: Array<{ day: string; hours: string }> = [];
      if (staff.doctorProfile?.workingTime && Array.isArray(staff.doctorProfile.workingTime)) {
        workingTimeArray = staff.doctorProfile.workingTime;
      }

      setFormData({
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        username: staff.username,
        password: '',
        role: staff.role,
        phone: staff.phone || '',
        specialization: staff.doctorProfile?.specialization || '',
        workingTime: workingTimeArray,
      });
      getUserPermissions(staff.id, token)
        .then((res) => {
          setPermissions(res.data || []);
          setOriginalPermissions(res.data || []);
        })
        .catch(() => {
          setPermissions([]);
          setOriginalPermissions([]);
        });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        role: 'ASSISTANT',
        phone: '',
        specialization: '',
        workingTime: [],
      });
      setPermissions([]);
      setOriginalPermissions([]);
    }
  }, [staff, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
    };

    if (!staff) {
      submitData.username = formData.username;
      submitData.password = formData.password;
      submitData.role = formData.role;
    }

    if (formData.role === 'DOCTOR') {
      submitData.specialization = formData.specialization || undefined;
      submitData.workingTime = formData.workingTime.length > 0 ? formData.workingTime : undefined;
    }

    await onSubmit(submitData);

    if (staff) {
      const toAdd = permissions.filter((p) => !originalPermissions.includes(p));
      const toRemove = originalPermissions.filter((p) => !permissions.includes(p));
      const promises: Promise<any>[] = [];
      toAdd.forEach((perm) => promises.push(grantUserPermission(staff.id, perm, token)));
      toRemove.forEach((perm) => promises.push(revokeUserPermission(staff.id, perm, token)));
      Promise.all(promises).catch(() => {});
      setOriginalPermissions(permissions);
    }
  };

  const togglePermission = (perm?: string) => {
    if (!perm) return;
    setPermissions((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  };

  const handleWorkingHourChange = (index: number, field: 'day' | 'hours', value: string) => {
    const newWorkingTime = [...formData.workingTime];
    newWorkingTime[index] = { ...newWorkingTime[index], [field]: value };
    setFormData({ ...formData, workingTime: newWorkingTime });
  };

  const addWorkingHour = () => {
    setFormData({ ...formData, workingTime: [...formData.workingTime, { day: 'Monday', hours: '09:00-17:00' }] });
  };

  const removeWorkingHour = (index: number) => {
    setFormData({ ...formData, workingTime: formData.workingTime.filter((_, i) => i !== index) });
  };

  const inputClass =
    'w-full rounded-lg border border-surface-300 bg-white pl-10 pr-4 py-2.5 text-sm text-surface-800 transition focus:border-primary-500 focus:outline-none focus:shadow-focus disabled:cursor-not-allowed disabled:bg-surface-50';

  const fullName = `${formData.firstName} ${formData.lastName}`.trim();
  const avatar = getAvatarColor(fullName || 'New Staff');
  const initials = `${formData.firstName?.[0] ?? ''}${formData.lastName?.[0] ?? ''}`.toUpperCase() || '?';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Live identity preview */}
      <div className="flex items-center gap-3 rounded-lg border border-surface-200 bg-surface-50 p-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold ${avatar.bg} ${avatar.text}`}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-surface-900">{fullName || 'New staff member'}</p>
          <p className="text-xs text-surface-500">{staff ? 'Editing staff record' : 'Creating a new staff account'}</p>
        </div>
      </div>

      <FormSection icon={UserIcon} title="Identity" tone="primary">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-surface-700">
              First name <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon size={18} className="text-surface-400" />
              </div>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                <UserIcon size={18} className="text-surface-400" />
              </div>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className={inputClass}
                placeholder="Enter last name"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-surface-700">
            Email <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail size={18} className="text-surface-400" />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className={inputClass}
              placeholder="email@example.com"
            />
          </div>
        </div>
      </FormSection>

      {!staff && (
        <FormSection icon={Shield} title="Account & Access" tone="info">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-surface-700">
                Username <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon size={18} className="text-surface-400" />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className={inputClass}
                  placeholder="Choose a username"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-surface-700">
                Password <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock size={18} className="text-surface-400" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className={inputClass}
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-surface-700">
              Role <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
                <Shield size={18} className="text-surface-400" />
              </div>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                required
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="ASSISTANT">Assistant</option>
                <option value="DOCTOR">Doctor</option>
                <option value="MANAGER">Manager</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </FormSection>
      )}

      <FormSection icon={Phone} title="Contact & Specialty" tone="surface">
        <div>
          <label className="mb-2 block text-sm font-medium text-surface-700">Phone Number</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Phone size={18} className="text-surface-400" />
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={inputClass}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        {formData.role === 'DOCTOR' && (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium text-surface-700">Specialization</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Stethoscope size={18} className="text-surface-400" />
                </div>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g., General Dentistry, Orthodontics"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-surface-700">
                  <Clock size={16} className="text-surface-500" />
                  Working Hours
                </label>
                <button
                  type="button"
                  onClick={addWorkingHour}
                  className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-700"
                >
                  <Plus size={14} />
                  Add Day
                </button>
              </div>
              <div className="space-y-2">
                {formData.workingTime.map((wh, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={wh.day}
                      onChange={(e) => handleWorkingHourChange(index, 'day', e.target.value)}
                      className="flex-1 rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:shadow-focus"
                    >
                      {DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={wh.hours}
                      onChange={(e) => handleWorkingHourChange(index, 'hours', e.target.value)}
                      placeholder="09:00-17:00"
                      className="flex-1 rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:shadow-focus"
                    />
                    <button
                      type="button"
                      onClick={() => removeWorkingHour(index)}
                      className="rounded-lg bg-danger-50 px-3 py-2 text-danger-600 transition-colors hover:bg-danger-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </FormSection>

      {staff && (
        <FormSection icon={Shield} title="Permissions" tone="warning">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {permissionGroups.map((group) => (
              <div key={group.key} className="rounded-lg border border-surface-200 bg-surface-50/50 p-3.5 transition-colors hover:bg-surface-50">
                <div className="mb-2.5 text-sm font-semibold text-surface-900">{group.label}</div>
                <div className="grid grid-cols-2 gap-2">
                  {group.actions.map((action) => (
                    <label
                      key={action.label}
                      className={`flex items-center gap-2 text-sm ${action.value ? 'cursor-pointer text-surface-700' : 'cursor-not-allowed opacity-40'}`}
                    >
                      <input
                        type="checkbox"
                        disabled={!action.value}
                        checked={action.value ? permissions.includes(action.value) : false}
                        onChange={() => togglePermission(action.value)}
                        className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                      />
                      {action.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      )}

      <div className="flex gap-3 border-t border-surface-100 pt-4">
        <Button type="submit" disabled={loading} isLoading={loading} className="flex-1">
          {staff ? 'Update Staff' : 'Create Staff'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
