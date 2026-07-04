import React from 'react';
import { motion } from 'framer-motion';
import { User, Role } from '../../types/user';
import { Pencil, Trash2, Mail, Phone, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { getAvatarColor } from '../../utils/avatarColor';

interface StaffTableProps {
    staff: User[];
    onEdit: (staff: User) => void;
    onDelete: (staff: User) => void;
    onView: (staff: User) => void;
}

const ROLE_BADGE: Record<Role, 'danger' | 'primary' | 'success' | 'neutral'> = {
    MANAGER: 'danger',
    DOCTOR: 'primary',
    ASSISTANT: 'success',
    RECEPTIONIST: 'neutral',
};

export const StaffTable: React.FC<StaffTableProps> = ({ staff, onEdit, onDelete, onView }) => {
    if (staff.length === 0) {
        return (
            <EmptyState
                icon={Users}
                title="No staff members found"
                description="Add your first staff member to get started"
            />
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {staff.map((member, i) => {
                const avatar = getAvatarColor(`${member.firstName}${member.lastName}`);
                return (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                    >
                        <Card
                            className="group flex h-full cursor-pointer flex-col p-5 transition-shadow hover:shadow-md"
                            onClick={() => onView(member)}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold ${avatar.bg} ${avatar.text}`}>
                                    {member.firstName[0]}
                                    {member.lastName[0]}
                                </div>
                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(member); }}
                                        className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(member); }}
                                        className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3">
                                <h3 className="truncate text-sm font-semibold text-surface-900">
                                    {member.firstName} {member.lastName}
                                </h3>
                                <p className="truncate text-xs text-surface-400">@{member.username}</p>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                <Badge variant={ROLE_BADGE[member.role]}>{member.role}</Badge>
                                {member.doctorProfile?.specialization && (
                                    <Badge variant="info">{member.doctorProfile.specialization}</Badge>
                                )}
                            </div>

                            <div className="mt-4 space-y-1.5 border-t border-surface-100 pt-3 text-xs text-surface-500">
                                <div className="flex items-center gap-2 truncate">
                                    <Mail className="h-3.5 w-3.5 shrink-0 text-surface-400" />
                                    <span className="truncate">{member.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 shrink-0 text-surface-400" />
                                    <span>{member.phone || 'Not set'}</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
};
