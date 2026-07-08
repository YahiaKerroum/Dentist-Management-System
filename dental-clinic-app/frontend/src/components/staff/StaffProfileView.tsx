import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Phone,
  Clock,
  Stethoscope,
  CalendarDays,
  Users2,
  Activity,
  CheckCircle2,
  Wallet,
  Pencil,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { User, Role } from '../../types/user';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { getUserPermissions } from '../../services/user.service';
import { getStaffPerformance } from '../../services/report.service';
import { getPatients } from '../../services/patient.service';
import { getAllAppointments } from '../../services/appointment.service';
import { queryKeys } from '../../lib/queryKeys';
import { easeOutExpo } from '../../lib/motion';

interface StaffProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
  staff: User | null;
  token: string;
  onEdit?: (staff: User) => void;
}

/** Role identity — deterministic color (never random) so a role always reads the same way. */
const ROLE_STYLE: Record<Role, { accent: string; avatarBg: string; avatarText: string; chip: string }> = {
  MANAGER: { accent: 'bg-danger-500', avatarBg: 'bg-danger-100', avatarText: 'text-danger-700', chip: 'bg-danger-50 text-danger-700' },
  DOCTOR: { accent: 'bg-primary-500', avatarBg: 'bg-primary-100', avatarText: 'text-primary-700', chip: 'bg-primary-50 text-primary-700' },
  ASSISTANT: { accent: 'bg-success-500', avatarBg: 'bg-success-100', avatarText: 'text-success-700', chip: 'bg-success-50 text-success-700' },
  RECEPTIONIST: { accent: 'bg-info-500', avatarBg: 'bg-info-100', avatarText: 'text-info-700', chip: 'bg-info-50 text-info-700' },
};

const ROLE_LABEL: Record<Role, string> = {
  MANAGER: 'Manager',
  DOCTOR: 'Doctor',
  ASSISTANT: 'Assistant',
  RECEPTIONIST: 'Receptionist',
};

const currency = (n: number) => `$${Math.round(n).toLocaleString()}`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
const formatDay = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const titleCase = (s: string | null) => (s ? s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : '');

const STATUS_CHIP: Partial<Record<AppointmentStatus, string>> = {
  [AppointmentStatus.SCHEDULED]: 'bg-info-50 text-info-700',
  [AppointmentStatus.CHECKED_IN]: 'bg-warning-50 text-warning-700',
  [AppointmentStatus.IN_PROGRESS]: 'bg-warning-50 text-warning-700',
  [AppointmentStatus.COMPLETED]: 'bg-success-50 text-success-700',
};

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-surface-200 bg-white p-3.5">
      <div className="flex items-center gap-1.5 text-surface-400">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-surface-900 tabular-nums">{value}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-surface-400">{children}</h3>;
}

export const StaffProfileView: React.FC<StaffProfileViewProps> = ({ isOpen, onClose, staff, token, onEdit }) => {
  const isDoctor = staff?.role === 'DOCTOR';
  const doctorId = staff?.doctorProfile?.id;

  const { data: permissions = [] } = useQuery({
    queryKey: staff ? queryKeys.userPermissions(staff.id) : ['user-permissions', 'none'],
    queryFn: async () => (await getUserPermissions(staff!.id, token)).data || [],
    enabled: isOpen && !!staff,
  });

  const { data: performance = [] } = useQuery({
    queryKey: queryKeys.staffPerformance,
    queryFn: async () => (await getStaffPerformance(token)).data.performance,
    enabled: isOpen && isDoctor,
  });

  const { data: patients = [] } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: async () => (await getPatients(token)).data,
    enabled: isOpen && isDoctor,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: queryKeys.appointments(),
    queryFn: () => getAllAppointments(),
    enabled: isOpen && isDoctor,
  });

  if (!isOpen || !staff) return null;

  const style = ROLE_STYLE[staff.role] ?? ROLE_STYLE.RECEPTIONIST;
  const perf = performance.find((p) => p.doctorId === doctorId);
  const completionRate =
    perf && perf.appointments > 0 ? `${Math.round((perf.completedAppointments / perf.appointments) * 100)}%` : '—';
  const patientCount = staff.doctorProfile?.patientCount ?? patients.filter((p) => p.primaryDentistId === doctorId).length;
  const assignedPatients = patients.filter((p) => p.primaryDentistId === doctorId);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const upcoming = (appointments as Appointment[])
    .filter(
      (a) =>
        a.doctorId === doctorId &&
        new Date(a.dateOfTreatment) >= startOfToday &&
        a.status !== AppointmentStatus.CANCELLED &&
        a.status !== AppointmentStatus.NO_SHOW
    )
    .sort((a, b) => new Date(a.dateOfTreatment).getTime() - new Date(b.dateOfTreatment).getTime())
    .slice(0, 5);

  const workingTime: Array<{ day: string; hours: string }> = Array.isArray(staff.doctorProfile?.workingTime)
    ? staff.doctorProfile!.workingTime
    : [];

  const handleAddContact = () => onEdit?.(staff);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/50 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: easeOutExpo }}
          className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        >
          {/* Role accent strip */}
          <div className={`h-1 w-full shrink-0 ${style.accent}`} />

          {/* Header */}
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-surface-100 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-semibold ring-1 ring-inset ring-black/5 ${style.avatarBg} ${style.avatarText}`}>
                {staff.firstName[0]}
                {staff.lastName[0]}
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold tracking-tight text-surface-900">
                  {staff.firstName} {staff.lastName}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.chip}`}>{ROLE_LABEL[staff.role]}</span>
                  <span className="text-sm text-surface-400">@{staff.username}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                    Active
                  </span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(staff)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-surface-300 px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-100"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-md p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-6 overflow-auto p-6">
            {/* Activity metrics (doctors) */}
            {isDoctor && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile icon={<Activity className="h-3.5 w-3.5" />} label="Appointments" value={perf ? perf.appointments : '—'} />
                <StatTile icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Completion" value={completionRate} />
                <StatTile icon={<Users2 className="h-3.5 w-3.5" />} label="Patients" value={patientCount} />
                <StatTile icon={<Wallet className="h-3.5 w-3.5" />} label="Revenue" value={perf ? currency(perf.revenue) : '—'} />
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main column */}
              <div className="space-y-6 lg:col-span-2">
                {isDoctor && (
                  <div>
                    <SectionTitle>Upcoming schedule</SectionTitle>
                    {upcoming.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-surface-200 px-4 py-8 text-center text-sm text-surface-400">
                        No upcoming appointments
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-lg border border-surface-200">
                        <div className="divide-y divide-surface-100">
                          {upcoming.map((a) => (
                            <div key={a.id} className="flex items-center gap-3 px-3.5 py-2.5">
                              <div className="w-16 shrink-0">
                                <p className="text-xs font-semibold text-surface-700">{formatDay(a.dateOfTreatment)}</p>
                                <p className="text-xs text-surface-400 tabular-nums">{formatTime(a.dateOfTreatment)}</p>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-surface-800">
                                  {a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Patient'}
                                </p>
                                <p className="truncate text-xs text-surface-500">
                                  {titleCase(a.typeOfTreatment) || 'Visit'}
                                  {a.room ? ` · ${a.room.name}` : ''}
                                </p>
                              </div>
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_CHIP[a.status] ?? 'bg-surface-100 text-surface-600'}`}>
                                {titleCase(a.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isDoctor && (
                  <div>
                    <SectionTitle>Assigned patients ({patientCount})</SectionTitle>
                    {assignedPatients.length === 0 ? (
                      <p className="text-sm text-surface-400">No patients assigned yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {assignedPatients.slice(0, 10).map((p) => (
                          <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2.5 py-1 text-xs font-medium text-surface-700">
                            {p.firstName} {p.lastName}
                          </span>
                        ))}
                        {assignedPatients.length > 10 && (
                          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-surface-400">
                            +{assignedPatients.length - 10} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Role & access */}
                <div>
                  <SectionTitle>Role &amp; access</SectionTitle>
                  <div className="rounded-lg border border-surface-200 p-4">
                    <div className="flex items-center gap-2 text-sm text-surface-700">
                      <ShieldCheck className="h-4 w-4 text-primary-500" />
                      <span>
                        <span className="font-medium text-surface-900">{ROLE_LABEL[staff.role]}</span> role
                      </span>
                    </div>
                    {permissions.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {permissions.map((perm) => (
                          <span key={perm} className="rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                            {titleCase(perm)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-surface-400">
                        Access is determined by the {ROLE_LABEL[staff.role]} role — no individual permission overrides.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Rail */}
              <div className="space-y-6">
                <div>
                  <SectionTitle>Contact</SectionTitle>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 shrink-0 text-surface-400" />
                      <span className="truncate text-sm text-surface-700">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 shrink-0 text-surface-400" />
                      {staff.phone ? (
                        <span className="text-sm text-surface-700 tabular-nums">{staff.phone}</span>
                      ) : (
                        <button onClick={handleAddContact} className="inline-flex items-center gap-1 text-sm text-surface-400 transition-colors hover:text-primary-600">
                          <Plus className="h-3.5 w-3.5" /> Add phone
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 shrink-0 text-surface-400" />
                      <span className="text-sm text-surface-700">Joined {formatDate(staff.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {isDoctor && (
                  <div>
                    <SectionTitle>Professional</SectionTitle>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="h-4 w-4 shrink-0 text-surface-400" />
                        {staff.doctorProfile?.specialization ? (
                          <span className="text-sm text-surface-700">{staff.doctorProfile.specialization}</span>
                        ) : (
                          <button onClick={handleAddContact} className="inline-flex items-center gap-1 text-sm text-surface-400 transition-colors hover:text-primary-600">
                            <Plus className="h-3.5 w-3.5" /> Add specialization
                          </button>
                        )}
                      </div>
                      {workingTime.length > 0 && (
                        <div>
                          <p className="mb-1.5 flex items-center gap-1.5 text-xs text-surface-500">
                            <Clock className="h-3.5 w-3.5" /> Working hours
                          </p>
                          <div className="space-y-1">
                            {workingTime.map((wh, i) => (
                              <div key={i} className="flex items-center justify-between rounded-md bg-surface-50 px-2.5 py-1.5 text-xs">
                                <span className="font-medium text-surface-700">{wh.day}</span>
                                <span className="text-surface-500 tabular-nums">{wh.hours}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
