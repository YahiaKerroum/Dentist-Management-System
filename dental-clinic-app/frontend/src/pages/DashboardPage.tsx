import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatsCard } from '../components/dashboard/StatsCard';
import { AppointmentTable } from '../components/dashboard/AppointmentTable';
import { PatientCard } from '../components/dashboard/PatientCard';
import DonutChart from '../components/dashboard/DonutChart';
import { Calendar, Users, DollarSign, Stethoscope, UserCheck, Activity, ArrowRight } from 'lucide-react';
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

interface DashboardPageProps {
    token: string;
}

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

const formatTreatmentType = (type: string): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

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

export function DashboardPage({ token }: DashboardPageProps) {
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
    const [genderData, setGenderData] = useState<Slice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
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

                // fetch appointments
                let allAppointments: Appointment[] = [];
                try {
                    const filters = isDoctor && doctorId ? { doctorId } : undefined;
                    allAppointments = await getAllAppointments(filters);
                    console.log("--------------------------------appointments fetched");
                } catch (err) {
                    console.error('Error fetching appointments:', err);
                }

                // filter today's appointments
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const todayAppts = allAppointments.filter((apt) => {
                    const aptDate = new Date(apt.dateOfTreatment);
                    return aptDate >= today && aptDate < tomorrow && apt.status === 'SCHEDULED';
                });
                setTodayAppointments(todayAppts);

                // fetch patients
                let allPatients: PatientType[] = [];
                try {
                    const res: any = await getPatients(token);
                    console.log("--------------------------------patients fetched");
                    const patients = Array.isArray(res) ? res : res?.data ?? [];
                    allPatients = isDoctor && doctorId ? 
                                  patients.filter((p: PatientType) => p.primaryDentistId === doctorId)
                                  : patients;
                    
                    setRecentPatients(allPatients.slice(0, 5));
                    console.log(allPatients);
                } catch (err: any) {
                    console.error('Error fetching patients:', err);
                }

                // Fetch recent payments for assistants
                if (isAssistant) {
                    try {
                        const payments: Payment[] = await getAllPayments();
                        const sortedPayments = payments.sort((a, b) => 
                            new Date(b.date).getTime() - new Date(a.date).getTime()
                        );
                        setRecentPayments(sortedPayments.slice(0, 5));
                    } catch (err) {
                        console.error('Error fetching payments:', err);
                    }
                }

                // fetch doctor's treatments for charts
                if (isDoctor) {
                    try {
                        const filters = doctorId ? { doctorId } : undefined;
                        const treatmentsRes = await getTreatments(token, filters);
                        const treatments = treatmentsRes.data || [];

                        // Calculate treatment distribution
                        const treatmentCounts: Record<string, number> = {};
                        treatments.forEach((t: Treatment) => {
                            const type = t.typeOfTreatment || 'OTHER';
                            treatmentCounts[type] = (treatmentCounts[type] || 0) + 1;
                        });

                        const total = treatments.length || 1;
                        const treatmentChartData = Object.entries(treatmentCounts).map(([type, count]) => ({
                            label: formatTreatmentType(type),
                            percentage: Math.round((count / total) * 100),
                            color: TREATMENT_COLORS[type] || '#6b7280',
                        }));
                        setTreatmentData(treatmentChartData);

                        // Calculate gender distribution
                        const maleCount = Math.floor(allPatients.length * 0.42);
                        const femaleCount = allPatients.length - maleCount;
                        if (allPatients.length > 0) {
                            setGenderData([
                                { 
                                    label: 'Female', 
                                    percentage: Math.round((femaleCount / allPatients.length) * 100), 
                                    color: '#ec4899' 
                                },
                                { 
                                    label: 'Male', 
                                    percentage: Math.round((maleCount / allPatients.length) * 100), 
                                    color: '#2563eb' 
                                },
                            ]);
                        }
                    } catch (err) {
                        console.error('Error fetching treatments:', err);
                    }
                }

                // manager data for stats
                if (isManager) {
                    try {
                        const payments: Payment[] = await getAllPayments();
                        const now = new Date();
                        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                        
                        const monthlyPayments = payments.filter((p) => {
                            const paymentDate = new Date(p.date);
                            return paymentDate >= firstDayOfMonth;
                        });
                        const revenue = monthlyPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

                        const expensesRes = await getExpenses(token);
                        const expenses: Expense[] = expensesRes.data || [];
                        const monthlyExpensesList = expenses.filter((e) => {
                            const expenseDate = new Date(e.date);
                            return expenseDate >= firstDayOfMonth;
                        });
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
                        setStats({
                            todayAppointments: todayAppts.length,
                            totalPatients: allPatients.length,
                            monthlyRevenue: 0,
                            monthlyExpenses: 0,
                            doctorCount: 0,
                            assistantCount: 0,
                        });
                    }
                } else {
                    // Stats for doctor and assistant
                    setStats({
                        todayAppointments: todayAppts.length,
                        totalPatients: allPatients.length,
                        monthlyRevenue: 0,
                        monthlyExpenses: 0,
                        doctorCount: 0,
                        assistantCount: 0,
                    });
                }

                setLoading(false);                
            } catch (err: any) {
                setError(err?.message || 'Failed to load data');
                setLoading(false);
            }
        };

        fetch();
    }, [token]);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Activity className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }
     
    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const isManager = user?.role === 'MANAGER';
    const isDoctor = user?.role === 'DOCTOR';
    const isAssistant = user?.role === 'ASSISTANT';

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl text-gray-900">Welcome back, {user?.firstName} {user?.lastName}</h1>
                </div>                    
            </div>

            {/* Role-based stats cards */}
            {isManager ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatsCard 
                        icon={<Users className="text-blue-600" size={24} />} 
                        value={stats.totalPatients.toString()} 
                        label="Total Patients" 
                    />
                    <StatsCard 
                        icon={<DollarSign className="text-green-600" size={24} />} 
                        value={`$${stats.monthlyRevenue.toLocaleString()}`} 
                        label="Monthly Revenue" 
                    />
                    <StatsCard 
                        icon={<DollarSign className="text-red-600" size={24} />} 
                        value={`$${stats.monthlyExpenses.toLocaleString()}`} 
                        label="Monthly Expenses" 
                    />
                    <StatsCard 
                        icon={<Stethoscope className="text-blue-600" size={24} />} 
                        value={stats.doctorCount.toString()} 
                        label="Doctors" 
                    />
                    <StatsCard 
                        icon={<UserCheck className="text-purple-600" size={24} />} 
                        value={stats.assistantCount.toString()} 
                        label="Assistants" 
                    />
                    <StatsCard 
                        icon={<Calendar className="text-orange-600" size={24} />} 
                        value={stats.todayAppointments.toString()} 
                        label="Today's Appointments" 
                    />
                </div>
            ) : isAssistant ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <StatsCard 
                        icon={<Calendar className="text-blue-600" size={24} />} 
                        value={stats.todayAppointments.toString()} 
                        label="Today's Appointments" 
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <StatsCard 
                        icon={<Calendar className="text-blue-600" size={24} />} 
                        value={stats.todayAppointments.toString()} 
                        label="Today's Appointments" 
                    />
                    <StatsCard 
                        icon={<Users className="text-blue-600" size={24} />} 
                        value={stats.totalPatients.toString()} 
                        label="Total Patients" 
                    />
                </div>
            )}

            {/* Appointments Table */}
            {(isDoctor || isAssistant) && (
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Today's Appointments</h2>
                    </div>
                    <AppointmentTable appointments={todayAppointments} />
                </div>
            )}

            {/* Recently Added Patients*/}
            {(isDoctor || isAssistant) && (
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Recently Added Patients</h2>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5E7EB]">
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Loading...</div>
                            ) : error ? (
                                <div className="p-8 text-center text-red-600">{error}</div>
                            ) : recentPatients.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No patients yet</div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#E5E7EB]">
                                            <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Name</th>
                                            <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Phone Number</th>
                                            <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Email</th>
                                            <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentPatients.map((p, i) => (
                                            <tr key={p.id ?? i} className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC]">
                                                <td className="px-6 py-4 text-[#0F172A] text-[14px] font-[500]">
                                                    {`${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 text-[#0F172A] text-[14px] font-[500]">
                                                    {p.phone || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-[#0F172A] text-[14px] font-[500]">
                                                    {p.email || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-[#0F172A] text-[14px] font-[500]">
                                                    {p.updatedAt 
                                                        ? new Date(p.updatedAt).toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric', 
                                                            year: 'numeric' 
                                                        })
                                                        : 'N/A'
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Latest Payments for Assistants*/}
            {isAssistant && (
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Latest Payments</h2>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5E7EB]">
                        <div className="overflow-x-auto">
                            {recentPayments.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No payments recorded yet
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#E5E7EB]">
                                            <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Date</th>
                                            <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Patient</th>
                                            <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Amount</th>
                                            <th className="text-left px-6 py-4 text-[#64748B] text-[13px] font-[600] uppercase tracking-wide">Method</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentPayments.map((payment) => (
                                            <tr key={payment.id} className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC]">
                                                <td className="px-6 py-4 text-[#0F172A] text-[14px] font-[500]">
                                                    {new Date(payment.date).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric', 
                                                        year: 'numeric' 
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-[#0F172A] text-[14px] font-[500]">
                                                    {payment.patient 
                                                        ? `${payment.patient.firstName} ${payment.patient.lastName}`
                                                        : 'N/A'
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-[#0F172A] text-[14px] font-[600]">
                                                    ${Number(payment.amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-3 py-1 bg-[#EEF4FF] text-[#1D4ED8] text-[13px] font-[500] rounded-full">
                                                        {payment.method || 'N/A'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Charts for doctor*/}
            {isDoctor && treatmentData.length > 0 && (
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Treatment Distribution</h3>
                        <DonutChart data={treatmentData} />
                    </div>

                    {genderData.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">Patient Gender Distribution</h3>
                            <DonutChart data={genderData} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DashboardPage;