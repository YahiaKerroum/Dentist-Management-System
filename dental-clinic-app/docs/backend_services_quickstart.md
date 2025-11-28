## Backend Services — Quickstart (purpose / how to / next steps)

Purpose
-------
Describe how backend services are structured, how the frontend consumes them, and concise steps for modifying or adding a new service.

How services are made
---------------------
- Location: `backend/src/services/`.
- Each file typically exposes a class with static methods, e.g. `UserService`, `PatientService`.
- Responsibilities: implement business logic, call Prisma client, perform data transformations, and throw custom errors for controllers to handle.

Typical service file structure

```ts
// backend/src/services/example.service.ts
export class ExampleService {
  static async getAll(filters?: any) { /* prisma queries */ }
  static async create(data: CreateDTO) { /* business rules + prisma.create */ }
}
```

How services get into the frontend
---------------------------------
1. Controller → Route: Controller methods expose HTTP endpoints (e.g., `GET /api/patients`).
2. API Response: Controller returns a JSON response `{ success, data }`.
3. Frontend service wrapper: `frontend/src/services/*.ts` call the backend endpoints via `fetch`/`axios` and normalize the result.

Example flow

User clicks "Add Patient" → Frontend `patient.service.createPatient()` POSTs to `/api/patients` → Backend route calls `PatientController.create` → Controller calls `PatientService.createPatient()` → Service writes to DB (Prisma) and returns the created object → Controller returns JSON to client → Frontend updates UI.

How to modify an existing service
--------------------------------
1. Update the logic in `backend/src/services/<your>.service.ts`.
2. Keep the service API stable (method names / return shapes) or update controller/docs accordingly.
3. Add/adjust unit tests for the service (if the project has tests).
4. Run the backend locally and hit the endpoints via Postman or frontend to verify.

How to add a new service
------------------------
1. Create a new file `backend/src/services/<feature>.service.ts` with a class and static methods.
2. Add a controller method that calls your new service methods and performs request validation.
   - `backend/src/controllers/<feature>.controller.ts`
3. Add routes in `backend/src/routes/<feature>.routes.ts` and wire them in `routes/index.ts`.
4. Update `docs/api.md` with the new endpoints and required request/response formats.
5. (Optional) Add frontend client wrapper in `frontend/src/services/<feature>.service.ts` to call the new API.

Testing & Verification
----------------------
- Start backend: `cd backend && npm run dev`.
- Use Postman or curl to call the endpoint(s) and inspect responses.
- If the service uses new Prisma models, run `npx prisma migrate dev` and seed if necessary.

What to do next
---------------
- When adding complex business rules, create service-level unit tests.
- Document the API changes in `docs/api.md` and update page docs in `docs/pages/` if the frontend needs UI changes.
- Consider extracting common helpers (pagination, filtering) into a shared util in `backend/src/utils/`.
