# Product Redesign — Status & Handoff

This document exists so a new chat session can pick up this work without re-deriving context. It covers the product-relaunch effort (design system overhaul + new features) that turns this from a CRUD demo into something sellable to dentists.

## The goal

Full redesign: modern, motion-driven "clinical SaaS" UI (not the old mint-green/static look) plus four new feature areas beyond basic CRUD:
1. Interactive odontogram (tooth chart)
2. Treatment plans + cost estimator + e-signature/consent
3. Online booking + automated reminders
4. Patient portal (separate patient login)

Full plan/roadmap lives in the approved plan from that session (not persisted as a file — see "Phases 1-4" below for the summary that matters).

Design direction chosen: **Modern clinical SaaS** (neutral surfaces + one confident teal accent, restrained, Linear/Stripe-ish). Tech additions approved: React Router, Framer Motion, Radix UI primitives, TanStack Query, axios, class-variance-authority.

## Where the work lives

- Branch: `claude/product-redesign-v1` (based off `main`), already pushed to GitHub.
- Commits so far (chronological):
  1. `Redesign app shell and foundation for product relaunch (Phase 0)`
  2. `Propagate design system to remaining pages and clean up debt`
  3. `Stop tracking backend/.env in git`

## Phase 0 — DONE

**Infrastructure (frontend, `dental-clinic-app/frontend`)**
- Real routing via `react-router-dom` (`src/routes/AppRoutes.tsx`, `src/App.tsx`, `src/components/layout/MainLayout.tsx`) — replaced the old fake `switch`-statement page navigation. Routes: `/dashboard`, `/patients`, `/patients/:patientId`, `/appointments`, `/treatments`, `/finances`, `/reports`, `/staff`, `/profile`.
- `AuthContext` (`src/contexts/AuthContext.tsx`) replacing token prop-drilling from `App.tsx`.
- One typed API client (`src/lib/apiClient.ts`, axios-based) with a single 401→logout interceptor and `ApiError` (carries HTTP status). All 9 service files (`src/services/*.ts`) rewritten to use it — no more hardcoded `localhost:4000` (now `VITE_API_URL` via `.env`/`.env.example`, defaults to `http://localhost:4000/api`).
- New Tailwind design tokens (`frontend/tailwind.config.js`): `primary` (teal accent, replaces old flat `mint` scale), `surface` (neutral scale replacing raw `gray-*` everywhere), `success`/`warning`/`danger`/`info` semantic colors, real shadow/radius scale, `Inter` variable font (self-hosted via `@fontsource-variable/inter`).
- Shared UI primitives added under `src/components/ui/`: `Card`, `Badge`, `Tabs` (Radix), `Dialog`/`DialogPanel` (Radix, replaces old `Modal.tsx` — `Modal.tsx` still exists and works for unmigrated call sites but is marked `@deprecated`), `DropdownMenu` (Radix), `Toaster`/`toast` (sonner), `Skeleton`, `EmptyState`, `cva`-based `Button`/`Input`.
- `src/utils/jwt.ts` (`decodeToken`) and `src/utils/cn.ts` (`clsx` + `tailwind-merge`) — shared utilities.

**Redesigned pages/components**: Login, Sidebar, Header, MainLayout, Dashboard, FinancesPage, ReportsPage (page chrome only, not the 18 individual analytics chart cards), StaffPage, ProfilePage. Plus a **global sweep** across every remaining file: old mint hex codes (`#3DBEA3` etc.) → new `primary` hex values, and default Tailwind `gray-*` → new `surface-*` scale — so the whole app is visually consistent even where deeper structural redesign hasn't happened yet.

**Bugs/debt fixed along the way**:
- Dead `import { Link } from 'react-router-dom'` in `DashboardPage.tsx` that silently didn't resolve (package wasn't installed) — now resolves for real since the package is installed.
- Hardcoded `userRole="DOCTOR"` literal in `PatientsPage.tsx` overriding the real logged-in user's role when viewing patient detail — fixed to use `decodeToken(token)?.role`.
- Three separate ad hoc `JSON.parse(atob(token.split('.')[1]))` implementations (MainLayout, AppointmentsPage, PatientsPage) consolidated into `decodeToken()`.
- Removed unused `express` dependency from the **frontend** `package.json` (it's a React/Vite app, had no reason to depend on express; was also the source of 2 CVEs via `path-to-regexp`/`qs`).
- Deleted ~8 dead prototype components with hardcoded fake data at `components/` root (`AppointmentCard.tsx`, `AppointmentTable.tsx`, `DonutChart.tsx`, `Header.tsx` — literally "Welcome back Dr. Emily!", `PatientCard.tsx`, `PatientTable.tsx`, `PatientsList.tsx`, `SideBar.tsx`), plus unused `StatsBox.tsx`/`.module.css` and unused `components/dashboard/PatientCard.tsx` (imported but never rendered).
- Deleted committed `.DS_Store` files and the orphaned/broken `pages/Permissions.tsx` (unreferenced anywhere, imported a cross-workspace path into `backend/src/types/prisma.types`).
- Replaced **all** remaining `alert()` calls (PatientsPage, PaymentTable) with `toast`.
- Removed **two fabricated data points** that were actively misleading: a hardcoded fake clinic address ("789 Dental Avenue...") and a hardcoded fake "150+ appointments managed" stat in ProfilePage — neither had any real backing field. Also removed a fabricated "Patient Gender Distribution" chart on the Dashboard that invented a 42/58 split via `Math.floor(patients.length * 0.42)` — `Patient` has no gender field in the schema at all.
- Replaced a duplicated inline `<style>@keyframes slideInRight{...}</style>` animation hack in `TreatmentDetailPanel.tsx` with Framer Motion.
- Fixed a stray inline `fetch('http://localhost:4000/api/users/me', ...)` in `AppointmentsPage.tsx` to go through `user.service.ts`.

**Explicitly not done in Phase 0** (honest scope boundary, noted to the user): the deep internals of PatientsPage/AppointmentsPage/TreatmentsPage (forms, tables, detail panels) got the color/token sweep and targeted bug fixes but not a full structural rebuild. Same for the 18 individual analytics chart cards under Reports. They're visually consistent now (surface/primary tokens) but not redesigned component-by-component.

**Interesting find for later**: `frontend/src/components/patients/OdontogramDisplay.tsx` already exists (158 lines) — check this before building the Phase 1 odontogram feature from scratch, there may be a partial start already.

## Separate issue that got resolved along the way: database recovery

Not part of the redesign, but happened during this work and is now resolved:
- The original Supabase project (`dental-clinic-db`) had been paused >90 days and was unrecoverable via dashboard.
- User chose a **fresh start** (no need to preserve old data — it was dev/demo data).
- New Supabase project created, `backend/.env` updated with new `DATABASE_URL`/`DIRECT_URL`, `npx prisma migrate deploy` run to recreate schema, `npm run seed` run successfully.
- Seeded: 1 Manager, 5 Doctors, 4 Assistants, 2 Receptionists, 20 patients, 57 appointments, 25 treatments, 42 payments, 17 documents, 25 expenses. Login demo credentials unchanged: `manager` / `doctor` / `assistant`, all with password `password123`.
- Also rotated `JWT_SECRET` to a fresh strong value while editing `.env` (was previously the weak, publicly-exposed `"supersecretjwt"`), and removed a duplicate `JWT_SECRET` line that existed in the file.
- `backend/.env` is now untracked from git (`git rm --cached`) so it stops shipping in future commits — but **the secrets that were already committed in prior git history are still there**. That still needs a history rewrite (`git filter-repo`/BFG) plus rotating the Google Drive service-account key and OAuth client secret/refresh token if this repo's history exposure is a concern (those weren't rotated, only the DB password and JWT secret were, since those were the ones actively blocking the user).

## GitHub push permissions

Earlier in this session, pushing from the cloud sandbox 403'd because the Claude GitHub App was only **authorized** (OAuth) but not **installed** (repo-scoped write permission) on this repo. User fixed it via GitHub App installation settings. Pushing now works fine — no need to re-litigate this if a new session can push successfully.

## Remaining roadmap (not started)

**Phase 1 — Interactive odontogram**: `ToothCondition` enum + `ToothRecord` Prisma model (patientId, toothNumber, condition, notes, treatmentId link), new `dentalchart.view`/`dentalchart.update` permissions, backend routes, and a real SVG tooth-chart component replacing the current 32-button grid `TeethSelector.tsx` — reuse the existing `TEETH_NUMBERS`/`TEETH_QUADRANTS` constants in `types/treatment.ts`. Check `OdontogramDisplay.tsx` first (see above).

**Phase 2 — Treatment plans + cost estimator + e-signature**: `TreatmentPlan` + `TreatmentPlanItem` Prisma models (cost fields, consent/signature fields), signature capture UI, and — while touching `drive.utils.ts` for signature storage — **fix the pre-existing bug** where every uploaded document is set to `role: "reader", type: "anyone"` on Google Drive (world-readable patient documents).

**Phase 3 — Online booking + automated reminders**: `Appointment.durationMinutes`, real conflict-checking in `appointment.service.ts` (currently absent — double-booking is possible today), read `Doctor.workingTime` (seeded but never consulted) for slot validation, a `NotificationProvider` interface with a console/log default (works with zero external credentials) pluggable to real email/SMS later, `node-cron` reminder job.

**Phase 4 — Patient portal**: new `PatientAccount` model (separate from the staff `User`/`Role`/`UserPermission` system), portal-scoped JWT + middleware, own booking/treatment-plan-signing/documents/messaging.

Original plan said: implement in order (odontogram → treatment plans → booking → patient portal), confirming with the user at each phase boundary since each involves schema/migration decisions.

## Still outstanding from the very first code review (not yet addressed)

- Dev-mode auth bypass in `backend/src/middleware/auth.middleware.ts` (treats any unauthenticated request as a MANAGER when `NODE_ENV` isn't explicitly `production` — and `NODE_ENV` defaults to `"development"` if unset).
- Zod validation middleware installed but never wired up to any route.
- `express-rate-limit` installed but unused — login has no brute-force protection.
- No automated tests anywhere in the repo.
- Empty `docker-compose.yml` and both `Dockerfile`s; no CI.
- No Prisma indexes on heavily-filtered foreign keys (`Appointment.patientId/doctorId/status`, `Payment.patientId`, etc.).

## How to resume

Pull `claude/product-redesign-v1`, confirm it builds (`cd dental-clinic-app/frontend && npm run build`), then continue with Phase 1 (odontogram) — check `OdontogramDisplay.tsx` first — or ask the user which phase they want next.
