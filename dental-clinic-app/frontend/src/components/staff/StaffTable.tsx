import React from 'react';
import { User, Role } from '../../types/user';
import { Users, Pencil, Trash2, Eye, Clock } from 'lucide-react';

interface StaffTableProps {
    staff: User[];
    onEdit: (staff: User) => void;
    onDelete: (staff: User) => void;
    onView: (staff: User) => void;
}

const getRoleBadgeColor = (role: Role): string => {
    switch (role) {
        case 'MANAGER':
            return '#dc3545';
        case 'DOCTOR':
            return '#26a37e';
        case 'ASSISTANT':
            return '#28a745';
        default:
            return '#6c757d';
    }
};

const getRoleIcon = () => {
    return <Users size={16} />;
};

export const StaffTable: React.FC<StaffTableProps> = ({ staff, onEdit, onDelete, onView }) => {
    if (staff.length === 0) {
        return (
            <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#6c757d',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '2px dashed #dee2e6'
            }}>
                <Users size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p style={{ fontSize: '18px', marginBottom: '8px' }}>No staff members found</p>
                <p style={{ fontSize: '14px' }}>Add your first staff member to get started</p>
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>Name</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>Email</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>Role</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>Phone</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>Specialization</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#495057' }}>Last Updated</th>
                        <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#495057' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {staff.map((member) => (
                        <tr
                            key={member.id}
                            style={{
                                borderBottom: '1px solid #dee2e6',
                                transition: 'background-color 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            onClick={() => onView(member)}
                        >
                            <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: getRoleBadgeColor(member.role),
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: '14px'
                                    }}>
                                        {member.firstName[0]}{member.lastName[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500, color: '#212529' }}>
                                            {member.firstName} {member.lastName}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                            @{member.username}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '16px', color: '#495057' }}>{member.email}</td>
                            <td style={{ padding: '16px' }}>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    backgroundColor: getRoleBadgeColor(member.role) + '20',
                                    color: getRoleBadgeColor(member.role)
                                }}>
                                    {getRoleIcon()}
                                    {member.role}
                                </span>
                            </td>
                            <td style={{ padding: '16px', color: '#495057' }}>
                                {member.phone || <span style={{ color: '#adb5bd' }}>Not set</span>}
                            </td>
                            <td style={{ padding: '16px', color: '#495057' }}>
                                {member.doctorProfile?.specialization || <span style={{ color: '#adb5bd' }}>N/A</span>}
                            </td>
                            <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6c757d', fontSize: '14px' }}>
                                    <Clock size={16} style={{ opacity: 0.6 }} />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>{member.updatedAt ? new Date(member.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                        <span style={{ fontSize: '12px', color: '#adb5bd' }}>
                                            {member.updatedAt ? new Date(member.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => onView(member)}
                                        style={{
                                            padding: '8px',
                                            backgroundColor: '#effcf6',
                                            color: '#26a37e',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#26a37e';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#effcf6';
                                            e.currentTarget.style.color = '#26a37e';
                                        }}
                                        title="View Profile"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => onEdit(member)}
                                        style={{
                                            padding: '8px',
                                            backgroundColor: '#fff3cd',
                                            color: '#856404',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#ffc107';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#fff3cd';
                                            e.currentTarget.style.color = '#856404';
                                        }}
                                        title="Edit Staff"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(member)}
                                        style={{
                                            padding: '8px',
                                            backgroundColor: '#f8d7da',
                                            color: '#721c24',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#dc3545';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f8d7da';
                                            e.currentTarget.style.color = '#721c24';
                                        }}
                                        title="Delete Staff"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
