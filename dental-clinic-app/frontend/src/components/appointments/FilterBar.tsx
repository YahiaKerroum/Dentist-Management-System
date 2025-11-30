import React from 'react';
import { Calendar as CalendarIcon, Settings, Bell } from 'lucide-react';

interface FilterBarProps {
  showHolidays: boolean;
  setShowHolidays: (v: boolean) => void;
  showReminders: boolean;
  setShowReminders: (v: boolean) => void;
  selectedDate: Date;
}

export const FilterBar: React.FC<FilterBarProps> = ({ showHolidays, setShowHolidays, showReminders, setShowReminders, selectedDate }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center gap-2">
          <CalendarIcon />
          <span>{selectedDate.toDateString()}</span>
        </button>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showHolidays} onChange={(e) => setShowHolidays(e.target.checked)} />
            Show holidays
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showReminders} onChange={(e) => setShowReminders(e.target.checked)} />
            Show reminders
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Bell />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Settings />
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
