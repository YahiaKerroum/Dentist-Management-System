import { Calendar, Activity } from 'lucide-react';
import Breadcrumb from '../components/reports/Breadcrumb';
import ReportsStatCard from '../components/reports/ReportsStatCard';

export function ReportsPage() {
    return (
        <div className="p-6">
            <Breadcrumb items={["Dashboard", "Reports"]} />

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-700">Reports</h2>
                        <p className="text-gray-500">This page is under development</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <ReportsStatCard
                    icon={Calendar}
                    iconBgColor="#EEF4FF"
                    iconColor="#3b6fff"
                    title="Upcoming Appointments"
                    value="12"
                    subtitle="Next 7 days"
                />
                <ReportsStatCard
                    icon={Activity}
                    iconBgColor="#ECFDF5"
                    iconColor="#10B981"
                    title="Treatments (Last 30 Days)"
                    value="48"
                    subtitle="Monthly total"
                />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-amber-50 rounded-lg">
                        <Activity size={28} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Analytics Coming Soon</h3>
                        <p className="text-gray-500">Advanced reporting and analytics features will be available here. Track performance metrics, patient trends, and financial reports.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportsPage;
