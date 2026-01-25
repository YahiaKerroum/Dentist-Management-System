# Dental Clinic Management System - Team Development Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Component Architecture](#component-architecture)
4. [Adding New Pages](#adding-new-pages)
5. [Backend API Integration](#backend-api-integration)
6. [TypeScript Interfaces](#typescript-interfaces)
7. [Styling Guidelines](#styling-guidelines)
8. [State Management](#state-management)
9. [Demo Accounts](#demo-accounts)

---

## Project Overview

This is a dental clinic management system with a **shared component architecture**. All pages use the same layout (sidebar + header) and reusable UI components.

### Current Status
- **Working Pages**: Login, Profile, Patients (fully functional with CRUD)
- **Static Placeholders**: Dashboard, Appointments, Treatments, Reports (to be completed by team)

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **Backend**: Node.js + Express + Prisma + PostgreSQL

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/           # Shared layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── Header.tsx
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Table.tsx
│   │   ├── patients/         # Page-specific components
│   │   │   └── PatientForm.tsx
│   │   └── Login.tsx
│   ├── pages/                # Page components
│   │   ├── DashboardPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── PatientsPage.tsx
│   │   ├── AppointmentsPage.tsx
│   │   ├── TreatmentsPage.tsx
│   │   └── ReportsPage.tsx
│   ├── services/             # API service functions
│   │   ├── auth.service.ts
│   │   ├── patient.service.ts
│   │   └── user.service.ts
│   ├── types/                # TypeScript interfaces
│   │   ├── auth.ts
│   │   ├── patient.ts
│   │   └── user.ts
│   ├── App.tsx               # Main app with routing
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
```

---

## Component Architecture

### Shared Layout Pattern

All authenticated pages use the **same layout structure**:

```tsx
<MainLayout>
  <YourPageComponent />
</MainLayout>
```

The `MainLayout` component includes:
- **Sidebar**: Navigation menu (always visible)
- **Header**: Page title and user info
- **Content Area**: Where your page renders

### How It Works

1. User logs in → token stored in localStorage
2. `App.tsx` renders `MainLayout`
3. `MainLayout` manages which page to display based on sidebar navigation
4. Each page is a **component**, not a separate route

**Example from App.tsx:**
```tsx
{token ? (
  <MainLayout token={token} onLogout={handleLogout} />
) : (
  <Login onLoginSuccess={handleLoginSuccess} />
)}
```

**Example from MainLayout.tsx:**
```tsx
const renderPage = () => {
  switch (activePage) {
    case 'dashboard': return <DashboardPage />;
    case 'profile': return <ProfilePage />;
    case 'patients': return <PatientsPage token={token} />;
    // ... other pages
  }
};
```

---

## Adding New Pages

### Step 1: Create Page Component

Create a new file in `src/pages/YourPage.tsx`:

```tsx
export function YourPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Your Page Title</h1>
      {/* Your page content */}
    </div>
  );
}
```

### Step 2: Add to Sidebar Navigation

Edit `src/components/layout/Sidebar.tsx`:

```tsx
const menuItems = [
  // ... existing items
  { icon: YourIcon, label: 'Your Page', page: 'yourpage' },
];
```

### Step 3: Add to MainLayout Routing

Edit `src/components/layout/MainLayout.tsx`:

```tsx
const renderPage = () => {
  switch (activePage) {
    // ... existing cases
    case 'yourpage': return <YourPage />;
  }
};
```

---

## Backend API Integration

### API Base URL
```typescript
const API_URL = 'http://localhost:3000/api';
```

### Service Pattern

All API calls are in `src/services/` files:

```typescript
// src/services/example.service.ts
export const getData = async (token: string): Promise<DataResponse> => {
  const response = await fetch(`${API_URL}/endpoint`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
};
```

### Backend Response Format

All backend responses follow this structure:

```typescript
{
  success: boolean;
  data: T;           // Your actual data
  message?: string;
}
```

### Available Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/login` | POST | Login | No |
| `/api/patients` | GET | Get all patients | Yes |
| `/api/patients` | POST | Create patient | Yes |
| `/api/patients/:id` | GET | Get patient by ID | Yes |
| `/api/patients/:id` | PUT | Update patient | Yes |
| `/api/patients/:id` | DELETE | Delete patient | Yes |
| `/api/users/:id` | GET | Get user profile | Yes |
| `/api/users/:id` | PUT | Update user profile | Yes |

See `docs/api.md` for complete API documentation.

---

## TypeScript Interfaces

### Location
All interfaces are in `src/types/` directory, organized by domain.

### Naming Conventions
- **Entities**: `Patient`, `User`, `Appointment`
- **API Responses**: `PatientResponse`, `UserResponse`
- **DTOs**: `CreatePatientDTO`, `UpdatePatientDTO`

### Example

```typescript
// src/types/patient.ts
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  // ... other fields
}

export interface CreatePatientDTO {
  firstName: string;
  lastName: string;
  email: string;
  // ... required fields only
}

export interface PatientResponse {
  success: boolean;
  data: Patient[];
  message?: string;
}
```

### Why Separate Interfaces?

Frontend interfaces are **separate from backend Prisma types** because:
1. **Security**: Backend may have fields (like passwordHash) that shouldn't reach frontend
2. **Decoupling**: Frontend and backend can evolve independently
3. **API Contract**: Interfaces represent what the API actually sends

---

## Styling Guidelines

### Tailwind CSS

We use Tailwind CSS for all styling. **No inline styles**.

### Color Scheme
- **Primary**: Blue (`bg-blue-600`, `text-blue-600`)
- **Background**: Gray (`bg-gray-50`, `bg-gray-100`)
- **Text**: Gray (`text-gray-600`, `text-gray-900`)
- **Borders**: Gray (`border-gray-200`)

### Common Patterns

**Button (Primary)**
```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click Me
</button>
```

**Input Field**
```tsx
<input 
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
```

**Card Container**
```tsx
<div className="bg-white rounded-lg shadow p-6">
  {/* Content */}
</div>
```

### Responsive Design
Use Tailwind's responsive prefixes:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## State Management

### Current Approach: Local State + Props

We use React's built-in state management:
- **useState**: For component-level state
- **Props**: To pass data between components
- **localStorage**: For token persistence

### Example Pattern

```tsx
function ParentComponent() {
  const [data, setData] = useState<Data[]>([]);
  
  const handleUpdate = (newData: Data) => {
    setData(prev => [...prev, newData]);
  };
  
  return <ChildComponent data={data} onUpdate={handleUpdate} />;
}
```

### Token Management

```typescript
// Store token
localStorage.setItem('token', token);

// Retrieve token
const token = localStorage.getItem('token');

// Remove token (logout)
localStorage.removeItem('token');
```

---

## Demo Accounts

Use these accounts for testing:

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| `manager` | `password123` | MANAGER | Full access (all CRUD operations) |
| `doctor` | `password123` | DOCTOR | View/Edit patients, appointments |
| `assistant` | `password123` | ASSISTANT | View/Create patients, appointments |

### Testing Different Roles

Different roles have different permissions on the backend. Test your pages with all three accounts to ensure proper access control.

---

## Development Workflow

### 1. Start Development Servers

**Backend:**
```bash
cd dental-clinic-app/backend
npm run dev
```

**Frontend:**
```bash
cd dental-clinic-app/frontend
npm run dev
```

### 2. Make Changes

- Edit files in `src/`
- Vite will hot-reload automatically

### 3. Test Your Changes

- Login with demo accounts
- Test all CRUD operations
- Verify responsive design

### 4. Commit Your Work

```bash
git add .
git commit -m "Add: Your feature description"
git push
```

---

## Common Patterns

### Fetching Data on Page Load

```tsx
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await yourService.getData(token);
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  fetchData();
}, [token]);
```

### Form Handling

```tsx
const [formData, setFormData] = useState({ name: '', email: '' });

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // Submit formData to API
};
```

### Modal Pattern

```tsx
const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Open Modal</Button>

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  {/* Modal content */}
</Modal>
```

---

## Getting Help

- **API Documentation**: See `docs/api.md`
- **Page-Specific Docs**: See `docs/pages/`
- **Questions**: Ask in team chat or create GitHub issue

---

## Next Steps for Team Members

1. **Review this guide** thoroughly
2. **Read page-specific documentation** for pages you'll work on
3. **Test the working pages** (Login, Profile, Patients) to understand the patterns
4. **Pick a static page** to complete (Dashboard, Appointments, Treatments, or Reports)
5. **Follow the "Adding New Pages" section** to implement your page
6. **Communicate progress** and ask questions early

Good luck! 🚀

---

## Recent frontend changes (detailed)

The following section documents the recent frontend work done to fix the Patients page, and to integrate parts of Dashboard, Appointments and Reports pages from the "uncompleted pages" area. It is intentionally detailed so any team member can trace what changed, why, and how to test/verify locally.

Note: All edits so far are frontend-only — the backend code and the Prisma schema were not modified.

1) High-level summary
- Fixed runtime/JSX errors and added safety guards on the Patients page.
- Made the Patients table tolerant to different API response shapes.
- Integrated presentational dashboard widgets and a small recent-patients panel reusing the existing patients service.
- Ported an appointments UI (calendar, filters, details panel) into the frontend and wired it to use mock/real services where practical.
- Brought in small Reports presentational components and a placeholder page to show reports-style cards.
- Added per-page documentation under `docs/pages/` for several pages (frontend + backend guidance in each directory).

2) Files added / edited (complete paths)

- Patients fixes
  - Edited: `frontend/src/pages/PatientsPage.tsx` — fixed JSX syntax, added optional chaining/safety checks for initials and id slicing, added guard before update to prevent null updates, removed unused imports.
  - Edited: `frontend/src/components/PatientTable.tsx` — made response handling tolerant to arrays or `{ data }` shapes and defensive casting to avoid runtime crashes.

- Dashboard components/pages
  - Added: `frontend/src/components/dashboard/DonutChart.tsx` (presentational chart)
  - Added: `frontend/src/components/dashboard/StatsCard.tsx` (stat tile)
  - Added: `frontend/src/components/dashboard/PatientCard.tsx` (recent patient list item)
  - Added: `frontend/src/components/dashboard/AppointmentTable.tsx` (small appointment list)
  - Edited/Added page: `frontend/src/pages/DashboardPage.tsx` — composes the above components, fetches small patient list via `patient.service.getPatients` with token.

- Appointments components/pages
  - Added: `frontend/src/components/appointments/FilterBar.tsx` (filter controls)
  - Added: `frontend/src/components/appointments/WeeklyCalendar.tsx` (calendar grid view)
  - Added: `frontend/src/components/appointments/AppointmentDetailsPanel.tsx` (side panel to view/edit appointment details)
  - Edited/Added page: `frontend/src/pages/AppointmentsPage.tsx` — composes these components and uses mocked appointments initially; wired token prop through `MainLayout`.

- Reports components/pages
  - Added: `frontend/src/components/reports/Breadcrumb.tsx` (breadcrumb navigation)
  - Added: `frontend/src/components/reports/ReportsStatCard.tsx` (presentational stat card)
  - Edited/Added page: `frontend/src/pages/ReportsPage.tsx` — uses stat cards and breadcrumb; placeholder data and structure for future real report hooks.

- Layout
  - Edited: `frontend/src/components/layout/MainLayout.tsx` — updated to pass `token` prop to `DashboardPage` and `AppointmentsPage` (and other pages as needed) so pages can call services that require auth.

- Services (no major edits but used)
  - `frontend/src/services/patient.service.ts` — reused throughout new pages to avoid adding backend endpoints; some components are defensive about returned shapes.

- Documentation files added
  - Per-page docs (frontend + backend) created under `docs/pages/`:
    - `docs/pages/profiles/frontend.md` and `docs/pages/profiles/backend.md`
    - `docs/pages/patients/frontend.md` and `docs/pages/patients/backend.md`
    - `docs/pages/dashboard/frontend.md` and `docs/pages/dashboard/backend.md`
    - `docs/pages/reports/frontend.md` and `docs/pages/reports/backend.md`
    - `docs/pages/appointments/frontend.md` and `docs/pages/appointments/backend.md`
  - Note: `docs/pages/login` and `docs/pages/user_account` already existed and were left intact.
  - Integration docs were also added at the project root under `docs/` during development (e.g., `docs/DASHBOARD_INTEGRATION.md`, `docs/APPOINTMENT_INTEGRATION.md`, `docs/REPORTS_INTEGRATION.md`). These have now been consolidated into the per-page directories under `docs/pages/` and the older root-level duplicates have been moved to `docs/obsolete/` to avoid clutter. Please consult `docs/pages/` for the canonical, up-to-date page documentation.

3) Why the changes were made
- PatientsPage had a JSX syntax error and unsafe property access that caused the dev server to fail or the page to crash when fields were missing.
- The PatientTable assumed a single backend response shape. The service sometimes returned raw arrays; making the component tolerant prevents runtime crashes and avoids forcing backend changes.
- Dashboard/Appointments/Reports UIs were present in an "uncompleted pages" folder. Bringing in the presentational parts speeds up iteration, helps the product team review layouts, and reuses the existing `patient.service` where possible.
- Passing `token` via `MainLayout` is a pragmatic change so pages can call services that require Authorization headers without changing the global app structure.

4) How to test these changes locally (quick checks)

Run the dev servers (PowerShell examples):

```powershell
# Backend (from repo root)
cd "c:\Users\HP\Desktop\Dentist Management System Project\Dentist-Management-System\Dentist-Management-System\dental-clinic-app\backend"
npm run dev

# Frontend
cd "c:\Users\HP\Desktop\Dentist Management System Project\Dentist-Management-System\Dentist-Management-System\dental-clinic-app\frontend"
npm run dev
```

Verification checklist
- Visit the Login page and authenticate with a demo account (manager/doctor/assistant). Confirm token is stored and MainLayout renders.
- Navigate to Patients page:
  - Confirm patient list loads without console errors.
  - Try searching, changing pages, and opening the Add/Edit modal.
  - Create and edit a patient; confirm the list refreshes.
- Visit Dashboard page:
  - Confirm small stat cards and the recent patients list render.
  - Ensure no console errors appear from chart components.
- Visit Appointments page:
  - Confirm the calendar renders (mocked appointments) and filters show.
  - Open an appointment in the details panel.
- Visit Reports page:
  - Confirm breadcrumb and stat cards render; filters are present.

5) Known issues & next steps
- TypeScript / lint warnings: Some edits surfaced unused-import or type mismatches. These are minor and were addressed where safe, but the project should be compiled locally to reveal all errors and warnings. If you hit a type error, please run `npm run build` or `pnpm -w -r build` depending on your package manager to see the full diagnostics.
- Response normalization: Several components defensively handle array vs. object responses. For long-term maintainability, consider adding a shared response-normalizer in `frontend/src/utils/api.ts` that standardizes `{ success, data }` vs raw arrays.
- Tests: Add unit tests for `PatientsPage` (filtering/pagination) and for any new helper utilities. UI tests (Cypress/Playwright) for basic flows are recommended.

6) Quick developer tips
- If the dev server fails to start after pulling, run `npm install` in `frontend` and `backend` respectively.
- Use the browser devtools network tab to inspect outgoing requests and response shapes when debugging data issues.
- When adding new pages, follow the existing `MainLayout` pattern and add the page to the `renderPage` switch so it appears in the sidebar flow.


---

