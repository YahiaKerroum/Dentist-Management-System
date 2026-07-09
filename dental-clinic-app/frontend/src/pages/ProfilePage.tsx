import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserProfile, updateUserProfile, getUserPermissions } from '../services/user.service';
import { User, UpdateUserDTO } from '../types/user';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { DialogPanel } from '../components/ui/Dialog';
import { toast } from '../components/ui/Toaster';
import { cn } from '../utils/cn';
import {
    Pencil,
    Calendar,
    Clock,
    ShieldCheck,
    IdCard,
} from 'lucide-react';

const PERMISSION_GROUPS: Array<{ key: string; label: string; actions: { label: string; value: string }[] }> = [
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
            { label: 'Cancel', value: 'appointments.cancel' },
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
        key: 'expenses',
        label: 'Expenses',
        actions: [
            { label: 'View', value: 'expenses.view' },
            { label: 'Create', value: 'expenses.create' },
            { label: 'Update', value: 'expenses.update' },
            { label: 'Delete', value: 'expenses.delete' },
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
];

interface ProfilePageProps {
    token: string;
}

const ROLE_LABEL: Record<string, string> = {
    MANAGER: 'Manager',
    DOCTOR: 'Doctor',
    ASSISTANT: 'Assistant',
    RECEPTIONIST: 'Receptionist',
};

const DEFAULT_WORKING_HOURS = [
    { day: 'Monday', time: '08:00 AM - 06:00 PM' },
    { day: 'Tuesday', time: '08:00 AM - 06:00 PM' },
    { day: 'Wednesday', time: '08:00 AM - 06:00 PM' },
    { day: 'Thursday', time: '08:00 AM - 06:00 PM' },
    { day: 'Friday', time: '08:00 AM - 04:00 PM' },
    { day: 'Saturday', time: 'Closed' },
    { day: 'Sunday', time: 'Closed' },
];

export function ProfilePage({ token }: ProfilePageProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateUserDTO>({});
    const [workingHours, setWorkingHours] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        try {
            const response = await getUserProfile(token);
            setUser(response.data);
            setFormData({
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                email: response.data.email,
                phone: response.data.phone || '',
                specialization: response.data.doctorProfile?.specialization || '',
                workingTime: response.data.doctorProfile?.workingTime || null,
            });

            if (response.data.role === 'DOCTOR' && response.data.doctorProfile?.workingTime) {
                setWorkingHours(response.data.doctorProfile.workingTime);
            } else if (response.data.role === 'DOCTOR') {
                setWorkingHours(DEFAULT_WORKING_HOURS);
            }

            getUserPermissions(response.data.id, token)
                .then((res) => setPermissions(res.data || []))
                .catch(() => setPermissions([]));
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const calculateYearsExperience = () => {
        if (!user?.createdAt) return 0;
        return new Date().getFullYear() - new Date(user.createdAt).getFullYear();
    };

    const formatMemberSince = () => {
        if (!user?.createdAt) return 'N/A';
        return new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditClick = () => {
        if (user?.role === 'DOCTOR') {
            if (user.doctorProfile?.workingTime && Array.isArray(user.doctorProfile.workingTime)) {
                setWorkingHours(user.doctorProfile.workingTime);
            } else {
                setWorkingHours(DEFAULT_WORKING_HOURS);
            }
        }
        setIsEditing(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            const updateData = { ...formData };
            if (user?.role === 'DOCTOR') {
                updateData.workingTime = workingHours;
            }

            const response = await updateUserProfile(updateData, token);
            setUser(response.data);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleWorkingHourChange = (index: number, value: string) => {
        const newHours = [...workingHours];
        newHours[index] = { ...newHours[index], time: value };
        setWorkingHours(newHours);
    };

    if (loading) {
        return (
            <div className="p-8">
                <Skeleton className="mb-6 h-32" />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Skeleton className="h-64 lg:col-span-1" />
                    <Skeleton className="h-64 lg:col-span-2" />
                </div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="p-8">
                <Card className="border-danger-100 bg-danger-50 p-6">
                    <p className="mb-4 text-sm text-danger-700">{error}</p>
                    <Button variant="destructive" onClick={() => window.location.reload()}>Retry</Button>
                </Card>
            </div>
        );
    }

    if (!user) return null;

    const isDoctor = user.role === 'DOCTOR';

    return (
        <div className="mx-auto max-w-4xl p-8">
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {/* Bio header */}
                <div className="flex flex-col gap-6 border-b border-surface-200 pb-8 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-100 text-2xl font-semibold text-primary-700">
                            {user.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="font-display text-2xl font-semibold tracking-tight text-surface-900">
                                {user.firstName} {user.lastName}
                            </h1>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-surface-500">
                                <Badge variant="primary">{ROLE_LABEL[user.role] ?? user.role}</Badge>
                                {user.doctorProfile?.specialization && (
                                    <Badge variant="info">{user.doctorProfile.specialization}</Badge>
                                )}
                            </div>
                            <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-sm text-surface-500">
                                <span>{user.email}</span>
                                {user.phone && (
                                    <>
                                        <span className="text-surface-300">·</span>
                                        <span>{user.phone}</span>
                                    </>
                                )}
                                <span className="text-surface-300">·</span>
                                <span>Member since {formatMemberSince()}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:self-start">
                        {isDoctor && (
                            <div className="flex divide-x divide-surface-200 rounded-md border border-surface-200">
                                <div className="px-4 py-2 text-center">
                                    <p className="text-lg font-semibold text-surface-900">{calculateYearsExperience()}</p>
                                    <p className="text-xs text-surface-500">Years exp.</p>
                                </div>
                                <div className="px-4 py-2 text-center">
                                    <p className="text-lg font-semibold text-surface-900">{user.doctorProfile?.patientCount || 0}</p>
                                    <p className="text-xs text-surface-500">Patients</p>
                                </div>
                            </div>
                        )}
                        <Button variant="secondary" onClick={handleEditClick}>
                            <Pencil className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    </div>
                </div>

                {isDoctor && (
                    <div className="mt-8">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-surface-400">Working Schedule</h2>
                        {user.doctorProfile?.workingTime && Array.isArray(user.doctorProfile.workingTime) && user.doctorProfile.workingTime.length > 0 ? (
                            <div className="grid grid-cols-7 gap-2">
                                {user.doctorProfile.workingTime.map((schedule: any, index: number) => {
                                    const isOpen = schedule.time && schedule.time !== 'Closed';
                                    const label = (schedule.day || schedule.days || '').toString().slice(0, 3);
                                    return (
                                        <div
                                            key={index}
                                            className={cn(
                                                'flex flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center',
                                                isOpen ? 'border-primary-200 bg-primary-50/50' : 'border-surface-200 bg-surface-50'
                                            )}
                                        >
                                            <span className={cn('text-xs font-semibold uppercase tracking-wide', isOpen ? 'text-primary-700' : 'text-surface-400')}>
                                                {label}
                                            </span>
                                            <Clock className={cn('h-4 w-4', isOpen ? 'text-primary-500' : 'text-surface-300')} />
                                            <span className={cn('text-[11px] leading-tight', isOpen ? 'text-surface-700' : 'text-surface-400')}>
                                                {isOpen ? (schedule.time || schedule.hours) : 'Closed'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-surface-200 py-10 text-center">
                                <Calendar className="mx-auto mb-3 h-8 w-8 text-surface-300" />
                                <p className="text-sm text-surface-500">No working hours set.</p>
                                <p className="mt-1 text-xs text-surface-400">Click Edit Profile to add your schedule.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="p-5 lg:col-span-1">
                        <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
                            <IdCard className="h-3.5 w-3.5" />
                            Account Details
                        </h2>
                        <dl className="space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-surface-500">Username</dt>
                                <dd className="font-medium text-surface-800">@{user.username}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-surface-500">Role</dt>
                                <dd className="font-medium text-surface-800">{ROLE_LABEL[user.role] ?? user.role}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <dt className="shrink-0 text-surface-500">User ID</dt>
                                <dd className="truncate font-mono text-xs text-surface-500">{user.id}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-surface-500">Last updated</dt>
                                <dd className="font-medium text-surface-800">
                                    {new Date(user.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </dd>
                            </div>
                        </dl>
                    </Card>

                    <Card className="p-5 lg:col-span-2">
                        <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            My Access
                        </h2>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {PERMISSION_GROUPS.map((group) => (
                                <div key={group.key} className="rounded-lg border border-surface-200 p-3">
                                    <p className="mb-2 text-sm font-semibold text-surface-800">{group.label}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {group.actions.map((action) => {
                                            const granted = permissions.includes(action.value);
                                            return (
                                                <span
                                                    key={action.value}
                                                    className={cn(
                                                        'rounded px-1.5 py-0.5 text-[11px] font-medium',
                                                        granted ? 'bg-success-50 text-success-700' : 'bg-surface-100 text-surface-400'
                                                    )}
                                                >
                                                    {action.label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {error && (
                    <div className="mt-6 flex items-center gap-2 rounded-md border border-danger-100 bg-danger-50 p-4 text-sm text-danger-600">
                        <span className="font-semibold">Error:</span> {error}
                    </div>
                )}
            </motion.div>

            <DialogPanel open={isEditing} onOpenChange={setIsEditing} title="Edit Profile">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" name="firstName" value={formData.firstName || ''} onChange={handleChange} />
                        <Input label="Last Name" name="lastName" value={formData.lastName || ''} onChange={handleChange} />
                    </div>
                    <Input label="Email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
                    <Input label="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} />

                    {isDoctor && (
                        <div className="mt-6">
                            <h4 className="mb-3 text-sm font-semibold text-surface-700">Working Hours</h4>
                            <div className="max-h-60 space-y-2 overflow-y-auto">
                                {Array.isArray(workingHours) && workingHours.length > 0 ? (
                                    workingHours.map((schedule, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <label className="w-24 text-sm text-surface-600">{schedule.day}</label>
                                            <input
                                                type="text"
                                                className="flex-1 rounded-md border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:shadow-focus"
                                                value={schedule.time}
                                                onChange={(e) => handleWorkingHourChange(index, e.target.value)}
                                                placeholder="e.g., 08:00 AM - 06:00 PM or Closed"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-surface-500">Loading working hours...</p>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-surface-500">Enter time ranges (e.g., "08:00 AM - 06:00 PM") or "Closed" for days off</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={saving}>Save Changes</Button>
                    </div>
                </div>
            </DialogPanel>
        </div>
    );
}
