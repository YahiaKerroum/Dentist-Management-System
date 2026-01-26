import React, { useState, useEffect } from 'react';
import { User, CreateUserDTO, UpdateUserDTO, Role } from '../../types/user';
import { X, User as UserIcon, Mail, Lock, Phone, Stethoscope, Clock, Plus, Shield } from 'lucide-react';
import { getUserPermissions, grantUserPermission, revokeUserPermission } from '../../services/user.service';

interface StaffFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateUserDTO | UpdateUserDTO) => Promise<any> | void;
    staff?: User | null;
    loading?: boolean;
    token: string;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    staff,
    loading = false,
    token
}) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        role: 'ASSISTANT' as Role,
        phone: '',
        specialization: '',
        workingTime: [] as Array<{ day: string; hours: string }>
    });

    const [showWorkingHours, setShowWorkingHours] = useState(false);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);

    useEffect(() => {
        if (staff) {
            // Safely parse workingTime - ensure it's always an array
            let workingTimeArray: Array<{ day: string; hours: string }> = [];
            if (staff.doctorProfile?.workingTime) {
                // If it's already an array, use it; otherwise convert to array or default to empty
                if (Array.isArray(staff.doctorProfile.workingTime)) {
                    workingTimeArray = staff.doctorProfile.workingTime;
                }
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
                workingTime: workingTimeArray
            });
            setShowWorkingHours(staff.role === 'DOCTOR');
            // Load permissions for existing staff
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
                workingTime: []
            });
            setShowWorkingHours(false);
            setPermissions([]);
            setOriginalPermissions([]);
        }
    }, [staff, token]);

    useEffect(() => {
        setShowWorkingHours(formData.role === 'DOCTOR');
    }, [formData.role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitData: any = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone || undefined,
        };

        if (!staff) {
            // Creating new staff
            submitData.username = formData.username;
            submitData.password = formData.password;
            submitData.role = formData.role;
        }

        if (formData.role === 'DOCTOR') {
            submitData.specialization = formData.specialization || undefined;
            submitData.workingTime = formData.workingTime.length > 0 ? formData.workingTime : undefined;
        }

        await onSubmit(submitData);

        // Apply permission differences after main submit when editing
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

    const togglePermission = (perm?: string) => {
        if (!perm) return;
        setPermissions((prev) =>
            prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
        );
    };

    const handleWorkingHourChange = (index: number, field: 'day' | 'hours', value: string) => {
        const newWorkingTime = [...formData.workingTime];
        newWorkingTime[index] = { ...newWorkingTime[index], [field]: value };
        setFormData({ ...formData, workingTime: newWorkingTime });
    };

    const addWorkingHour = () => {
        setFormData({
            ...formData,
            workingTime: [...formData.workingTime, { day: 'Monday', hours: '09:00-17:00' }]
        });
    };

    const removeWorkingHour = (index: number) => {
        const newWorkingTime = formData.workingTime.filter((_, i) => i !== index);
        setFormData({ ...formData, workingTime: newWorkingTime });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-5">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3DBEA3]/10 flex items-center justify-center">
                            <UserIcon size={20} className="text-[#3DBEA3]" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3] transition-all"
                                    placeholder="Enter first name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3] transition-all"
                                    placeholder="Enter last name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3] transition-all"
                                placeholder="email@example.com"
                            />
                        </div>
                    </div>

                    {!staff && (
                        <>
                            {/* Username */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3] transition-all"
                                        placeholder="Choose a username"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3] transition-all"
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>
                            </div>

                            {/* Role */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Shield size={18} className="text-gray-400" />
                                    </div>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3] transition-all appearance-none bg-white"
                                    >
                                        <option value="ASSISTANT">Assistant</option>
                                        <option value="DOCTOR">Doctor</option>
                                        <option value="MANAGER">Manager</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Phone */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3] transition-all"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>

                    {showWorkingHours && (
                        <>
                            {/* Specialization */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Specialization
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Stethoscope size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.specialization}
                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                        placeholder="e.g., General Dentistry, Orthodontics"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Working Hours */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Clock size={18} className="text-gray-600" />
                                        Working Hours
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addWorkingHour}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3DBEA3] text-white rounded-lg text-xs font-medium hover:bg-[#35a892] transition-colors"
                                    >
                                        <Plus size={14} />
                                        Add Day
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {Array.isArray(formData.workingTime) && formData.workingTime.map((wh, index) => (
                                        <div key={index} className="flex gap-2">
                                            <select
                                                value={wh.day}
                                                onChange={(e) => handleWorkingHourChange(index, 'day', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3] transition-all"
                                            >
                                                <option value="Monday">Monday</option>
                                                <option value="Tuesday">Tuesday</option>
                                                <option value="Wednesday">Wednesday</option>
                                                <option value="Thursday">Thursday</option>
                                                <option value="Friday">Friday</option>
                                                <option value="Saturday">Saturday</option>
                                                <option value="Sunday">Sunday</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={wh.hours}
                                                onChange={(e) => handleWorkingHourChange(index, 'hours', e.target.value)}
                                                placeholder="09:00-17:00"
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3] transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeWorkingHour(index)}
                                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Permissions (edit existing staff only) */}
                    {staff && (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield size={18} className="text-gray-600" />
                                <h3 className="text-base font-semibold text-gray-900">Permissions</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {permissionGroups.map((group) => (
                                    <div key={group.key} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <div className="font-semibold text-sm text-gray-900 mb-3">{group.label}</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {group.actions.map((action) => (
                                                <label 
                                                    key={action.label} 
                                                    className={`flex items-center gap-2 text-sm cursor-pointer ${!action.value ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        disabled={!action.value}
                                                        checked={action.value ? permissions.includes(action.value) : false}
                                                        onChange={() => togglePermission(action.value)}
                                                        className="w-4 h-4 text-[#3DBEA3] border-gray-300 rounded focus:ring-[#3DBEA3] focus:ring-2 cursor-pointer disabled:cursor-not-allowed"
                                                    />
                                                    <span className="text-gray-700">{action.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-[#3DBEA3] text-white rounded-xl text-sm font-medium hover:bg-[#35a892] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? 'Saving...' : staff ? 'Update Staff' : 'Create Staff'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
