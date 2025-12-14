import React, { useState, useEffect } from 'react';
import { User, CreateUserDTO, UpdateUserDTO, Role } from '../../types/user';
import { X } from 'lucide-react';
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
        role: 'DOCTOR' as Role,
        phone: '',
        specialization: '',
        workingTime: [] as Array<{ day: string; hours: string }>
    });

    const [showWorkingHours, setShowWorkingHours] = useState(false);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);

    useEffect(() => {
        if (staff) {
            setFormData({
                firstName: staff.firstName,
                lastName: staff.lastName,
                email: staff.email,
                username: staff.username,
                password: '',
                role: staff.role,
                phone: staff.phone || '',
                specialization: staff.doctorProfile?.specialization || '',
                workingTime: staff.doctorProfile?.workingTime || []
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
                role: 'DOCTOR',
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
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    zIndex: 1
                }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                        {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#6b7280'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                                First Name <span style={{ color: '#dc3545' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                                Last Name <span style={{ color: '#dc3545' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                            Email <span style={{ color: '#dc3545' }}>*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {!staff && (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                                    Username <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                                    Password <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    minLength={6}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                                    Role <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="DOCTOR">Doctor</option>
                                    <option value="ASSISTANT">Assistant</option>
                                    <option value="MANAGER">Manager</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                            Phone
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {showWorkingHours && (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    placeholder="e.g., General Dentistry, Orthodontics"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontWeight: 500, fontSize: '14px' }}>
                                        Working Hours
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addWorkingHour}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        + Add Day
                                    </button>
                                </div>
                                {formData.workingTime.map((wh, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <select
                                            value={wh.day}
                                            onChange={(e) => handleWorkingHourChange(index, 'day', e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
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
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeWorkingHour(index)}
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Permissions (edit existing staff only) */}
                    {staff && (
                        <div style={{ marginTop: '16px' }}>
                            <h3 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 600 }}>Permissions</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {permissionGroups.map((group) => (
                                    <div key={group.key} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '8px', color: '#111827' }}>{group.label}</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px' }}>
                                            {group.actions.map((action) => (
                                                <label key={action.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: action.value ? '#111827' : '#9ca3af' }}>
                                                    <input
                                                        type="checkbox"
                                                        disabled={!action.value}
                                                        checked={action.value ? permissions.includes(action.value) : false}
                                                        onChange={() => togglePermission(action.value)}
                                                    />
                                                    <span>{action.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'flex-end',
                        marginTop: '24px',
                        paddingTop: '24px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.5 : 1
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.5 : 1
                            }}
                        >
                            {loading ? 'Saving...' : staff ? 'Update Staff' : 'Create Staff'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
