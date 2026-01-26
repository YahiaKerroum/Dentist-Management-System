import React, { useEffect, useState, useRef } from 'react';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../services/user.service';
import { User, Role, CreateUserDTO, UpdateUserDTO } from '../types/user';
import { StaffTable } from '../components/staff/StaffTable';
import { StaffFormModal } from '../components/staff/StaffFormModal';
import { StaffProfileView } from '../components/staff/StaffProfileView';
import { downloadCSV, formatStaffForExport } from '../utils/export.utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { UserPlus, Search, Filter, Download, X } from 'lucide-react';

interface StaffPageProps {
    token: string;
}

export const StaffPage: React.FC<StaffPageProps> = ({ token }) => {
    const [staff, setStaff] = useState<User[]>([]);
    const [filteredStaff, setFilteredStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<Role | ''>('');
    
    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isProfileViewOpen, setIsProfileViewOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Search input ref for keyboard shortcuts
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 'k',
            ctrl: true,
            description: 'Focus search',
            action: () => searchInputRef.current?.focus(),
        },
        {
            key: 'n',
            ctrl: true,
            description: 'Add new staff',
            action: () => handleAddNew(),
        },
        {
            key: 'e',
            ctrl: true,
            description: 'Export to CSV',
            action: () => handleExportCSV(),
        },
    ]);

    // Fetch all staff
    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await getAllStaff(token);
            setStaff(response.data);
            setFilteredStaff(response.data);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [token]);

    // Filter staff based on search term and role
    useEffect(() => {
        let filtered = staff;

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (member) =>
                    member.firstName.toLowerCase().includes(searchLower) ||
                    member.lastName.toLowerCase().includes(searchLower) ||
                    member.email.toLowerCase().includes(searchLower) ||
                    member.username.toLowerCase().includes(searchLower)
            );
        }

        if (roleFilter) {
            filtered = filtered.filter((member) => member.role === roleFilter);
        }

        setFilteredStaff(filtered);
    }, [searchTerm, roleFilter, staff]);

    // Handle create staff
    const handleCreate = async (data: CreateUserDTO | UpdateUserDTO) => {
        try {
            setFormLoading(true);
            await createStaff(data as CreateUserDTO, token);
            setIsFormModalOpen(false);
            setSelectedStaff(null);
            fetchStaff();
            alert('Staff member created successfully');
        } catch (err: any) {
            alert(err.message || 'Failed to create staff member');
        } finally {
            setFormLoading(false);
        }
    };

    // Handle update staff
    const handleUpdate = async (data: CreateUserDTO | UpdateUserDTO) => {
        if (!selectedStaff) return;
        try {
            setFormLoading(true);
            await updateStaff(selectedStaff.id, data as UpdateUserDTO, token);
            setIsFormModalOpen(false);
            setSelectedStaff(null);
            fetchStaff();
            alert('Staff member updated successfully');
        } catch (err: any) {
            alert(err.message || 'Failed to update staff member');
        } finally {
            setFormLoading(false);
        }
    };

    // Handle delete staff
    const handleDelete = async (staffMember: User) => {
        if (!window.confirm(`Are you sure you want to delete ${staffMember.firstName} ${staffMember.lastName}?`)) {
            return;
        }

        try {
            await deleteStaff(staffMember.id, token);
            fetchStaff();
            alert('Staff member deleted successfully');
        } catch (err: any) {
            alert(err.message || 'Failed to delete staff member');
        }
    };

    // Handle edit button click
    const handleEdit = (staffMember: User) => {
        setSelectedStaff(staffMember);
        setIsFormModalOpen(true);
    };

    // Handle view profile
    const handleView = (staffMember: User) => {
        setSelectedStaff(staffMember);
        setIsProfileViewOpen(true);
    };

    // Handle add new staff
    const handleAddNew = () => {
        setSelectedStaff(null);
        setIsFormModalOpen(true);
    };

    // Handle export to CSV
    const handleExportCSV = () => {
        const dataToExport = formatStaffForExport(filteredStaff);
        downloadCSV(dataToExport, 'staff');
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
    };

    // Check if filters are active
    const hasActiveFilters = () => {
        return searchTerm !== '' || roleFilter !== '';
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#6c757d'
            }}>
                Loading staff...
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 600, color: '#1f2937' }}>
                    Staff Management
                </h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
                    Manage your clinic staff members, roles, and access
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '16px',
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '8px',
                    color: '#c00',
                    marginBottom: '24px'
                }}>
                    {error}
                </div>
            )}

            {/* Filters and Actions */}
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                {/* Search Input */}
                <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
                    <Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#6b7280'
                        }}
                    />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search by name, email... (Ctrl+K)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Role Filter */}
                <div style={{ position: 'relative', minWidth: '200px' }}>
                    <Filter
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#6b7280',
                            pointerEvents: 'none'
                        }}
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as Role | '')}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            cursor: 'pointer',
                            appearance: 'none',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="">All Roles</option>
                        <option value="DOCTOR">Doctors</option>
                        <option value="ASSISTANT">Assistants</option>
                        <option value="MANAGER">Managers</option>
                    </select>
                </div>

                {/* Export Button */}
                <button
                    onClick={handleExportCSV}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                    title="Export to CSV (Ctrl+E)"
                >
                    <Download size={18} />
                    Export
                </button>

                {/* Clear Filters Button */}
                {hasActiveFilters() && (
                    <button
                        onClick={handleClearFilters}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    >
                        <X size={18} />
                        Clear Filters
                    </button>
                )}

                {/* Add New Staff Button */}
                <button
                    onClick={handleAddNew}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#3DBEA3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2FA88E'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3DBEA3'}
                    title="Add new staff member (Ctrl+N)"
                >
                    <UserPlus size={18} />
                    Add Staff Member
                </button>
            </div>

            {/* Staff Count */}
            <div style={{
                padding: '12px 16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#495057'
            }}>
                Showing <strong>{filteredStaff.length}</strong> of <strong>{staff.length}</strong> staff members
            </div>

            {/* Staff Table */}
            <StaffTable
                staff={filteredStaff}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
            />

            {/* Form Modal */}
            <StaffFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedStaff(null);
                }}
                onSubmit={selectedStaff ? handleUpdate : handleCreate}
                staff={selectedStaff}
                loading={formLoading}
                token={token}
            />

            {/* Profile View Modal */}
            <StaffProfileView
                isOpen={isProfileViewOpen}
                onClose={() => {
                    setIsProfileViewOpen(false);
                    setSelectedStaff(null);
                }}
                staff={selectedStaff}
            />
        </div>
    );
};
