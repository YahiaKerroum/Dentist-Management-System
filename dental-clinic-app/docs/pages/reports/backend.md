# Reports Page — Backend (for beginners)

Overview

This document describes backend responsibilities for the Reports page: endpoints, aggregation strategies, and how to provide filtered/time-bucketed data.

Files to look at

- `backend/src/controllers/report.controller.ts` — entry points for report endpoints.
- `backend/src/services/report.service.ts` — implements aggregation logic using Prisma.
- `backend/prisma/schema.prisma` — models used for reporting (Appointment, Payment, Patient).

Common endpoints

- GET `/api/reports/summary` — high-level numbers for dashboard tiles.
- GET `/api/reports/timeseries?metric=appointments&start=yyyy-mm-dd&end=yyyy-mm-dd&interval=day` — returns bucketed time series.
- GET `/api/reports/export?format=csv` — exports raw report data.

Aggregation notes

- Use Prisma's aggregate/groupBy where possible to let the DB do the heavy lifting.
- Validate query parameters (dates, metrics) and guard against expensive operations by limiting range or page size.

Testing and verification

- Add deterministic fixtures to `prisma/seed.ts` that exercise each metric calculation.
- Use Postman to call timeseries endpoints with small ranges and verify the returned buckets.

Production concerns

- Large reports should be generated asynchronously and stored as files for download.
- Consider throttling/report generation quotas for heavy users.
