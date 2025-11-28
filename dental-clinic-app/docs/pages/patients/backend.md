# Patients Page — Backend (for beginners)

Overview

This document explains the backend endpoints and flow that support the Patients page: how the server receives list/create/update/delete requests and where to inspect the implementation.

Files to look at

- `backend/src/controllers/patient.controller.ts` — router/controller for patient endpoints.
- `backend/src/services/patient.service.ts` — handles business rules and Prisma operations.
- `backend/prisma/schema.prisma` — `Patient` model and related relations (e.g., doctor).
- `backend/src/middleware/auth.middleware.ts` — ensures requests are authenticated.

Important endpoints

- GET `/api/patients` — returns a paginated list of patients, accepts query params for page, size, q (search), doctorId, etc.
- POST `/api/patients` — creates a new patient.
- PUT `/api/patients/:id` — updates an existing patient.
- DELETE `/api/patients/:id` — removes a patient record.

Typical GET flow

1. Router routes to `patientController.list`.
2. Controller extracts query params (page, size, filters) and forwards to `patientService.list`.
3. Service queries Prisma with the given filters and returns `{ data: patients, total }`.
4. Controller responds with `{ success: true, data: { items: data, total } }`.

Validation & business rules

- Validate required fields (name, dob) in the controller or a validation middleware.
- Enforce referential integrity when linking to a doctor (ensure doctor exists).
- Avoid deleting patients with active appointments unless business allows (soft-delete recommended).

How to test

- Use Postman to GET `/api/patients?page=1&pageSize=10` and check the returned shape.
- Try creating a patient with minimal required fields and verify it appears in the GET list.

Debugging checklist

- 500 errors: inspect server logs and check Prisma queries for invalid fields.
- Partial data: verify the service's select clause; sometimes sensitive fields are omitted.

Maintenance note

- Consider implementing cursor-based pagination for large datasets to improve performance.
