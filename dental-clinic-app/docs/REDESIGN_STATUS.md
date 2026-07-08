# Product Redesign — Status & Handoff

This document exists so a new chat session can pick up this work without re-deriving context. It covers the product-relaunch effort (design system overhaul + new features) that turns this from a CRUD demo into something sellable to dentists. **Keep this file current** — update it whenever a phase finishes or the plan changes, rather than relying on any one session's private memory.

## Current status (as of 2026-07-08)

Active branch: **`claude/clinic-pulse-redesign`** (based off `claude/product-redesign-v1`, which held Phase 0 below). Done so far, chronologically:

1. **Phase 0 — Foundation** (on `claude/product-redesign-v1`, see full detail further down): routing, design tokens, shared UI primitives, global color-token sweep, misc bug/debt fixes.
2. **Clinic Pulse dashboard** — real backend aggregation endpoint (`GET /api/reports/clinic-pulse`), gradient hero header, live occupancy meters, colored status chips.
3. **Chair/Day Planner** — chair-row day planner replacing the old appointment table as the default Appointments view, drag-to-reschedule, per-chair expand, redesigned create/edit form.
4. **Per-tooth data model + Treatment Kanban board + odontogram**: `TreatmentStatus` enum (PLANNED/IN_PROGRESS/NEEDS_FOLLOW_UP/COMPLETED/BILLED/ARCHIVED, replaces the old boolean `completed`), `TreatmentTooth` join table (per-tooth notes, replaces the flat `teethInvolved: Int[]`), `PatientTooth` table (10-value `ToothStatus` enum) as the odontogram's current-state chart — starts **empty** per patient, never seeded with fabricated history. `TreatmentBoard.tsx` (Kanban, native HTML5 drag-and-drop, no new dependency) is now the Treatments page's default view; `Odontogram.tsx` is wired into a new Patient Detail tab. Full schema/API detail lives in `docs/database.md` (Treatment/TreatmentTooth/PatientTooth models) and `docs/api.md` (Treatments + Odontogram endpoints) — **that's the source of truth for the current shape, not the old Phase 1 plan further down**, which described a differently-shaped `ToothRecord` model that was never built.
5. **Visual-polish pass**: Finances rebuilt as a ledger/statement view (not another card-list — see rationale below), Staff's form/profile view moved off raw inline-styled modals onto the shared design system, Profile's empty space filled with real (non-fabricated) Account Details + My Access sections.
6. **Brand identity + motion pass** (2026-07-08): the app is now branded **Clinic Pulse** end-to-end (replacing the placeholder "DentalCare" name, "D" logo, Vite favicon, and "Dental Clinic App" title). New pieces: `ui/BrandMark.tsx` (custom SVG logomark — tooth silhouette with an ECG line carved through it; same art in `public/favicon.svg`); Space Grotesk variable font as a `font-display` token (wordmark, page h1s, and large numerals ONLY — body copy stays Inter); `src/lib/motion.ts` shared motion vocabulary (spring presets, `easeOutExpo`, `staggerContainer`/`riseIn`, `pageEnter` used by MainLayout's route transition) with `MotionConfig reducedMotion="user"` in `App.tsx`; `ui/AnimatedNumber.tsx` spring count-up (Clinic Pulse hero figures + stat cards); lit gradient primary/destructive buttons; branded scrollbars + `::selection`; per-page `document.title` ("Today · Clinic Pulse"); Login rebuilt as the brand moment (animated ECG trace, dot-grid texture, display-font headline); sidebar dashboard nav item renamed "Today" (product = Clinic Pulse, page = Today). Also fixed all 16 pre-existing TS6133 errors so `tsc -p tsconfig.app.json` is fully clean again.

**Deprioritized/backlog, not started** (explicit scope-trim decision, don't build without being asked by name again): full Financial Hub (cashflow/balances/approval workflows beyond the ledger view already shipped), vendor-as-entity modeling, multi-state expense-approval Kanban, a global command bar, full audit-log wiring, a Patient Journey Timeline workspace (a bigger single-patient profile redesign — distinct from the Odontogram tab already shipped), extra Appointment view modes (Calendar/Doctor view) beyond Chair+List.

**Design pattern rules established this round** (apply before redesigning any further list/table view):
- Every module needs a *structurally distinct* list layout — don't default to copy-pasting the last-approved pattern. Patients/Staff/Treatments-table use a colored-left-stripe card-list; Finances uses a ledger/statement view (monospace amounts, running total, data-bar magnitude cues) because it's transaction data, not people records — picking the pattern that fits the data's nature is the actual rule, not "always use card-list."
- Forms *should* look consistent across modules (sectioned cards, colored icon-badge section headers) — that reuse is intentional, unlike list-view reuse.
- Identity rules (from the brand pass): Space Grotesk (`font-display`) is reserved for the wordmark, page-level headings, and big stat numerals — never body copy or form labels. All new animation should pull transitions/variants from `src/lib/motion.ts` rather than inventing one-off timings, and big numbers on stat surfaces should use `ui/AnimatedNumber.tsx`.
- Tailwind's `warning`/`success`/`danger`/`info` tokens only define shades `50/100/500/600/700` in `frontend/tailwind.config.js` (unlike `primary`/`surface`, which have the full 50–950 range). Using e.g. `border-warning-200` silently emits no CSS.
- `frontend/tsconfig.json` is a solution-style file (`"files": []`) — `tsc -p tsconfig.json` checks nothing. Always typecheck against `tsc -p tsconfig.app.json`.
- This Supabase project's connection pooler can't take Prisma's migration advisory lock (`migrate dev`/`deploy`/`resolve` all hang with `P1002`). Workaround: `prisma migrate diff --from-schema-datasource ... --to-schema-datamodel ...` to get the SQL, hand-write the migration folder, apply via `prisma db execute --file`, then manually `INSERT` the `_prisma_migrations` row (checksum = `sha256sum migration.sql`) since `migrate resolve` hangs too.

## The original goal (Phase 0 session)

Full redesign: modern, motion-driven "clinical SaaS" UI (not the old mint-green/static look) plus four new feature areas beyond basic CRUD:
1. Interactive odontogram (tooth chart) — **done, differently than planned here; see "Current status" above.**
2. Treatment plans + cost estimator + e-signature/consent — **not started, still accurate as future work.**
3. Online booking + automated reminders — **not started, still accurate as future work.**
4. Patient portal (separate patient login) — **not started, still accurate as future work.**

Design direction chosen: **Modern clinical SaaS** (neutral surfaces + one confident teal accent, restrained, Linear/Stripe-ish). Tech additions approved: React Router, Framer Motion, Radix UI primitives, TanStack Query, axios, class-variance-authority.

## Phase 0 — DONE (on `claude/product-redesign-v1`)

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

**Explicitly not done in Phase 0** (honest scope boundary, noted to the user): the deep internals of PatientsPage/AppointmentsPage/TreatmentsPage (forms, tables, detail panels) got the color/token sweep and targeted bug fixes but not a full structural rebuild at the time — **this has since been done** for Patients, Appointments, Treatments, Finances, Staff, and Profile (see "Current status" above). The 18 individual analytics chart cards under Reports are still visually-consistent-but-not-structurally-redesigned.

## Separate issue that got resolved along the way: database recovery

Not part of the redesign, but happened during this work and is now resolved:
- The original Supabase project (`dental-clinic-db`) had been paused >90 days and was unrecoverable via dashboard.
- User chose a **fresh start** (no need to preserve old data — it was dev/demo data).
- New Supabase project created, `backend/.env` updated with new `DATABASE_URL`/`DIRECT_URL`, `npx prisma migrate deploy` run to recreate schema, `npm run seed` run successfully.
- Seeded: 1 Manager, 5 Doctors, 4 Assistants, 2 Receptionists, 20 patients, appointments/treatments/payments/documents/expenses in similar proportions (exact counts drift slightly each reseed). Login demo credentials unchanged: `manager` / `doctor` / `assistant`, all with password `password123`.
- Also rotated `JWT_SECRET` to a fresh strong value while editing `.env` (was previously the weak, publicly-exposed `"supersecretjwt"`), and removed a duplicate `JWT_SECRET` line that existed in the file.
- `backend/.env` is now untracked from git (`git rm --cached`) so it stops shipping in future commits — but **the secrets that were already committed in prior git history are still there**. That still needs a history rewrite (`git filter-repo`/BFG) plus rotating the Google Drive service-account key and OAuth client secret/refresh token if this repo's history exposure is a concern (those weren't rotated, only the DB password and JWT secret were, since those were the ones actively blocking the user).

## GitHub push permissions

Pushing from the cloud sandbox once 403'd because the Claude GitHub App was only **authorized** (OAuth) but not **installed** (repo-scoped write permission) on this repo. User fixed it via GitHub App installation settings. Pushing works fine now — no need to re-litigate this if a new session can push successfully.

## Remaining roadmap (not started)

**Treatment plans + cost estimator + e-signature**: `TreatmentPlan` + `TreatmentPlanItem` Prisma models (cost fields, consent/signature fields), signature capture UI, and — while touching `drive.utils.ts` for signature storage — **fix the pre-existing bug** where every uploaded document is set to `role: "reader", type: "anyone"` on Google Drive (world-readable patient documents).

**Online booking + automated reminders**: real conflict-checking in `appointment.service.ts` (currently absent — double-booking is possible today), read `Doctor.workingTime` (seeded but never consulted) for slot validation, a `NotificationProvider` interface with a console/log default (works with zero external credentials) pluggable to real email/SMS later, `node-cron` reminder job. (`Appointment.durationMinutes` already exists as of the Chair/Day Planner phase.)

**Patient portal**: new `PatientAccount` model (separate from the staff `User`/`Role`/`UserPermission` system), portal-scoped JWT + middleware, own booking/treatment-plan-signing/documents/messaging.

Plus the Clinic Pulse backlog items listed under "Deprioritized/backlog" above (Financial Hub proper, vendor entities, Patient Journey Timeline, etc.) — don't build any of these without the user asking by name, per the standing scope-trim decision.

Confirm with the user at each phase boundary before starting one of these — each involves schema/migration decisions.

## Still outstanding from the very first code review (not yet addressed)

- Dev-mode auth bypass in `backend/src/middleware/auth.middleware.ts` (treats any unauthenticated request as a MANAGER when `NODE_ENV` isn't explicitly `production` — and `NODE_ENV` defaults to `"development"` if unset).
- Zod validation middleware installed but never wired up to any route.
- `express-rate-limit` installed but unused — login has no brute-force protection.
- No automated tests anywhere in the repo.
- Empty `docker-compose.yml` and both `Dockerfile`s; no CI.
- No Prisma indexes on heavily-filtered foreign keys (`Appointment.patientId/doctorId/status`, `Payment.patientId`, etc.).

## How to resume

Pull `claude/clinic-pulse-redesign`, confirm it builds (`cd dental-clinic-app/frontend && npm run build`; `cd dental-clinic-app/backend && npx tsc --noEmit`), then either continue with one of the "Remaining roadmap" items above or ask the user what's next. Check `docs/database.md`/`docs/api.md` for the current schema/API shape before assuming anything from an older section of this file — this file's job is to stay current, but always verify against the actual code for anything schema-shaped before building on top of it.
