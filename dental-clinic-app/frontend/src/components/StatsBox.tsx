/*import styles from './StatsBox.module.css'

// Stats Card Component
const StatsCard: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({
  icon,
  value,
  label,
}) => {
  return (
     <div className={styles.stats_card}>
      <div className={styles.stats__header}>
        <div className={styles.icon_wrapper}> 
          {icon}
        </div>
      </div>
      <h3 className={styles.card__value}>{value}</h3>
      <p className={styles.card__label}>{label}</p>
    </div>
  );
};*/

// Stats Card Component
export const StatsCard: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({
  icon,
  value,
  label,
}) => {
  return (
  <div className="grid grid-cols-1 mx-4">
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
    </div>
  );
};


//usage in the dashboard
/* <div className="grid grid-cols-2 gap-6 mb-8">
            <StatsCard
              icon={<Calendar className="text-blue-600" size={24} />}
              value="5"
              label="Today's Appointments"
            />
            <StatsCard
              icon={<Users className="text-blue-600" size={24} />}
              value="2,543"
              label="Total Patients"
            />
          </div>*/