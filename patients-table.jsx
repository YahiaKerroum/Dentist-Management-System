"use client"

export default function PatientsTable({ patients }) {
  return (
    <div className="table-container">
      <table className="patients-table">
        {/* Table Header */}
        <thead>
          <tr>
            <th>Patient Code</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Primary Dentist</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>
                {/* Patient code as a clickable link */}
                <a href="#" className="patient-code-link">
                  {patient.id}
                </a>
              </td>
              <td>{patient.name}</td>
              <td className="email-cell">{patient.email}</td>
              <td>{patient.phone}</td>
              <td>{patient.dentist}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Show message if no patients found */}
      {patients.length === 0 && <div className="no-results">No patients found matching your search.</div>}
    </div>
  )
}
