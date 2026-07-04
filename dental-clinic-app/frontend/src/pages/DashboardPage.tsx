import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatsCard } from '../components/dashboard/StatsCard';
import { AppointmentTable } from '../components/dashboard/AppointmentTable';
import DonutChart from '../components/dashboard/DonutChart';
import { Calendar, Users, DollarSign, Stethoscope, UserCheck } from 'lucide-react';
import { getPatients } from '../services/patient.service';
import { getUserProfile } from '../services/user.service';
import type { Patient as PatientType } from '../types/patient';
import { getAllAppointments } from '../services/appointment.service';
import { getTreatments } from '../services/treatment.service';
import { getAllPayments } from '../services/payment.service';
import { getExpenses } from '../services/expense.service';
import { getAllStaff } from '../services/user.service';
import type { Appointment } from '../types/appointment';
import type { Treatment } from '../types/treatment';
import type { Payment } from '../types/payment.types';
import type { Expense } from '../types/expense.types';
import type { User } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

interface DashboardStats {
    todayAppointments: number;
    totalPatients: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    doctorCount: number;
    assistantCount: number;
}

interface Slice {
    label: string;
    percentage: number;
    color: string;
}

const formatTreatmentType = (type: string): string =>
    type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const TREATMENT_COLORS: Record<string, string> = {
    CONSULTATION: '#2563eb',
    FILLING: '#8b5cf6',
    EXTRACTION: '#ef4444',
    ROOT_CANAL: '#f59e0b',
    CLEANING: '#10b981',
    IMPLANT: '#6366f1',
    ORTHODONTICS: '#ec4899',
    OTHER: '#6b7280',
};

export function DashboardPage() {
    const { token } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        todayAppointments: 0,
        totalPatients: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        doctorCount: 0,
        assistantCount: 0,
    });
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [recentPatients, setRecentPatients] = useState<Partial<PatientType>[]>([]);
    const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
    const [treatmentData, setTreatmentData] = useState<Slice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const userResponse = await getUserProfile(token);
                const currentUser = userResponse.data;
                setUser(currentUser);

                const isDoctor = currentUser.role === 'DOCTOR';
                const isManager = currentUser.role === 'MANAGER';
                const isAssistant = currentUser.role === 'ASSISTANT';
                const doctorId = currentUser.doctorProfile?.id;

                let allAppointments: Appointment[] = [];
                try {
                    const filters = isDoctor && doctorId ? { doctorId } : undefined;
                    allAppointments = await getAllAppointments(filters);
                } catch (err) {
                    console.error('Error fetching appointments:', err);
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const todayAppts = allAppointments.filter((apt) => {
                    const aptDate = new Date(apt.dateOfTreatment);
                    return aptDate >= today && aptDate < tomorrow && apt.status === 'SCHEDULED';
                });
                setTodayAppointments(todayAppts);

                let allPatients: PatientType[] = [];
                try {
                    const res: any = await getPatients(token);
                    const patients = Array.isArray(res) ? res : res?.data ?? [];
                    allPatients = isDoctor && doctorId
                        ? patients.filter((p: PatientType) => p.primaryDentistId === doctorId)
                        : patients;
                    setRecentPatients(allPatients.slice(0, 5));
                } catch (err) {
                    console.error('Error fetching patients:', err);
                }

                if (isAssistant) {
                    try {
                        const payments: Payment[] = await getAllPayments();
                        const sorted = payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        setRecentPayments(sorted.slice(0, 5));
                    } catch (err) {
                        console.error('Error fetching payments:', err);
                    }
                }

                if (isDoctor) {
                    try {
                        const filters = doctorId ? { doctorId } : undefined;
                        const treatmentsRes = await getTreatments(token, filters);
                        const treatments = treatmentsRes.data || [];

                        const treatmentCounts: Record<string, number> = {};
                        treatments.forEach((t: Treatment) => {
                            const type = t.typeOfTreatment || 'OTHER';
                            treatmentCounts[type] = (treatmentCounts[type] || 0) + 1;
                        });

                        const total = treatments.length || 1;
                        setTreatmentData(
                            Object.entries(treatmentCounts).map(([type, count]) => ({
                                label: formatTreatmentType(type),
                                percentage: Math.round((count / total) * 100),
                                color: TREATMENT_COLORS[type] || '#6b7280',
                            }))
                        );
                    } catch (err) {
                        console.error('Error fetching treatments:', err);
                    }
                }

                if (isManager) {
                    try {
                        const payments: Payment[] = await getAllPayments();
                        const now = new Date();
                        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                        const monthlyPayments = payments.filter((p) => new Date(p.date) >= firstDayOfMonth);
                        const revenue = monthlyPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

                        const expensesRes = await getExpenses(token);
                        const expenses: Expense[] = expensesRes.data || [];
                        const monthlyExpensesList = expenses.filter((e) => new Date(e.date) >= firstDayOfMonth);
                        const totalExpenses = monthlyExpensesList.reduce((sum, e) => sum + Number(e.amount || 0), 0);

                        const staffRes = await getAllStaff(token);
                        const staff: User[] = staffRes.data || [];
                        const doctors = staff.filter((s) => s.role === 'DOCTOR');
                        const assistants = staff.filter((s) => s.role === 'ASSISTANT');

                        setStats({
                            todayAppointments: todayAppts.length,
                            totalPatients: allPatients.length,
                            monthlyRevenue: revenue,
                            monthlyExpenses: totalExpenses,
                            doctorCount: doctors.length,
                            assistantCount: assistants.length,
                        });
                    } catch (err) {
                        console.error('Error fetching manager stats:', err);
                        setStats((s) => ({ ...s, todayAppointments: todayAppts.length, totalPatients: allPatients.length }));
                    }
                } else {
                    setStats((s) => ({ ...s, todayAppointments: todayAppts.length, totalPatients: allPatients.length }));
                }

                setLoading(false);
            } catch (err: any) {
                setError(err?.message || 'Failed to load data');
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [token]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-28" />
                ))}
                <Skeleton className="col-span-full h-64" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <Card className="border-danger-100 bg-danger-50 p-6">
                    <p className="mb-4 text-sm text-danger-700">{error}</p>
                    <Button variant="destructive" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </Card>
            </div>
        );
    }

    const isManager = user?.role === 'MANAGER';
    const isDoctor = user?.role === 'DOCTOR';
    const isAssistant = user?.role === 'ASSISTANT';

    return (
        <div className="p-8">
            <motion.h1
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-xl font-semibold text-surface-900"
            >
                Welcome back, {user?.firstName} {user?.lastName}
            </motion.h1>

            {isManager ? (
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <StatsCard icon={<Users className="text-primary-600" size={20} />} value={stats.totalPatients.toString()} label="Total Patients" />
                    <StatsCard icon={<DollarSign className="text-success-600" size={20} />} value={`$${stats.monthlyRevenue.toLocaleString()}`} label="Monthly Revenue" />
                    <StatsCard icon={<DollarSign className="text-danger-600" size={20} />} value={`$${stats.monthlyExpenses.toLocaleString()}`} label="Monthly Expenses" />
                    <StatsCard icon={<Stethoscope className="text-primary-600" size={20} />} value={stats.doctorCount.toString()} label="Doctors" />
                    <StatsCard icon={<UserCheck className="text-info-600" size={20} />} value={stats.assistantCount.toString()} label="Assistants" />
                    <StatsCard icon={<Calendar className="text-warning-600" size={20} />} value={stats.todayAppointments.toString()} label="Today's Appointments" />
                </div>
            ) : isAssistant ? (
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StatsCard icon={<Calendar className="text-primary-600" size={20} />} value={stats.todayAppointments.toString()} label="Today's Appointments" />
                </div>
            ) : (
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StatsCard icon={<Calendar className="text-primary-600" size={20} />} value={stats.todayAppointments.toString()} label="Today's Appointments" />
                    <StatsCard icon={<Users className="text-primary-600" size={20} />} value={stats.totalPatients.toString()} label="Total Patients" />
                </div>
            )}

            {(isDoctor || isAssistant) && (
                <div className="mb-8">
                    <h2 className="mb-4 text-base font-semibold text-surface-800">Today's Appointments</h2>
                    <AppointmentTable appointments={todayAppointments} />
                </div>
            )}

            {(isDoctor || isAssistant) && (
                <div className="mb-8">
                    <h2 className="mb-4 text-base font-semibold text-surface-800">Recently Added Patients</h2>
                    <Card className="overflow-hidden">
                        {recentPatients.length === 0 ? (
                            <div className="p-8 text-center text-sm text-surface-500">No patients yet</div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-surface-100 bg-surface-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-surface-500">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-surface-500">Phone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-surface-500">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-surface-500">Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100">
                                    {recentPatients.map((p, i) => (
                                        <tr key={p.id ?? i} className="hover:bg-surface-50">
                                            <td className="px-6 py-3.5 text-sm font-medium text-surface-800">
                                                {`${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-surface-600">{p.phone || 'N/A'}</td>
                                            <td className="px-6 py-3.5 text-sm text-surface-600">{p.email || 'N/A'}</td>
                                            <td className="px-6 py-3.5 text-sm text-surface-600">
                                                {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>
                </div>
            )}

            {isAssistant && (
                <div className="mb-8">
                    <h2 className="mb-4 text-base font-semibold text-surface-800">Latest Payments</h2>
                    <Card className="overflow-hidden">
                        {recentPayments.length === 0 ? (
                            <div className="p-8 text-center text-sm text-surface-500">No payments recorded yet</div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-surface-100 bg-surface-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-surface-500">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-surface-500">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-surface-500">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-surface-500">Method</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100">
                                    {recentPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-surface-50">
                                            <td className="px-6 py-3.5 text-sm text-surface-600">
                                                {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-3.5 text-sm font-medium text-surface-800">
                                                {payment.patient ? `${payment.patient.firstName} ${payment.patient.lastName}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-3.5 text-sm font-semibold text-surface-900">${Number(payment.amount).toLocaleString()}</td>
                                            <td className="px-6 py-3.5">
                                                <span className="inline-flex rounded-full bg-info-50 px-2.5 py-0.5 text-xs font-medium text-info-700">
                                                    {payment.method || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>
                </div>
            )}

            {isDoctor && treatmentData.length > 0 && (
                <Card className="p-6">
                    <h3 className="mb-6 text-base font-semibold text-surface-800">Treatment Distribution</h3>
                    <DonutChart data={treatmentData} />
                </Card>
            )}
        </div>
    );
}

export default DashboardPage;
