# Appointments Page — Frontend (for beginners)

Overview

This document explains the frontend parts of the Appointments page: components, data flows, and how to extend the calendar or filters.

Files to look at

- `frontend/src/pages/AppointmentsPage.tsx` — page that composes the appointment UI.
- `frontend/src/components/appointments/WeeklyCalendar.tsx` — calendar view showing appointments by day/time.
- `frontend/src/components/appointments/FilterBar.tsx` — filter controls for doctor, date range and status.
- `frontend/src/services/appointment.service.ts` — client API helpers for appointment CRUD.

What the page does

- Displays a weekly calendar of appointments and a side panel for details.
- Provides filtering by doctor, status and date range.
- Allows creating, editing, and canceling appointments.

Component responsibilities

- AppointmentsPage.tsx
  - Fetches appointments (ideally paginated by date range), holds selected appointment state and opens details panel.
- WeeklyCalendar.tsx
  - Pure presentational component mapping appointments to time slots.
- AppointmentDetailsPanel.tsx
  - Shows appointment details and provides Edit/Cancel buttons.

Data and patterns

- Fetch appointments for the visible date range only (e.g., startOfWeek to endOfWeek) to avoid loading huge lists.
- Keep the calendar rendering pure and memoized where possible because it can be re-rendered frequently.

How to test

- Use the UI to navigate across weeks and confirm appointments update.
- Create an appointment and confirm it appears at the correct slot and persists after refresh.

Debugging tips

- If appointments are missing, check that the date range sent to the backend matches the calendar's visible range.
- Timezone mismatches are a common source of bugs; ensure both backend and frontend use the same timezone handling (prefer UTC internally).
