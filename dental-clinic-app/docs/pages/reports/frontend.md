# Reports Page — Frontend (for beginners)

Overview

This document explains the Reports page frontend: which components render charts and tables, how data is requested, and how to add new report widgets.

Files to look at

- `frontend/src/pages/ReportsPage.tsx` — page wrapper for report widgets.
- `frontend/src/components/reports/ReportsStatCard.tsx` — small stats card used across the reports page.
- `frontend/src/components/reports/Breadcrumb.tsx` — breadcrumb navigation used on reports.
- `frontend/src/services/report.service.ts` — client helpers that call report endpoints.

What the page does

- Fetches one or more report datasets (summary stats, timeseries) and renders charts and tables.
- Allows filtering (by date range, doctor) and downloads (CSV/PDF) for selected reports.

Component responsibilities

- ReportsPage.tsx
  - Fetches datasets and manages filters and selected ranges.
- ReportsStatCard.tsx
  - Small presentational component for single-number metrics.
- Chart components
  - Prefer pure presentation: pass sanitized data (numbers/labels) to chart libs.

Data & filtering tips

- Always request date ranges from the backend to reduce the amount of data transferred.
- Use server-side aggregation for daily/monthly buckets to keep the client simple.

How to test

- Navigate to Reports page and change date range filters; verify charts update accordingly.
- Export CSV and confirm the content matches the displayed data.

Maintenance note

- If you add a large or expensive report, consider paginating the results or performing pre-computed aggregations on the server.
