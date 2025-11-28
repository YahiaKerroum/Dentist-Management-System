# Dashboard Page — Backend (for beginners)

Overview

This document explains how the backend can support the Dashboard page: typical endpoints, where to add aggregation logic, and how to safely expose stats.

Files to look at

- `backend/src/controllers/report.controller.ts` — controller for summary endpoints.
- `backend/src/services/report.service.ts` — aggregation logic (counts, sums, trends).
- `backend/prisma/schema.prisma` — models used for aggregation (Appointment, Payment, Patient, User).

Recommended endpoints

- GET `/api/reports/summary` — returns counts like { patients, appointments, revenue, newThisWeek }.
- GET `/api/patients?recent=true&pageSize=5` — returns recent patients (reused endpoint is fine).

Typical aggregation flow

1. Controller receives request and calls `reportService.getSummary()`.
2. Service uses Prisma aggregations (count, sum) and date ranges to compute metrics.
3. Service returns `{ patients, appointments, revenue, growth }`.

Performance & correctness notes

- Keep aggregations efficient: use Prisma aggregate functions rather than loading all rows into memory.
- Use cached results for expensive aggregations if the underlying data does not need to be real-time.
- Validate date ranges and numeric types before returning the API response.

How to test

- Call `/api/reports/summary` from Postman and confirm numbers are reasonable compared to DB state.
- Add test fixtures in `prisma/seed.ts` to exercise growth calculations.
