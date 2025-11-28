# Patients Page — Frontend (for beginners)

Overview

This document explains the Patients page frontend code and how data flows from the UI to the API. It is written for readers who are new to the project.

Files to look at

- `frontend/src/pages/PatientsPage.tsx` — main page with filters, pagination and modals.
- `frontend/src/components/patients/PatientForm.tsx` — create/edit form component for patients.
- `frontend/src/components/PatientTable.tsx` — table renderer used by the page.
- `frontend/src/services/patient.service.ts` — API helpers for patient CRUD operations.

What the page does

- Fetches a list of patients from the backend and renders a paginated table.
- Supports searching, filtering (by doctor, age, etc.), sorting and page size.
- Allows creating, editing and deleting patients via a modal form.

Key components and responsibilities

- PatientsPage.tsx
  - Handles fetching (`getPatients(token)`), search, pagination, and shows a modal for add/edit.
  - Keeps `selectedPatient` state when editing an entry and passes it to `PatientForm`.
- PatientForm.tsx
  - Renders inputs for patient fields and validates them (required fields, phone format).
  - Calls `createPatient` or `updatePatient` from `patient.service` and notifies parent on success.
- PatientTable.tsx
  - Receives `patients` array and `onEdit/onDelete` callbacks and renders each row.

Common bugs and guards implemented

- Guard against undefined fields when rendering initials or short IDs (use optional chaining).
- Be tolerant of different shapes returned by `getPatients` (some responses are arrays, some are `{ success, data }`).
- Ensure `selectedPatient` is checked before calling update to avoid runtime null errors.

State shape (simplified)

- patients: Array<{ id: string; firstName: string; lastName: string; dob?: string; phone?: string }>
- total: number
- page: number
- pageSize: number
- filters: { q?: string; doctorId?: string }

Flow for create/edit

1. User clicks "Add patient" or Edit on a row.
2. `PatientsPage` opens `PatientForm` modal, passing `selectedPatient` or `null`.
3. User fills form and submits. Form calls `patient.service.createPatient` or `updatePatient`.
4. On success, the page refetches patient list and closes the modal.

How to test

- Start the backend and frontend.
- Visit Patients page, verify patient list loads, try searching and pagination.
- Add a patient and confirm it appears in the table.

Debugging tips

- If the list fails to load, check the network tab for the `GET /api/patients` request and its response shape.
- If saving fails with a validation error, inspect the request body and the backend validation errors in response.

Notes for maintainers

- Consider centralizing API response normalization in `frontend/src/utils/api.ts` to avoid shape checks across components.
- Add unit tests around `PatientsPage` logic for filtering and pagination behavior.
