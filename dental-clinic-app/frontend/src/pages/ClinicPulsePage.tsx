import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    AlertTriangle,
    UserX,
    Wallet,
    DollarSign,
    Stethoscope,
    Users,
    Clock,
    Activity,
    BellRing,
    ReceiptText,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getClinicPulse } from '../services/report.service';
import type { ClinicPulseData, ClinicPulseScheduleItem, ClinicPulseRoomStatus } from '../types/report.types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { riseIn, staggerContainer } from '../lib/motion';

const currency = (n: number) => `$${Math.round(n).toLocaleString()}`;

const timeLabel = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const minutesUntil = (iso?: string | null) => {
    if (!iso) return null;
    return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000));
};

const formatTreatmentType = (type: string | null) =>
    type ? type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'General visit';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

const capitalize = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

const STATUS_STYLE: Record<ClinicPulseScheduleItem['status'], { label: string; variant: 'info' | 'warning' | 'success' | 'danger' | 'neutral'; bar: string }> = {
    SCHEDULED: { label: 'Scheduled', variant: 'info', bar: 'bg-info-500' },
    CHECKED_IN: { label: 'Waiting', variant: 'warning', bar: 'bg-warning-500' },
    IN_PROGRESS: { label: 'In Treatment', variant: 'warning', bar: 'bg-warning-500' },
    COMPLETED: { label: 'Completed', variant: 'success', bar: 'bg-success-500' },
    CANCELLED: { label: 'Cancelled', variant: 'danger', bar: 'bg-danger-500' },
    NO_SHOW: { label: 'No-show', variant: 'neutral', bar: 'bg-surface-300' },
};

/** Decorative brand motif reinforcing "Pulse" — not a data chart. */
function PulseLine() {
    return (
        <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full opacity-[0.18]"
            viewBox="0 0 800 100"
            preserveAspectRatio="none"
            fill="none"
        >
            <motion.path
                d="M0,55 H95 L112,20 L130,85 L148,55 H300 L317,12 L335,90 L353,55 H500 L517,28 L535,78 L553,55 H800"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 6 }}
            />
        </svg>
    );
}

function HeroFigure({ value, label, format, delta }: { value: number; label: string; format?: (n: number) => string; delta?: { direction: 'up' | 'down'; positive: boolean; text: string } | null }) {
    return (
        <div>
            <p className="font-display text-3xl font-semibold leading-none tracking-tight text-white tabular-nums">
                <AnimatedNumber value={value} format={format} />
            </p>
            <div className="mt-2 flex items-center gap-1.5">
                <p className="text-xs text-primary-200">{label}</p>
                {delta && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${delta.positive ? 'text-success-100' : 'text-danger-100'}`}>
                        {delta.direction === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {delta.text}
                    </span>
                )}
            </div>
        </div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    format?: (n: number) => string;
    tone?: 'default' | 'warning' | 'danger';
}

function StatCard({ icon, label, value, format, tone = 'default' }: StatCardProps) {
    const barClass = tone === 'warning' ? 'bg-warning-500' : tone === 'danger' ? 'bg-danger-500' : 'bg-primary-300';
    const iconClass = tone === 'warning' ? 'bg-warning-50 text-warning-700' : tone === 'danger' ? 'bg-danger-50 text-danger-700' : 'bg-primary-50 text-primary-700';
    return (
        <Card className="overflow-hidden p-0 transition-shadow duration-200 hover:shadow-md">
            <div className={`h-1 w-full ${barClass}`} />
            <div className="flex items-center gap-3 p-5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClass}`}>{icon}</div>
                <div className="min-w-0">
                    <p className="font-display text-2xl font-semibold tracking-tight text-surface-900 tabular-nums">
                        <AnimatedNumber value={value} format={format} />
                    </p>
                    <p className="text-xs font-medium text-surface-500">{label}</p>
                </div>
            </div>
        </Card>
    );
}

function StatusChip({ icon, value, label, tone = 'default' }: { icon: React.ReactNode; value: string | number; label: string; tone?: 'default' | 'warning' | 'success' }) {
    const toneClass =
        tone === 'warning' ? 'bg-warning-50 text-warning-700' : tone === 'success' ? 'bg-success-50 text-success-700' : 'bg-surface-100 text-surface-700';
    return (
        <div className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 ${toneClass}`}>
            {icon}
            <span className="text-sm font-semibold">{value}</span>
            <span className="text-xs opacity-80">{label}</span>
        </div>
    );
}

function RoomStatusCard({ room }: { room: ClinicPulseRoomStatus }) {
    if (room.status === 'occupied' && room.occupiedSince && room.availableAt) {
        const start = new Date(room.occupiedSince).getTime();
        const end = new Date(room.availableAt).getTime();
        const progress = Math.min(100, Math.max(0, ((Date.now() - start) / Math.max(end - start, 1)) * 100));
        const minsLeft = minutesUntil(room.availableAt);
        return (
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">{room.roomName}</p>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-warning-500" />
                </div>
                <p className="mt-1.5 truncate text-sm font-medium text-surface-800">{room.patientName}</p>
                <p className="truncate text-xs text-surface-500">{room.doctorName}</p>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-warning-100">
                    <div className="h-full rounded-full bg-warning-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1.5 text-xs font-medium text-warning-700">{minsLeft} min left</p>
            </Card>
        );
    }

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">{room.roomName}</p>
                <span className="h-2 w-2 shrink-0 rounded-full bg-success-500" />
            </div>
            <p className="mt-1.5 text-sm font-medium text-success-700">Available now</p>
            {room.nextAppointmentAt ? (
                <p className="text-xs text-surface-500">Next at {timeLabel(room.nextAppointmentAt)}</p>
            ) : (
                <p className="text-xs text-surface-400">No more appointments today</p>
            )}
        </Card>
    );
}

function ScheduleRow({ item }: { item: ClinicPulseScheduleItem }) {
    const style = STATUS_STYLE[item.status];
    return (
        <div
            className={`flex items-stretch gap-0 overflow-hidden rounded-md border ${item.isDelayed ? 'border-warning-100 bg-warning-50' : 'border-surface-100 bg-white'
                }`}
        >
            <div className={`w-1 shrink-0 ${style.bar}`} />
            <div className="flex flex-1 items-center gap-4 px-4 py-3">
                <div className="w-16 shrink-0 text-sm font-semibold text-surface-700">{timeLabel(item.time)}</div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-surface-800">{item.patientName}</p>
                    <p className="truncate text-xs text-surface-500">
                        {item.doctorName} &middot; {formatTreatmentType(item.treatmentType)}
                        {item.roomName ? ` · ${item.roomName}` : ''}
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {item.isDelayed && <Badge variant="warning">Delayed</Badge>}
                    <Badge variant={style.variant}>{style.label}</Badge>
                </div>
            </div>
        </div>
    );
}

export function ClinicPulsePage() {
    const { token, user } = useAuth();
    const [data, setData] = useState<ClinicPulseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        getClinicPulse(token)
            .then((res) => {
                if (!cancelled) setData(res.data);
            })
            .catch((err) => {
                if (!cancelled) setError(err?.message || 'Failed to load clinic pulse');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [token]);

    if (loading) {
        return (
            <div className="space-y-6 p-8">
                <Skeleton className="h-32" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-28" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8">
                <Card className="border-danger-100 bg-danger-50 p-6">
                    <p className="mb-4 text-sm text-danger-700">{error || 'No data available'}</p>
                    <Button variant="destructive" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </Card>
            </div>
        );
    }

    const { summary, schedule, actionRequired, patientBalances, roomStatus, doctorWorkload } = data;

    const revenueDelta = (() => {
        if (summary.revenueYesterday <= 0) return null;
        const pct = Math.round(((summary.revenueToday - summary.revenueYesterday) / summary.revenueYesterday) * 100);
        if (pct === 0) return null;
        return {
            direction: (pct > 0 ? 'up' : 'down') as 'up' | 'down',
            positive: pct > 0,
            text: `${Math.abs(pct)}% vs yesterday`,
        };
    })();

    return (
        <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="show" className="space-y-6 p-8">
            {/* Hero header */}
            <motion.div
                variants={riseIn}
                className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 px-8 py-7 shadow-md"
            >
                <PulseLine />
                <div className="relative flex flex-wrap items-end justify-between gap-8">
                    <div>
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-200">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-300 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-300" />
                            </span>
                            Clinic Pulse — Live
                        </p>
                        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-white">
                            {getGreeting()}, {capitalize(user?.username)}
                        </h1>
                        <p className="mt-1 text-sm text-primary-200">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-8">
                        <HeroFigure value={summary.totalToday} label="appointments today" />
                        <HeroFigure value={summary.revenueToday} format={currency} label="collected today" delta={revenueDelta} />
                        <HeroFigure value={summary.waiting + summary.inTreatment} label="patients in clinic now" />
                    </div>
                </div>
            </motion.div>

            {/* Clinic Status Strip */}
            <motion.div variants={riseIn} className="flex flex-wrap items-center gap-2">
                <StatusChip icon={<Users className="h-4 w-4" />} value={summary.totalToday} label="appointments today" />
                <StatusChip icon={<Clock className="h-4 w-4" />} value={summary.waiting} label="waiting" tone={summary.waiting > 0 ? 'warning' : 'default'} />
                <StatusChip icon={<Activity className="h-4 w-4" />} value={summary.inTreatment} label="in treatment" tone={summary.inTreatment > 0 ? 'warning' : 'default'} />
                <StatusChip icon={<Wallet className="h-4 w-4" />} value={currency(summary.revenueToday)} label="collected today" tone="success" />
                <StatusChip icon={<BellRing className="h-4 w-4" />} value={summary.followUpsDueCount} label="follow-ups due" tone={summary.followUpsDueCount > 0 ? 'warning' : 'default'} />
                <StatusChip
                    icon={<ReceiptText className="h-4 w-4" />}
                    value={summary.expensesAwaitingApproval}
                    label="expenses awaiting approval"
                    tone={summary.expensesAwaitingApproval > 0 ? 'warning' : 'default'}
                />
            </motion.div>

            {/* Chair / Room status */}
            <motion.div variants={riseIn} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {roomStatus.map((room) => (
                    <RoomStatusCard key={room.roomId} room={room} />
                ))}
            </motion.div>

            {/* Top operational summary cards */}
            <motion.div variants={riseIn} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard icon={<CheckCircle2 size={18} />} label="Completed today" value={summary.completed} />
                <StatCard
                    icon={<AlertTriangle size={18} />}
                    label="Delayed"
                    value={summary.delayed}
                    tone={summary.delayed > 0 ? 'warning' : 'default'}
                />
                <StatCard icon={<UserX size={18} />} label="No-shows today" value={summary.noShow} tone={summary.noShow > 0 ? 'danger' : 'default'} />
                <StatCard icon={<Wallet size={18} />} label="Collected this week" value={summary.revenueThisWeek} format={currency} />
                <StatCard
                    icon={<DollarSign size={18} />}
                    label="Pending balances"
                    value={summary.totalPendingBalance}
                    format={currency}
                    tone={summary.totalPendingBalance > 0 ? 'danger' : 'default'}
                />
                <StatCard
                    icon={<Stethoscope size={18} />}
                    label="Need attention"
                    value={summary.treatmentsNeedingAttentionCount}
                    tone={summary.treatmentsNeedingAttentionCount > 0 ? 'warning' : 'default'}
                />
            </motion.div>

            {/* Schedule + Action Required */}
            <motion.div variants={riseIn} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Today's Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {schedule.length === 0 ? (
                            <EmptyState icon={CheckCircle2} title="No appointments today" description="Enjoy the quiet." />
                        ) : (
                            schedule.map((item) => <ScheduleRow key={item.id} item={item} />)
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Action Required</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-500">
                                Follow-ups due ({summary.followUpsDueCount})
                            </p>
                            {actionRequired.followUpsDue.length === 0 ? (
                                <p className="text-sm text-surface-400">Nothing due.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {actionRequired.followUpsDue.slice(0, 5).map((f) => (
                                        <li key={f.treatmentId} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="min-w-0 truncate text-surface-700">
                                                {f.patientName}{' '}
                                                <span className="text-surface-400">&middot; {formatTreatmentType(f.treatmentType)}</span>
                                            </span>
                                            <Badge variant={f.overdue ? 'danger' : 'warning'}>{f.overdue ? 'Overdue' : 'Due'}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-500">
                                Treatments needing attention ({summary.treatmentsNeedingAttentionCount})
                            </p>
                            {actionRequired.treatmentsNeedingAttention.length === 0 ? (
                                <p className="text-sm text-surface-400">Nothing outstanding.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {actionRequired.treatmentsNeedingAttention.slice(0, 5).map((t) => (
                                        <li key={t.treatmentId} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="min-w-0 truncate text-surface-700">
                                                {t.patientName} <span className="text-surface-400">&middot; {formatTreatmentType(t.treatmentType)}</span>
                                            </span>
                                            <Badge variant="warning">Unfinished</Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex items-center justify-between rounded-md bg-surface-50 px-3 py-2.5">
                            <span className="text-sm text-surface-700">Expenses awaiting approval</span>
                            <Badge variant={summary.expensesAwaitingApproval > 0 ? 'warning' : 'success'}>{summary.expensesAwaitingApproval}</Badge>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Revenue snapshot + treatment activity + recent patient activity */}
            <motion.div variants={riseIn} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-surface-500">Collected today</span>
                            <span className="text-lg font-semibold text-success-700">{currency(summary.revenueToday)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-surface-500">Collected this week</span>
                            <span className="text-lg font-semibold text-surface-900">{currency(summary.revenueThisWeek)}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-surface-100 pt-4">
                            <span className="text-sm text-surface-500">Pending patient balances</span>
                            <span className="text-lg font-semibold text-danger-600">{currency(summary.totalPendingBalance)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Doctor Workload Today</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {doctorWorkload.length === 0 ? (
                            <p className="text-sm text-surface-400">No appointments today.</p>
                        ) : (
                            doctorWorkload.map((d) => (
                                <div key={d.doctorId} className="flex items-center justify-between gap-2 text-sm">
                                    <span className="min-w-0 truncate font-medium text-surface-800">{d.name}</span>
                                    <span className="shrink-0 text-xs text-surface-500">
                                        {d.total} today &middot; {d.waiting} waiting &middot; {d.inTreatment} active &middot; {d.completed} done
                                    </span>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Patient Balances</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {patientBalances.length === 0 ? (
                            <p className="text-sm text-surface-400">No outstanding balances.</p>
                        ) : (
                            patientBalances.slice(0, 6).map((b) => (
                                <div key={b.patientId} className="flex items-center justify-between gap-2 text-sm">
                                    <span className="min-w-0 truncate font-medium text-surface-800">{b.patientName}</span>
                                    <span className="shrink-0 font-semibold text-danger-600">{currency(b.balance)}</span>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}

export default ClinicPulsePage;
