# Appointments Page — Backend (for beginners)

Overview

This document explains the backend endpoints and logic supporting the Appointments page: fetching by date range, creating/updating appointments, and basic business rules.

Files to look at

- `backend/src/controllers/appointment.controller.ts` — routes and controller functions.
- `backend/src/services/appointment.service.ts` — business logic and Prisma queries.
- `backend/prisma/schema.prisma` — `Appointment` model (start, end, patientId, doctorId, status).

Important endpoints

- GET `/api/appointments?start=yyyy-mm-dd&end=yyyy-mm-dd` — appointments in the range.
- POST `/api/appointments` — create appointment.
- PUT `/api/appointments/:id` — update appointment (reschedule, change status).
- DELETE `/api/appointments/:id` — cancel appointment.

Business rules & checks

- Prevent double-booking: when creating/updating an appointment, ensure the selected doctor has no overlapping appointments.
- Validate appointment times (start < end, reasonable duration).
- Enforce permissions: only staff or the owning user can edit/cancel depending on policy.

How to test

- Use Postman to GET appointments for a week and confirm the returned items match the frontend calendar.
- Try creating overlapping appointments and confirm the API returns an error (409 or 400 depending on implementation).

Performance notes

- Index the `start`/`end` fields in the DB for fast range queries.
- For large clinics, consider paginating or partitioning appointment data by date.
