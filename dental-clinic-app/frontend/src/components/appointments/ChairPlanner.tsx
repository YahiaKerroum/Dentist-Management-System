import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronsUpDown, ZoomIn, ZoomOut } from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { Room } from '../../types/room';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { Calendar as CalendarIcon } from 'lucide-react';
import { ConfirmationDialog } from './Dialogs';

const OPEN_HOUR = 8;
const CLOSE_HOUR = 20;
const SLOT_MINUTES = 15;
const TOTAL_MINUTES = (CLOSE_HOUR - OPEN_HOUR) * 60;
const COLUMN_COUNT = TOTAL_MINUTES / SLOT_MINUTES;
const LABEL_WIDTH = 144;
const MIN_COLUMN_WIDTH = 16;
const MAX_COLUMN_WIDTH = 90;
const DEFAULT_COLUMN_WIDTH = 32;

const STATUS_STYLE: Record<AppointmentStatus, { label: string; variant: 'info' | 'warning' | 'success' | 'danger' | 'neutral'; bg: string; border: string }> = {
    [AppointmentStatus.SCHEDULED]: { label: 'Scheduled', variant: 'info', bg: 'bg-info-50', border: 'border-info-100' },
    [AppointmentStatus.CHECKED_IN]: { label: 'Waiting', variant: 'warning', bg: 'bg-warning-50', border: 'border-warning-100' },
    [AppointmentStatus.IN_PROGRESS]: { label: 'In Treatment', variant: 'warning', bg: 'bg-warning-50', border: 'border-warning-100' },
    [AppointmentStatus.COMPLETED]: { label: 'Completed', variant: 'success', bg: 'bg-success-50', border: 'border-success-100' },
    [AppointmentStatus.CANCELLED]: { label: 'Cancelled', variant: 'danger', bg: 'bg-danger-50', border: 'border-danger-100' },
    [AppointmentStatus.NO_SHOW]: { label: 'No-show', variant: 'neutral', bg: 'bg-surface-100', border: 'border-surface-200' },
};

function minutesFromOpen(dateStr: string): number {
    const d = new Date(dateStr);
    const minutes = (d.getHours() - OPEN_HOUR) * 60 + d.getMinutes();
    return Math.min(Math.max(minutes, 0), TOTAL_MINUTES);
}

function columnRange(appointment: Appointment): { start: number; span: number } {
    const start = Math.floor(minutesFromOpen(appointment.dateOfTreatment) / SLOT_MINUTES) + 1;
    const span = Math.max(2, Math.round(appointment.durationMinutes / SLOT_MINUTES));
    return { start, span: Math.min(span, COLUMN_COUNT - start + 1) };
}

function timeLabel(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const formatTreatmentType = (type: string | null) =>
    type ? type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'General visit';

interface ChairPlannerProps {
    date: Date;
    rooms: Room[];
    appointments: Appointment[];
    selectedAppointmentId: string | null;
    onAppointmentClick: (appointment: Appointment) => void;
    onMoveAppointment: (appointmentId: string, newDateOfTreatment: string, roomId: string | null) => void | Promise<void>;
}

interface RowProps {
    roomId: string | null;
    label: string;
    appointments: Appointment[];
    selectedAppointmentId: string | null;
    columnWidth: number;
    expanded: boolean;
    onToggleExpand: () => void;
    onAppointmentClick: (appointment: Appointment) => void;
    onDropAppointment: (appointmentId: string, roomId: string | null, minutesFromOpen: number) => void;
}

function PlannerRow({
    roomId,
    label,
    appointments,
    selectedAppointmentId,
    columnWidth,
    expanded,
    onToggleExpand,
    onAppointmentClick,
    onDropAppointment,
}: RowProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const rowHeight = expanded ? 96 : 64;
    const cardHeight = expanded ? 'h-24' : 'h-14';

    return (
        <div className="flex border-b border-surface-100 last:border-b-0">
            <button
                onClick={onToggleExpand}
                className="flex w-36 shrink-0 items-center justify-between gap-1 border-r border-surface-100 bg-surface-50 px-3 py-3 text-left hover:bg-surface-100"
                title="Click to expand/collapse this row"
            >
                <p className="truncate text-sm font-medium text-surface-700">{label}</p>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-surface-400" />
            </button>
            <div
                className={`relative flex-1 items-center py-2 transition-colors ${isDragOver ? 'bg-primary-50' : ''}`}
                style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMN_COUNT}, ${columnWidth}px)`, gridAutoRows: `${rowHeight}px`, minHeight: `${rowHeight}px` }}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const appointmentId = e.dataTransfer.getData('text/plain');
                    if (!appointmentId) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const xOffset = e.clientX - rect.left;
                    const rawMinutes = (xOffset / columnWidth) * SLOT_MINUTES;
                    const snapped = Math.round(rawMinutes / SLOT_MINUTES) * SLOT_MINUTES;
                    const clamped = Math.min(Math.max(snapped, 0), TOTAL_MINUTES - SLOT_MINUTES);
                    onDropAppointment(appointmentId, roomId, clamped);
                }}
            >
                {appointments.map((appt) => {
                    const { start, span } = columnRange(appt);
                    const style = STATUS_STYLE[appt.status];
                    const isSelected = appt.id === selectedAppointmentId;
                    return (
                        <button
                            key={appt.id}
                            draggable
                            onDragStart={(e) => {
                                if (!e.shiftKey) {
                                    e.preventDefault();
                                    return;
                                }
                                e.dataTransfer.setData('text/plain', appt.id);
                                e.dataTransfer.effectAllowed = 'move';
                            }}
                            onClick={() => onAppointmentClick(appt)}
                            title="Hold Shift and drag to reschedule"
                            style={{ gridColumn: `${start} / span ${span}`, gridRow: 1 }}
                            className={`mx-0.5 flex ${cardHeight} cursor-pointer flex-col justify-center overflow-hidden rounded-md border px-2 py-1 text-left transition-shadow hover:shadow-sm hover:z-10 active:cursor-grabbing ${style.bg} ${style.border} ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
                        >
                            <p className="truncate text-xs font-semibold text-surface-800">{appt.patient ? `${appt.patient.firstName} ${appt.patient.lastName}` : 'Unknown patient'}</p>
                            <p className="truncate text-[11px] text-surface-500">
                                {timeLabel(appt.dateOfTreatment)} &middot; {formatTreatmentType(appt.typeOfTreatment)}
                            </p>
                            {expanded && appt.doctor && (
                                <p className="truncate text-[11px] text-surface-400">Dr. {appt.doctor.user.firstName} {appt.doctor.user.lastName}</p>
                            )}
                            <div className="mt-0.5 flex items-center gap-1">
                                <Badge variant={style.variant} className="px-1.5 py-0 text-[10px]">
                                    {style.label}
                                </Badge>
                                {appt.followUpRequired && <AlertCircle className="h-3 w-3 shrink-0 text-warning-600" />}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

interface PendingMove {
    appointmentId: string;
    patientName: string;
    fromLabel: string;
    toLabel: string;
    newDateISO: string;
    roomId: string | null;
}

export function ChairPlanner({ date, rooms, appointments, selectedAppointmentId, onAppointmentClick, onMoveAppointment }: ChairPlannerProps) {
    const [columnWidth, setColumnWidth] = useState(DEFAULT_COLUMN_WIDTH);
    const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
    const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
    const [isMoving, setIsMoving] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

    useEffect(() => {
        if (!isResizing) return;
        const onMouseMove = (e: MouseEvent) => {
            if (!resizeRef.current) return;
            const delta = e.clientX - resizeRef.current.startX;
            const next = Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, resizeRef.current.startWidth + delta / 4));
            setColumnWidth(Math.round(next));
        };
        const onMouseUp = () => setIsResizing(false);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isResizing]);

    const startResize = (e: React.MouseEvent) => {
        e.preventDefault();
        resizeRef.current = { startX: e.clientX, startWidth: columnWidth };
        setIsResizing(true);
    };

    const unassigned = appointments.filter((a) => !a.roomId);

    const toggleExpand = (key: string) => {
        setExpandedRooms((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const proposeMove = (appointmentId: string, roomId: string | null, minutes: number) => {
        const appt = appointments.find((a) => a.id === appointmentId);
        if (!appt) return;

        const newDate = new Date(date);
        newDate.setHours(OPEN_HOUR, 0, 0, 0);
        newDate.setMinutes(newDate.getMinutes() + minutes);

        const fromRoomName = appt.room?.name ?? 'Unassigned';
        const toRoomName = roomId ? rooms.find((r) => r.id === roomId)?.name ?? 'Unassigned' : 'Unassigned';
        const fromTime = timeLabel(appt.dateOfTreatment);
        const toTime = newDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        const sameRoom = fromRoomName === toRoomName;
        const sameTime = Math.abs(new Date(appt.dateOfTreatment).getTime() - newDate.getTime()) < 60000;
        if (sameRoom && sameTime) return;

        setPendingMove({
            appointmentId,
            patientName: appt.patient ? `${appt.patient.firstName} ${appt.patient.lastName}` : 'this patient',
            fromLabel: `${fromTime} · ${fromRoomName}`,
            toLabel: `${toTime} · ${toRoomName}`,
            newDateISO: newDate.toISOString(),
            roomId,
        });
    };

    const confirmMove = async () => {
        if (!pendingMove) return;
        setIsMoving(true);
        try {
            await onMoveAppointment(pendingMove.appointmentId, pendingMove.newDateISO, pendingMove.roomId);
        } finally {
            setIsMoving(false);
            setPendingMove(null);
        }
    };

    if (appointments.length === 0) {
        return <EmptyState icon={CalendarIcon} title="No appointments this day" description="Create one to fill the schedule." />;
    }

    const hourTicks = Array.from({ length: CLOSE_HOUR - OPEN_HOUR + 1 }, (_, i) => OPEN_HOUR + i);
    const gridWidth = COLUMN_COUNT * columnWidth;

    return (
        <div className="rounded-lg border border-surface-200 bg-white">
            <div className="flex items-center justify-between border-b border-surface-100 px-4 py-2">
                <p className="text-xs text-surface-400">Hold <span className="font-semibold text-surface-500">Shift</span> and drag a card to reschedule it. Drag the hour markers to zoom.</p>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setColumnWidth((w) => Math.max(MIN_COLUMN_WIDTH, w - 8))}
                        disabled={columnWidth <= MIN_COLUMN_WIDTH}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-surface-300 text-surface-500 hover:bg-surface-100 disabled:opacity-40"
                    >
                        <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => setColumnWidth((w) => Math.min(MAX_COLUMN_WIDTH, w + 8))}
                        disabled={columnWidth >= MAX_COLUMN_WIDTH}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-surface-300 text-surface-500 hover:bg-surface-100 disabled:opacity-40"
                    >
                        <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <div style={{ width: `${LABEL_WIDTH + gridWidth}px` }}>
                    {/* Time header */}
                    <div className="flex border-b border-surface-200">
                        <div className="shrink-0 border-r border-surface-100" style={{ width: `${LABEL_WIDTH}px` }} />
                        <div className="relative" style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMN_COUNT}, ${columnWidth}px)` }}>
                            {hourTicks.map((hour) => {
                                const col = Math.floor(((hour - OPEN_HOUR) * 60) / SLOT_MINUTES) + 1;
                                return (
                                    <div
                                        key={hour}
                                        style={{ gridColumn: `${col} / span 4` }}
                                        className="relative border-l border-surface-100 px-1 py-2 text-xs font-medium text-surface-400"
                                    >
                                        {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                                        <div
                                            onMouseDown={startResize}
                                            title="Drag to zoom the timeline"
                                            className="absolute -left-1.5 top-0 z-10 h-full w-3 cursor-col-resize hover:bg-primary-300/40"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Room rows */}
                    {rooms.map((room) => (
                        <PlannerRow
                            key={room.id}
                            roomId={room.id}
                            label={room.name}
                            appointments={appointments.filter((a) => a.roomId === room.id)}
                            selectedAppointmentId={selectedAppointmentId}
                            columnWidth={columnWidth}
                            expanded={expandedRooms.has(room.id)}
                            onToggleExpand={() => toggleExpand(room.id)}
                            onAppointmentClick={onAppointmentClick}
                            onDropAppointment={proposeMove}
                        />
                    ))}

                    {unassigned.length > 0 && (
                        <PlannerRow
                            roomId={null}
                            label="Unassigned"
                            appointments={unassigned}
                            selectedAppointmentId={selectedAppointmentId}
                            columnWidth={columnWidth}
                            expanded={expandedRooms.has('unassigned')}
                            onToggleExpand={() => toggleExpand('unassigned')}
                            onAppointmentClick={onAppointmentClick}
                            onDropAppointment={proposeMove}
                        />
                    )}
                </div>
            </div>

            <ConfirmationDialog
                isOpen={!!pendingMove}
                title="Reschedule appointment?"
                message={
                    pendingMove
                        ? `Move ${pendingMove.patientName} from ${pendingMove.fromLabel} to ${pendingMove.toLabel}?`
                        : ''
                }
                confirmText="Reschedule"
                cancelText="Cancel"
                onConfirm={confirmMove}
                onCancel={() => setPendingMove(null)}
                isLoading={isMoving}
            />
        </div>
    );
}
