import { useEffect, useState } from 'react';
import { StatsCard } from '../components/dashboard/StatsCard';
import { AppointmentTable } from '../components/dashboard/AppointmentTable';
import { PatientCard } from '../components/dashboard/PatientCard';
import DonutChart from '../components/dashboard/DonutChart';
import { Calendar, Users } from 'lucide-react';
import { getPatients } from '../services/patient.service';
import type { Patient as PatientType } from '../types/patient';

interface DashboardPageProps {
    token?: string;
}

export function DashboardPage({ token }: DashboardPageProps) {
    const [recentPatients, setRecentPatients] = useState<Partial<PatientType>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res: any = await getPatients(token);
                // normalize response: support array or { data }
                const list = Array.isArray(res) ? res : res?.data ?? [];
                // take latest 5 (backend may not be ordered, but try)
                setRecentPatients(list.slice(0, 5));
            } catch (err: any) {
                setError(err?.message || 'Failed to load patients');
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [token]);

    // static chart data adapted from the uncompleted dashboard
    const treatmentData = [
        { label: 'Checkups', percentage: 35, color: '#2563eb' },
        { label: 'Fillings', percentage: 20, color: '#3b82f6' },
        { label: 'Cleaning', percentage: 25, color: '#60a5fa' },
        { label: 'Root Canal', percentage: 12, color: '#93c5fd' },
        { label: 'Others', percentage: 8, color: '#dbeafe' },
    ];

    const genderData = [
        { label: 'Female', percentage: 58, color: '#ec4899' },
        { label: 'Male', percentage: 42, color: '#2563eb' },
    ];

    return (
        <div className="p-8">
            {/* Keep 'under development' notification */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-700">Dashboard</h2>
                        <p className="text-gray-500">This page is under development</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <StatsCard icon={<Calendar className="text-blue-600" size={24} />} value="5" label="Today's Appointments" />
                <StatsCard icon={<Users className="text-blue-600" size={24} />} value="2,543" label="Total Patients" />
            </div>

            {/* Appointment Table (static placeholder) */}
            <div className="mb-8">
                <AppointmentTable />
            </div>

            {/* Recently Added Patients */}
            <div className="mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Recently Added Patients</h3>

                    {loading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : error ? (
                        <p className="text-red-600">{error}</p>
                    ) : (
                        <div className="space-y-3">
                            {recentPatients.length === 0 ? (
                                <p className="text-gray-500">No patients yet</p>
                            ) : (
                                recentPatients.map((p, i) => (
                                                        <PatientCard
                                                            key={p.id ?? i}
                                                            patient={{
                                                                id: p.id,
                                                                name: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Unknown',
                                                                phone: p.phone ?? undefined,
                                                            }}
                                                        />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Treatment Distribution</h3>
                    <DonutChart data={treatmentData} />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Patient Gender Distribution</h3>
                    <DonutChart data={genderData} />
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
