import React from 'react';
import { User } from '../../types/user';
import { X, Mail, Phone, Calendar, Briefcase, Clock, User as UserIcon } from 'lucide-react';

interface StaffProfileViewProps {
    isOpen: boolean;
    onClose: () => void;
    staff: User | null;
}

const getRoleBadgeColor = (role: string): string => {
    switch (role) {
        case 'MANAGER':
            return '#dc3545';
        case 'DOCTOR':
            return '#007bff';
        case 'ASSISTANT':
            return '#28a745';
        default:
            return '#6c757d';
    }
};

export const StaffProfileView: React.FC<StaffProfileViewProps> = ({ isOpen, onClose, staff }) => {
    if (!isOpen || !staff) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

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
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                {/* Header with gradient background */}
                <div style={{
                    padding: '32px 24px',
                    background: `linear-gradient(135deg, ${getRoleBadgeColor(staff.role)} 0%, ${getRoleBadgeColor(staff.role)}dd 100%)`,
                    color: 'white',
                    borderRadius: '12px 12px 0 0',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'white'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    >
                        <X size={20} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            border: '3px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            fontWeight: 'bold'
                        }}>
                            {staff.firstName[0]}{staff.lastName[0]}
                        </div>
                        <div>
                            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 600 }}>
                                {staff.firstName} {staff.lastName}
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    padding: '4px 12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: 500
                                }}>
                                    {staff.role}
                                </span>
                                <span style={{ opacity: 0.9, fontSize: '14px' }}>
                                    @{staff.username}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {/* Contact Information */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{
                            margin: '0 0 16px 0',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#1f2937',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <UserIcon size={20} />
                            Contact Information
                        </h3>
                        <div style={{
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'grid',
                            gap: '12px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Mail size={18} style={{ color: '#6b7280' }} />
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Email</div>
                                    <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: 500 }}>{staff.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Phone size={18} style={{ color: '#6b7280' }} />
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Phone</div>
                                    <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: 500 }}>
                                        {staff.phone || <span style={{ color: '#9ca3af' }}>Not provided</span>}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Calendar size={18} style={{ color: '#6b7280' }} />
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Joined</div>
                                    <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: 500 }}>{formatDate(staff.createdAt)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Doctor-specific information */}
                    {staff.doctorProfile && (
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{
                                margin: '0 0 16px 0',
                                fontSize: '18px',
                                fontWeight: 600,
                                color: '#1f2937',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Briefcase size={20} />
                                Professional Information
                            </h3>
                            <div style={{
                                backgroundColor: '#f9fafb',
                                borderRadius: '8px',
                                padding: '16px'
                            }}>
                                {staff.doctorProfile.specialization && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Specialization</div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#1f2937',
                                            fontWeight: 500,
                                            padding: '8px 12px',
                                            backgroundColor: 'white',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            {staff.doctorProfile.specialization}
                                        </div>
                                    </div>
                                )}

                                {staff.doctorProfile.workingTime && Array.isArray(staff.doctorProfile.workingTime) && staff.doctorProfile.workingTime.length > 0 && (
                                    <div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#6b7280',
                                            marginBottom: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <Clock size={14} />
                                            Working Hours
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gap: '8px'
                                        }}>
                                            {staff.doctorProfile.workingTime.map((wh: any, index: number) => (
                                                <div key={index} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '8px 12px',
                                                    backgroundColor: 'white',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                                                        {wh.day}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '13px',
                                                        color: '#6b7280',
                                                        fontFamily: 'monospace',
                                                        backgroundColor: '#f3f4f6',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px'
                                                    }}>
                                                        {wh.hours}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {staff.doctorProfile.patientCount !== undefined && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '12px',
                                        backgroundColor: '#e7f3ff',
                                        borderRadius: '6px',
                                        border: '1px solid #bee5ff'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#0056b3', marginBottom: '4px' }}>Active Patients</div>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                                            {staff.doctorProfile.patientCount}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Account Status */}
                    <div>
                        <h3 style={{
                            margin: '0 0 16px 0',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#1f2937'
                        }}>
                            Account Details
                        </h3>
                        <div style={{
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px'
                        }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>User ID</div>
                                <div style={{
                                    fontSize: '13px',
                                    color: '#1f2937',
                                    fontFamily: 'monospace',
                                    backgroundColor: 'white',
                                    padding: '6px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #e5e7eb',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {staff.id}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Last Updated</div>
                                <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: 500 }}>
                                    {formatDate(staff.updatedAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
