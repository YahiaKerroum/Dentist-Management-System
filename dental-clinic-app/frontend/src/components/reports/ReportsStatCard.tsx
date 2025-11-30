interface ReportsStatCardProps {
  icon: React.ComponentType<any> | React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  value: string;
  subtitle?: string;
}

export const ReportsStatCard: React.FC<ReportsStatCardProps> = ({ icon, iconBgColor = '#EEF4FF', iconColor = '#2563eb', title, value, subtitle }) => {
  const IconComponent = (icon as any) || null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
      <div className="p-3 rounded-lg" style={{ backgroundColor: iconBgColor, color: iconColor }}>
        {IconComponent && typeof IconComponent !== 'string' ? <IconComponent size={24} /> : IconComponent}
      </div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-xl font-semibold text-gray-800">{value}</div>
        {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
      </div>
    </div>
  );
};

export default ReportsStatCard;
