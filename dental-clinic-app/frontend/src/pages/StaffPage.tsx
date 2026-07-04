import React, { useEffect, useState, useRef } from 'react';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../services/user.service';
import { User, Role, CreateUserDTO, UpdateUserDTO } from '../types/user';
import { StaffTable } from '../components/staff/StaffTable';
import { StaffFormModal } from '../components/staff/StaffFormModal';
import { StaffProfileView } from '../components/staff/StaffProfileView';
import { downloadCSV, formatStaffForExport } from '../utils/export.utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { UserPlus, Search, Filter, Download, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toaster';

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

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isProfileViewOpen, setIsProfileViewOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);

    useKeyboardShortcuts([
        { key: 'k', ctrl: true, description: 'Focus search', action: () => searchInputRef.current?.focus() },
        { key: 'n', ctrl: true, description: 'Add new staff', action: () => handleAddNew() },
        { key: 'e', ctrl: true, description: 'Export to CSV', action: () => handleExportCSV() },
    ]);

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

    const handleCreate = async (data: CreateUserDTO | UpdateUserDTO) => {
        try {
            setFormLoading(true);
            await createStaff(data as CreateUserDTO, token);
            setIsFormModalOpen(false);
            setSelectedStaff(null);
            fetchStaff();
            toast.success('Staff member created');
        } catch (err: any) {
            toast.error(err.message || 'Failed to create staff member');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdate = async (data: CreateUserDTO | UpdateUserDTO) => {
        if (!selectedStaff) return;
        try {
            setFormLoading(true);
            await updateStaff(selectedStaff.id, data as UpdateUserDTO, token);
            setIsFormModalOpen(false);
            setSelectedStaff(null);
            fetchStaff();
            toast.success('Staff member updated');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update staff member');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (staffMember: User) => {
        if (!window.confirm(`Are you sure you want to delete ${staffMember.firstName} ${staffMember.lastName}?`)) {
            return;
        }
        try {
            await deleteStaff(staffMember.id, token);
            fetchStaff();
            toast.success('Staff member deleted');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete staff member');
        }
    };

    const handleEdit = (staffMember: User) => {
        setSelectedStaff(staffMember);
        setIsFormModalOpen(true);
    };

    const handleView = (staffMember: User) => {
        setSelectedStaff(staffMember);
        setIsProfileViewOpen(true);
    };

    const handleAddNew = () => {
        setSelectedStaff(null);
        setIsFormModalOpen(true);
    };

    const handleExportCSV = () => {
        const dataToExport = formatStaffForExport(filteredStaff);
        downloadCSV(dataToExport, 'staff');
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
    };

    const hasActiveFilters = searchTerm !== '' || roleFilter !== '';

    if (loading) {
        return (
            <div className="space-y-4 p-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl p-8">
            <div className="mb-8">
                <h1 className="text-xl font-semibold text-surface-900">Staff Management</h1>
                <p className="mt-1 text-sm text-surface-500">Manage your clinic staff members, roles, and access</p>
            </div>

            {error && (
                <div className="mb-6 rounded-md border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                    {error}
                </div>
            )}

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="min-w-[250px] flex-1">
                    <Input
                        ref={searchInputRef}
                        placeholder="Search by name, email... (Ctrl+K)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leadingIcon={<Search size={16} />}
                    />
                </div>

                <div className="relative min-w-[180px]">
                    <Filter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as Role | '')}
                        className="h-10 w-full appearance-none rounded-md border border-surface-300 bg-white pl-10 pr-3 text-sm text-surface-700 focus:border-primary-500 focus:outline-none focus:shadow-focus"
                    >
                        <option value="">All Roles</option>
                        <option value="DOCTOR">Doctors</option>
                        <option value="ASSISTANT">Assistants</option>
                        <option value="MANAGER">Managers</option>
                    </select>
                </div>

                <Button variant="secondary" onClick={handleExportCSV} title="Export to CSV (Ctrl+E)">
                    <Download size={16} />
                    Export
                </Button>

                {hasActiveFilters && (
                    <Button variant="ghost" onClick={handleClearFilters}>
                        <X size={16} />
                        Clear Filters
                    </Button>
                )}

                <Button onClick={handleAddNew} title="Add new staff member (Ctrl+N)">
                    <UserPlus size={16} />
                    Add Staff Member
                </Button>
            </div>

            <div className="mb-4 rounded-md bg-surface-100 px-4 py-2.5 text-sm text-surface-600">
                Showing <strong className="font-semibold text-surface-800">{filteredStaff.length}</strong> of{' '}
                <strong className="font-semibold text-surface-800">{staff.length}</strong> staff members
            </div>

            <StaffTable staff={filteredStaff} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />

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
