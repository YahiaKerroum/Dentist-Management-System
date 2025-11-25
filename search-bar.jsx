"use client"
import { Search, SlidersHorizontal } from "lucide-react"

export default function SearchBar({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  genderFilter,
  onGenderChange,
  dentistFilter,
  onDentistChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="search-filter-section">
      <div className="search-bar-container">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or code"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        <button className="filter-button" onClick={onToggleFilters}>
          <SlidersHorizontal size={18} />
          <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
        </button>
      </div>

      {showFilters && (
        <div className="filter-cards-container">
          {/* Gender Filter Card */}
          <div className="filter-card">
            <label className="filter-label">Gender</label>
            <select className="filter-select" value={genderFilter} onChange={(e) => onGenderChange(e.target.value)}>
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Primary Dentist Filter Card */}
          <div className="filter-card">
            <label className="filter-label">Primary Dentist</label>
            <select className="filter-select" value={dentistFilter} onChange={(e) => onDentistChange(e.target.value)}>
              <option value="all">All Dentists</option>
              <option value="Dr. John Smith">Dr. John Smith</option>
              <option value="Dr. Emily Wilson">Dr. Emily Wilson</option>
              <option value="Dr. Robert Brown">Dr. Robert Brown</option>
            </select>
          </div>

          {/* Sort By Filter Card */}
          <div className="filter-card">
            <label className="filter-label">Sort By</label>
            <select className="filter-select" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
              <option value="name-asc">Name (A-Z)</option>
              <option value="newest">Newest First</option>
              <option value="patient-code">Patient Code</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
