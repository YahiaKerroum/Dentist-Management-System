// Reusable stat card component for displaying metrics
export default function StatCard({ icon: Icon, iconBgColor, iconColor, title, value, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ backgroundColor: iconBgColor, color: iconColor }}>
        <Icon size={24} />
      </div>
      <div className="stat-card-content">
        <h3 className="stat-card-title">{title}</h3>
        <p className="stat-card-value">{value}</p>
        <p className="stat-card-subtitle">{subtitle}</p>
      </div>
    </div>
  )
}
