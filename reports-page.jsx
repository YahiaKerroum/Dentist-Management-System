import { Calendar, Activity } from "lucide-react"
import Breadcrumb from "./breadcrumb"
import StatCard from "./stat-card"

export default function ReportsPage() {
  return (
    <div className="page-content">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={["Dashboard", "Reports"]} />

      <h1 className="page-title">Reports</h1>

      {/* Stats Cards Row */}
      <div className="stats-row">
        <StatCard
          icon={Calendar}
          iconBgColor="#EEF4FF"
          iconColor="#3b6fff"
          title="Upcoming Appointments"
          value="12"
          subtitle="Next 7 days"
        />
        <StatCard
          icon={Activity}
          iconBgColor="#ECFDF5"
          iconColor="#10B981"
          title="Treatments (Last 30 Days)"
          value="48"
          subtitle="Monthly total"
        />
      </div>

      {/* Analytics Coming Soon Section */}
      <div className="content-card analytics-placeholder">
        <div className="analytics-icon">
          <Activity size={32} />
        </div>
        <h2 className="analytics-title">Analytics Coming Soon</h2>
        <p className="analytics-description">
          Advanced reporting and analytics features will be available here. Track performance metrics, patient trends,
          and financial reports.
        </p>
      </div>
    </div>
  )
}
