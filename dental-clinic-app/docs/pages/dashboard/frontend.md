# Dashboard Page — Frontend (for beginners)

Overview

This document explains the Dashboard page UI: where key components live, how data is fetched, and what to change when updating visuals (charts, stats, recent activity).

Files to look at

- `frontend/src/pages/DashboardPage.tsx` — page orchestrating dashboard widgets.
- `frontend/src/components/dashboard/DonutChart.tsx` — small chart used for quick stats.
- `frontend/src/components/dashboard/PatientCard.tsx` — shows recent patients.
- `frontend/src/services/patient.service.ts` — used to fetch recent patients.

What the page does

- Fetches aggregate data (counts) and recent patients to display on the dashboard.
- Renders small charts and stat cards for quick health checks (appointments, revenue, patients).
- Links to deeper pages (Patients, Appointments, Reports) for more details.

Key data flows

- Aggregates: can be fetched via dedicated endpoints (e.g., `/api/reports/summary`) or derived client-side from multiple endpoints.
- Recent patients: `getPatients(token)` with `pageSize` small (e.g., 5) and sorted by createdAt.

Component responsibilities

- DonutChart.tsx
  - Pure presentational component that accepts numeric props and renders an SVG/Canvas chart.
- StatsCard.tsx
  - Small card showing a label, main number, and optional delta (change since last period).
- DashboardPage.tsx
  - Fetches data, handles loading state, composes the widgets, and passes `token` to services.

Quick integration notes

- Reuse `patient.service.getPatients` for the recent patients list to avoid adding new endpoints.
- Keep chart components pure: pass raw numbers or precomputed percentages instead of making them fetch.

How to test

- Start the app, navigate to Dashboard, and confirm widgets render and data values match backend data.
- Click links to Patients or Appointments to confirm navigation.

Performance notes

- Avoid fetching large lists on the Dashboard. Fetch small, targeted datasets (counts or top-N lists).
- Cache or memoize chart calculations if the dataset is expensive to compute.
