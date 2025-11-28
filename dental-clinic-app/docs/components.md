(# Components Reference & How-To)

Purpose
-------
This document is a short, practical catalog of the frontend components used across the app and a quick how-to for modifying or adding components. Use it as a go-to reference when you need to change UI behavior or add new reusable pieces.

How to read this file
---------------------
- Each section describes a component group (layout, ui primitives, page-specific groups).
- For each component: purpose, where to find the file(s), how to modify, how to add a new component, and quick testing notes.

Layout components
-----------------

Sidebar / Header / MainLayout
Purpose
: Provide the app frame: navigation, page switching, and top header with user info.

Files
- `frontend/src/components/layout/MainLayout.tsx`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/layout/Header.tsx`

How to modify
- Change menu items in `Sidebar.tsx` (menu array). Keep `page` keys in sync with `MainLayout.renderPage()`.
- To change layout spacing, edit Tailwind classes in `MainLayout.tsx`.

How to add a new layout piece
- Create `frontend/src/components/layout/YourComponent.tsx`, export it, and import it into `MainLayout.tsx`.

UI primitives (reusable)
-----------------------

Button, Input, Modal, Table
Purpose
: Small, reusable building blocks used by many pages.

Files
- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Input.tsx`
- `frontend/src/components/ui/Modal.tsx`
- `frontend/src/components/ui/Table.tsx`

How to modify
- Keep components small and prop-driven (label, onClick, className, disabled).
- Prefer composition over many boolean props (e.g., pass children vs. variant props).

How to add a new primitive
- Create the file in `components/ui/`, export a typed props interface, add default Tailwind classes, and update Storybook/README if you have one.

Page-specific component groups
-----------------------------

Patients
Purpose
: Forms, table and modals for patient CRUD.

Files
- `frontend/src/components/patients/PatientForm.tsx`
- `frontend/src/components/patients/PatientTable.tsx`

How to modify
- Update DTOs in `frontend/src/types/` if fields change. Keep form initial state in sync with DTOs.
- When changing a table column: update `PatientTable` and any consumers that map columns.

How to add new patient component
- Create new file under `components/patients/`, export it and import it into `PatientsPage` or into other components. Reuse `ui` primitives for consistency.

Appointments
Purpose
: Calendar, filters, and details panel used to display and manage appointments.

Files
- `frontend/src/components/appointments/WeeklyCalendar.tsx`
- `frontend/src/components/appointments/FilterBar.tsx`
- `frontend/src/components/appointments/AppointmentDetailsPanel.tsx`

How to modify
- Calendar rendering should be pure and memoized. Keep data transformation logic in the page or service layer, not inside presentational components.

How to add new appointment component
- Follow the existing folder pattern, keep props small, and add unit tests for any non-trivial transformation.

Dashboard & Reports components
----------------------------

Purpose
: Small stat cards, charts and concise lists used on the Dashboard and Reports pages.

Files
- `frontend/src/components/dashboard/DonutChart.tsx`
- `frontend/src/components/dashboard/StatsCard.tsx`
- `frontend/src/components/reports/ReportsStatCard.tsx`

How to modify
- For visual changes, adjust props (colors, size) and keep the data input shape stable (numbers/objects). Avoid embedding fetch logic inside these components.

How to add new dashboard component
- Create a presentational component under `components/dashboard/` and wire it into `frontend/src/pages/DashboardPage.tsx`.

Best practices (short)
---------------------
- Props-first: components accept data via props and do not call services directly (unless intentionally local). This improves testability.
- Small & focused: Prefer many small components to one giant one.
- Reuse `ui` primitives to keep styling consistent.
- Keep side effects (fetching, routing) in pages or custom hooks, not in small components.

Testing & verification
----------------------
- Manual: open the page in the browser and verify UI/interaction.
- Console/network: check for errors and shape of API responses.
- Automated: add unit tests for data transformations and snapshot tests for presentational components.

What to do next
----------------
- If you're changing a component used on many pages, run the app and test at least the two pages that use it.
- Add or update a short README inside `components/` describing prop shapes for complex components.
- Consider creating a small style-guide or Storybook later to visualize components in isolation.

