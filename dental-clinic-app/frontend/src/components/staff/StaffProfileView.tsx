import React from 'react';
import { User, Role } from '../../types/user';
import { X, Mail, Phone, Calendar, Briefcase, Clock, User as UserIcon, Users2 } from 'lucide-react';

interface StaffProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
  staff: User | null;
}

const ROLE_GRADIENT: Record<Role, string> = {
  MANAGER: 'from-danger-600 to-danger-700',
  DOCTOR: 'from-primary-600 to-primary-700',
  ASSISTANT: 'from-success-600 to-success-700',
};

export const StaffProfileView: React.FC<StaffProfileViewProps> = ({ isOpen, onClose, staff }) => {
  if (!isOpen || !staff) return null;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const gradient = ROLE_GRADIENT[staff.role] ?? 'from-surface-600 to-surface-700';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"
      onClick={handleBackdropClick}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-xl">
        {/* Header with role-colored gradient */}
        <div className={`relative rounded-t-lg bg-gradient-to-br px-6 py-8 text-white ${gradient}`}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md bg-white/20 p-2 transition-colors hover:bg-white/30"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/25 text-3xl font-bold">
              {staff.firstName[0]}
              {staff.lastName[0]}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-semibold">
                {staff.firstName} {staff.lastName}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">{staff.role}</span>
                <span className="text-sm text-white/90">@{staff.username}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Contact Information */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-surface-900">
              <UserIcon size={18} />
              Contact Information
            </h3>
            <div className="grid gap-3 rounded-lg bg-surface-50 p-4">
              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-surface-400" />
                <div className="min-w-0">
                  <p className="text-xs text-surface-500">Email</p>
                  <p className="truncate text-sm font-medium text-surface-900">{staff.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-surface-400" />
                <div>
                  <p className="text-xs text-surface-500">Phone</p>
                  <p className="text-sm font-medium text-surface-900">
                    {staff.phone || <span className="text-surface-400">Not provided</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={18} className="shrink-0 text-surface-400" />
                <div>
                  <p className="text-xs text-surface-500">Joined</p>
                  <p className="text-sm font-medium text-surface-900">{formatDate(staff.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor-specific information */}
          {staff.doctorProfile && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-surface-900">
                <Briefcase size={18} />
                Professional Information
              </h3>
              <div className="space-y-4 rounded-lg bg-surface-50 p-4">
                {staff.doctorProfile.specialization && (
                  <div>
                    <p className="mb-1 text-xs text-surface-500">Specialization</p>
                    <p className="rounded-md border border-surface-200 bg-white px-3 py-2 text-sm font-medium text-surface-900">
                      {staff.doctorProfile.specialization}
                    </p>
                  </div>
                )}

                {Array.isArray(staff.doctorProfile.workingTime) && staff.doctorProfile.workingTime.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs text-surface-500">
                      <Clock size={13} />
                      Working Hours
                    </p>
                    <div className="space-y-2">
                      {staff.doctorProfile.workingTime.map((wh: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border border-surface-200 bg-white px-3 py-2"
                        >
                          <span className="text-sm font-medium text-surface-700">{wh.day}</span>
                          <span className="rounded bg-surface-100 px-2 py-0.5 font-mono text-xs text-surface-500">
                            {wh.hours}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {staff.doctorProfile.patientCount !== undefined && (
                  <div className="flex items-center gap-3 rounded-md border border-info-100 bg-info-50 p-3">
                    <Users2 size={20} className="text-info-600" />
                    <div>
                      <p className="text-xs text-info-700">Active Patients</p>
                      <p className="text-2xl font-bold text-info-700">{staff.doctorProfile.patientCount}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Details */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-surface-900">Account Details</h3>
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-surface-50 p-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-surface-500">User ID</p>
                <p className="truncate rounded border border-surface-200 bg-white px-2 py-1.5 font-mono text-xs text-surface-700">
                  {staff.id}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-surface-500">Last Updated</p>
                <p className="text-sm font-medium text-surface-900">{formatDate(staff.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
