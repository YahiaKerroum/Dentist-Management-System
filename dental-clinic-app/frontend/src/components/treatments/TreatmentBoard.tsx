import { useState } from 'react';
import { Calendar, User } from 'lucide-react';
import { Treatment, TreatmentStatus, TREATMENT_STATUS_ORDER, TREATMENT_STATUS_CONFIG, TREATMENT_TYPE_CONFIG } from '../../types/treatment';

interface TreatmentBoardProps {
    treatments: Treatment[];
    onDropTreatment: (treatmentId: string, status: TreatmentStatus) => void;
    onSelectTreatment: (treatment: Treatment) => void;
}

function TreatmentCard({ treatment, onClick }: { treatment: Treatment; onClick: () => void }) {
    const typeConfig = TREATMENT_TYPE_CONFIG[treatment.typeOfTreatment];

    return (
        <div
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', treatment.id);
                e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={onClick}
            className="cursor-grab rounded-lg border border-surface-200 bg-white p-3 shadow-xs transition-shadow hover:shadow-md active:cursor-grabbing"
        >
            <div className="mb-2 flex items-center justify-between gap-2">
                <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: typeConfig.bgColor, color: typeConfig.color }}
                >
                    {typeConfig.label}
                </span>
                {treatment.teeth.length > 0 && (
                    <span className="text-[11px] text-surface-400">
                        {treatment.teeth.length} {treatment.teeth.length > 1 ? 'teeth' : 'tooth'}
                    </span>
                )}
            </div>
            <p className="truncate text-sm font-semibold text-surface-900">
                {treatment.patient.firstName} {treatment.patient.lastName}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-surface-500">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">Dr. {treatment.doctor.user.firstName} {treatment.doctor.user.lastName}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-surface-400">
                <Calendar className="h-3 w-3 shrink-0" />
                {new Date(treatment.dateOfTreatment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
        </div>
    );
}

export function TreatmentBoard({ treatments, onDropTreatment, onSelectTreatment }: TreatmentBoardProps) {
    const [dragOverStatus, setDragOverStatus] = useState<TreatmentStatus | null>(null);

    const byStatus = (status: TreatmentStatus) => treatments.filter((t) => t.status === status);

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {TREATMENT_STATUS_ORDER.map((status) => {
                const config = TREATMENT_STATUS_CONFIG[status];
                const columnTreatments = byStatus(status);
                return (
                    <div
                        key={status}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            setDragOverStatus(status);
                        }}
                        onDragLeave={() => setDragOverStatus((prev) => (prev === status ? null : prev))}
                        onDrop={(e) => {
                            e.preventDefault();
                            const treatmentId = e.dataTransfer.getData('text/plain');
                            if (treatmentId) onDropTreatment(treatmentId, status);
                            setDragOverStatus(null);
                        }}
                        className={`flex w-72 shrink-0 flex-col rounded-lg border bg-surface-50 transition-colors ${
                            dragOverStatus === status ? 'border-primary-400 bg-primary-50/40' : 'border-surface-200'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-2 border-b border-surface-200 px-3 py-2.5">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
                                <span className="text-xs font-semibold uppercase tracking-wide text-surface-600">{config.label}</span>
                            </div>
                            <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-semibold text-surface-500">
                                {columnTreatments.length}
                            </span>
                        </div>
                        <div className="flex-1 space-y-2 p-2.5" style={{ minHeight: 120 }}>
                            {columnTreatments.length === 0 ? (
                                <p className="py-6 text-center text-xs text-surface-400">No treatments</p>
                            ) : (
                                columnTreatments.map((treatment) => (
                                    <TreatmentCard key={treatment.id} treatment={treatment} onClick={() => onSelectTreatment(treatment)} />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
