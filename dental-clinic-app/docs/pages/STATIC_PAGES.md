# Static Pages Documentation

## Overview
These pages are currently **static placeholders** to be completed by team members. They follow the same architecture as the working pages (Login, Profile, Patients).

## Static Pages List

1. **Dashboard** - Overview of clinic statistics
2. **Appointments** - Appointment scheduling and management
3. **Treatments** - Treatment records and procedures
4. **Reports** - Analytics and reporting

---

## Dashboard Page

### Location
`src/pages/DashboardPage.tsx`

### Purpose
Display an overview of clinic operations with key metrics and statistics.

### Suggested Features
- **Statistics Cards**:
  - Total patients
  - Appointments today
  - Pending appointments
  - Revenue this month
  
- **Charts**:
  - Appointments per day (line chart)
  - Treatments by type (pie chart)
  - Revenue trend (bar chart)

- **Recent Activity**:
  - Latest appointments
  - New patients
  - Upcoming appointments

### API Endpoints Needed
```typescript
GET /api/reports/dashboard-stats
GET /api/appointments?date=today
GET /api/patients?recent=true
```

### Suggested Libraries
- **Charts**: recharts or chart.js
- **Date handling**: date-fns

### Example Structure
```tsx
export function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Patients" value="150" />
        <StatCard title="Today's Appointments" value="12" />
        <StatCard title="Pending" value="3" />
        <StatCard title="Revenue" value="$5,420" />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AppointmentsChart />
        <TreatmentsChart />
      </div>
      
      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
```

---

## Appointments Page

### Location
`src/pages/AppointmentsPage.tsx`

### Purpose
Manage patient appointments with scheduling, rescheduling, and cancellation.

### Suggested Features
- **Calendar View**:
  - Weekly calendar (like uncompleted pages example)
  - Daily view
  - Monthly view

- **Appointment List**:
  - Filter by status (confirmed, pending, cancelled)
  - Filter by doctor
  - Search by patient name

- **CRUD Operations**:
  - Create new appointment
  - Edit appointment
  - Cancel appointment
  - Mark as completed

- **Appointment Details**:
  - Patient info
  - Doctor assigned
  - Treatment type
  - Duration
  - Notes

### API Endpoints
```typescript
GET /api/appointments
POST /api/appointments
PUT /api/appointments/:id
DELETE /api/appointments/:id
GET /api/appointments?date=YYYY-MM-DD
```

### Reference
See `uncompleted pages/Dentist Appointment Management Page (1)` for design inspiration.

### Example Structure
```tsx
export function AppointmentsPage({ token }: { token: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <div className="flex gap-2">
          <Button onClick={() => setView('calendar')}>Calendar</Button>
          <Button onClick={() => setView('list')}>List</Button>
          <Button onClick={handleAddAppointment}>
            Add Appointment
          </Button>
        </div>
      </div>
      
      {view === 'calendar' ? (
        <WeeklyCalendar appointments={appointments} />
      ) : (
        <AppointmentList appointments={appointments} />
      )}
    </div>
  );
}
```

---

## Treatments Page

### Location
`src/pages/TreatmentsPage.tsx`

### Purpose
Manage treatment records and procedures performed on patients.

### Suggested Features
- **Treatment List**:
  - All treatments with patient info
  - Filter by treatment type
  - Filter by doctor
  - Filter by date range

- **CRUD Operations**:
  - Create treatment record
  - Edit treatment
  - Delete treatment
  - View treatment details

- **Treatment Details**:
  - Patient name
  - Treatment type
  - Doctor performed
  - Date
  - Cost
  - Notes
  - Tooth number (for dental-specific treatments)

### API Endpoints
```typescript
GET /api/treatments
POST /api/treatments
PUT /api/treatments/:id
DELETE /api/treatments/:id
GET /api/treatments?patientId=:id
```

### Example Structure
```tsx
export function TreatmentsPage({ token }: { token: string }) {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Treatments</h1>
        <Button onClick={handleAddTreatment}>
          Add Treatment
        </Button>
      </div>
      
      <FilterBar />
      
      <Table>
        {/* Treatment table similar to Patients page */}
      </Table>
      
      <Modal isOpen={isModalOpen}>
        <TreatmentForm />
      </Modal>
    </div>
  );
}
```

---

## Reports Page

### Location
`src/pages/ReportsPage.tsx`

### Purpose
Generate and view various reports and analytics.

### Suggested Features
- **Report Types**:
  - Financial reports (revenue, expenses)
  - Patient reports (new patients, demographics)
  - Appointment reports (attendance, cancellations)
  - Treatment reports (most common treatments)

- **Date Range Selection**:
  - Today
  - This week
  - This month
  - Custom range

- **Export Options**:
  - PDF
  - CSV
  - Excel

### API Endpoints
```typescript
GET /api/reports/financial?startDate=&endDate=
GET /api/reports/patients?startDate=&endDate=
GET /api/reports/appointments?startDate=&endDate=
GET /api/reports/treatments?startDate=&endDate=
```

### Example Structure
```tsx
export function ReportsPage({ token }: { token: string }) {
  const [reportType, setReportType] = useState('financial');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Reports</h1>
      
      <div className="flex gap-4 mb-6">
        <Select value={reportType} onChange={setReportType}>
          <option value="financial">Financial</option>
          <option value="patients">Patients</option>
          <option value="appointments">Appointments</option>
          <option value="treatments">Treatments</option>
        </Select>
        
        <DateRangePicker value={dateRange} onChange={setDateRange} />
        
        <Button onClick={handleExport}>Export PDF</Button>
      </div>
      
      <ReportDisplay type={reportType} dateRange={dateRange} />
    </div>
  );
}
```

---

## Implementation Guide for Team Members

### Step 1: Choose a Page
Pick one of the static pages to implement.

### Step 2: Create TypeScript Interfaces
Define interfaces in `src/types/` for your page's data.

Example for Appointments:
```typescript
// src/types/appointment.ts
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
}

export interface CreateAppointmentDTO {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  notes?: string;
}
```

### Step 3: Create API Service
Create service file in `src/services/`.

Example:
```typescript
// src/services/appointment.service.ts
const API_URL = 'http://localhost:3000/api/appointments';

export const getAppointments = async (token: string) => {
  const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const createAppointment = async (
  data: CreateAppointmentDTO,
  token: string
) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// ... other CRUD operations
```

### Step 4: Implement Page Component
Follow the pattern from `PatientsPage.tsx`:
1. Fetch data on mount
2. Display in table or appropriate view
3. Add CRUD operations
4. Handle errors and loading states

### Step 5: Test Thoroughly
- Test all CRUD operations
- Test with different user roles
- Test error scenarios
- Test responsive design

### Step 6: Update Documentation
Document your implementation in this file or create a new detailed doc.

---

## Common Patterns to Follow

### 1. Consistent Layout
```tsx
<div className="p-6">
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-semibold">Page Title</h1>
    <Button>Primary Action</Button>
  </div>
  {/* Page content */}
</div>
```

### 2. Loading States
```tsx
{loading && <div>Loading...</div>}
{error && <div className="text-red-600">{error}</div>}
{!loading && !error && <YourContent />}
```

### 3. Modal Forms
```tsx
<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
  <YourForm onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
</Modal>
```

### 4. Table with Actions
```tsx
<Table>
  <tbody>
    {items.map(item => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>
          <Button onClick={() => handleEdit(item)}>Edit</Button>
          <Button onClick={() => handleDelete(item.id)}>Delete</Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>
```

---

## Resources

- **TEAM_GUIDE.md**: Overall project structure and patterns
- **PATIENTS_PAGE.md**: Complete CRUD implementation example
- **Uncompleted pages**: Design inspiration
- **Backend API docs**: `docs/api.md`

---

## Questions?

If you have questions while implementing your page:
1. Check the TEAM_GUIDE.md
2. Look at working pages (Login, Profile, Patients) for examples
3. Ask in team chat
4. Create a GitHub issue

Good luck! 🚀
