"use client"
import { useState } from "react"
import PatientsTable from "./patients-table"
import SearchBar from "./search-bar"

const patientsData = [
  {
    id: "P-2024-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    dentist: "Dr. Emily Wilson",
    gender: "female",
  },
  {
    id: "P-2024-002",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1 (555) 234-5678",
    dentist: "Dr. John Smith",
    gender: "male",
  },
  {
    id: "P-2024-003",
    name: "Jessica Martinez",
    email: "jessica.m@email.com",
    phone: "+1 (555) 345-6789",
    dentist: "Dr. Emily Wilson",
    gender: "female",
  },
  {
    id: "P-2024-004",
    name: "David Thompson",
    email: "d.thompson@email.com",
    phone: "+1 (555) 456-7890",
    dentist: "Dr. John Smith",
    gender: "male",
  },
  {
    id: "P-2024-005",
    name: "Emily Rodriguez",
    email: "emily.rod@email.com",
    phone: "+1 (555) 567-8901",
    dentist: "Dr. Robert Brown",
    gender: "female",
  },
  {
    id: "P-2024-006",
    name: "James Wilson",
    email: "james.wilson@email.com",
    phone: "+1 (555) 678-9012",
    dentist: "Dr. Emily Wilson",
    gender: "male",
  },
  {
    id: "P-2024-007",
    name: "Sophia Anderson",
    email: "sophia.a@email.com",
    phone: "+1 (555) 789-0123",
    dentist: "Dr. John Smith",
    gender: "female",
  },
  {
    id: "P-2024-008",
    name: "William Taylor",
    email: "w.taylor@email.com",
    phone: "+1 (555) 890-1234",
    dentist: "Dr. Robert Brown",
    gender: "male",
  },
]

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [genderFilter, setGenderFilter] = useState("all")
  const [dentistFilter, setDentistFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name-asc")

  const filteredPatients = patientsData
    .filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGender = genderFilter === "all" || patient.gender === genderFilter
      const matchesDentist = dentistFilter === "all" || patient.dentist === dentistFilter
      return matchesSearch && matchesGender && matchesDentist
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "newest":
          return b.id.localeCompare(a.id)
        case "patient-code":
          return a.id.localeCompare(b.id)
        default:
          return 0
      }
    })

  return (
    <div className="page-content">
      <h1 className="page-title">Patients</h1>

      <div className="content-card">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          genderFilter={genderFilter}
          onGenderChange={setGenderFilter}
          dentistFilter={dentistFilter}
          onDentistChange={setDentistFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <PatientsTable patients={filteredPatients} />
      </div>
    </div>
  )
}
