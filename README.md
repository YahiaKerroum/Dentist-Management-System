<div align="center">

<img src="dental-clinic-app/frontend/public/favicon.svg" width="76" alt="Clinic Pulse logo" />

# Clinic Pulse

### The dental practice OS — run your clinic by its pulse.

A full-stack practice-management platform for dental clinics: patients, appointments,
per-tooth clinical records, finances and staff — with a live command-center dashboard
and role-based access for Managers, Doctors and Assistants.

<br />

![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node-20+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)

</div>

<br />

<div align="center">
  <img src="docs/screenshots/dashboard.png" width="90%" alt="Clinic Pulse dashboard" />
  <p><em>Clinic Pulse — the live command center that opens the app.</em></p>
</div>

---

## Table of contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Demo accounts](#demo-accounts)
- [Available scripts](#available-scripts)
- [Roles &amp; permissions](#roles--permissions)
- [Project structure](#project-structure)
- [Architecture &amp; data model](#architecture--data-model)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

**Clinic Pulse** turns the day-to-day of a dental practice into one coherent product. Instead of
a generic CRUD admin panel, each area is designed around the job the user is actually doing:

- A **front desk** sees who's waiting, who owes money, and today's schedule at a glance.
- A **doctor** sees their chair schedule, per-tooth treatment plans and clinical history.
- A **manager** sees revenue, pending approvals, staff performance and outstanding balances.

The app is built as a modern **TypeScript monorepo** — a React + Vite + Tailwind frontend and an
Express + Prisma + PostgreSQL backend — with JWT auth and role-based access control throughout.

---

## Screenshots

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/reports.png" alt="Reports and analytics" /><p align="center"><strong>Reports</strong> — a health snapshot: KPI strip, a no-show callout, and one unified chart system.</p></td>
    <td width="50%"><img src="docs/screenshots/permissions.png" alt="Granular permission editor" /><p align="center"><strong>Permissions</strong> — grant/revoke View · Create · Update · Delete per feature, per staff member.</p></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/patients.png" alt="Patients records table" /><p align="center"><strong>Patients</strong> — a sortable records table with next appointment, balance, last visit and status.</p></td>
    <td width="50%"><img src="docs/screenshots/patient-detail.png" alt="Patient detail" /><p align="center"><strong>Patient record</strong> — balance, alerts, next appointment and a live activity feed.</p></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/appointments-schedule.png" alt="Chair / day schedule planner" /><p align="center"><strong>Scheduling</strong> — the chair/day planner: drag to reschedule, drag markers to zoom.</p></td>
    <td width="50%"><img src="docs/screenshots/appointments.png" alt="Appointments table" /><p align="center"><strong>Appointments</strong> — a date-grouped table with search and status pills.</p></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/treatments.png" alt="Treatments board" /><p align="center"><strong>Treatments</strong> — a Kanban board of treatment plans by clinical status.</p></td>
    <td width="50%"><img src="docs/screenshots/finances-payments.png" alt="Finances payments" /><p align="center"><strong>Finances</strong> — payments and expenses as one system with summary strips.</p></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/staff-profile.png" alt="Staff profile" /><p align="center"><strong>Staff</strong> — a management view with per-person metrics, schedule and access.</p></td>
    <td width="50%"><img src="docs/screenshots/dashboard.png" alt="Clinic Pulse dashboard" /><p align="center"><strong>Clinic Pulse</strong> — the live command center that opens the app.</p></td>
  </tr>
</table>

---

## Features

### 🔑 Granular permission control &nbsp;<sub>— the signature feature</sub>

Beyond the four base roles, a **Manager can grant or revoke any individual action for any staff
member**. Every feature is broken into four actions — **View · Create · Update · Delete** — and each
is an independent toggle in the staff editor:

| Feature | View | Create | Update | Delete |
|---------|:---:|:-----:|:-----:|:-----:|
| Patients | ◻ | ◻ | ◻ | ◻ |
| Appointments | ◻ | ◻ | ◻ | ◻ |
| Treatments | ◻ | ◻ | ◻ | ◻ |
| Payments | ◻ | ◻ | ◻ | ◻ |
| Documents | ◻ | ◻ | ◻ | ◻ |
| Expenses | ◻ | ◻ | ◻ | ◻ |

So a manager can, for example, let an assistant **view but not delete** payments, allow a specific
doctor to **upload and view documents** but not edit treatment details, or hand a receptionist
**create-only** access to appointments. Permissions are stored per-user, enforced server-side on
every route, and reflected in the UI (a read-only "My Access" grid on each profile). This is what
turns Clinic Pulse from a fixed-role app into something a real clinic can shape to its own workflow.

### 🩺 Clinic Pulse dashboard
The live command center that opens the app. A single aggregation endpoint powers today's schedule,
patients **waiting / in treatment**, **chair occupancy** with elapsed-time meters, **revenue
collected today vs. yesterday** (with the delta), pending patient balances, follow-ups due, per-doctor
workload and expenses awaiting approval — with a self-drawing "pulse" line and count-up numerals.
Every figure is computed from real data; nothing is faked.

### 👥 Patients
A working **records table** — not a contact list — sortable by **next appointment, outstanding
balance, last visit and status**. "Active / Inactive" is *derived* from real visit history (upcoming
appointment or seen within 18 months), the balance is billed-minus-paid, and avatar colors are tied
to the assigned dentist. **Search** by name/email, filter tabs with live counts (All · Active ·
Inactive), and hover actions (call, edit, delete). Each patient opens a full record with a
**balance-and-alerts snapshot** (outstanding balance, no-show-risk flag), next appointment, and a
**reverse-chronological activity feed** across payments, treatments and appointments — plus tabs for
Treatments, Appointments, Documents and the Odontogram.

### 📅 Appointments &amp; scheduling
Two views of the day:

- **Chair / Day Planner (schedule view)** — a time-grid of chair rows with **drag-to-reschedule**,
  **drag-to-zoom** into a time range, per-chair expand, and a slide-in details drawer. Prev / next /
  Today date navigation.
- **Table view** — a date-grouped list with time, patient, doctor and **status pills** (Scheduled →
  Checked-in → In-progress → Completed / Cancelled / No-show), plus **search** and per-status filter
  chips.

Appointments carry rooms, durations and a full status workflow.

### 🦷 Treatments &amp; odontogram
Per-tooth clinical records. A **Kanban treatment board** with **drag-and-drop** between statuses
(Planned → In-progress → Needs follow-up → Completed → Billed → Archived) alongside a searchable
table view. A `TreatmentTooth` model captures **per-tooth notes**, and each patient has an
interactive **odontogram** tooth chart with a 10-state status per tooth. Treatment cost feeds the
patient balance and revenue reporting.

### 💳 Finances
**Payments** (money in) and **Expenses** (money out) built as **one consistent system** — green for
in, red for out. Each opens with a **summary strip** (Payments: total received, this month, top
method, a by-method breakdown; Expenses: total spent, pending approval, this-month-vs-last, top
category), then a **date-grouped ledger** with per-day subtotals. Payments show a method chip
(card / cash / transfer / insurance) with the patient as the primary line; expenses show the vendor
with a colored category chip, **Approve / Pending** status pills, and an **expense-approval
workflow** with inline approve-on-hover.

### 📊 Reports &amp; analytics
Answers "**is the practice healthy?**" before it shows a single chart:

- A **KPI strip** — total patients, revenue this month (with % vs. last month), **no-show rate**, and
  outstanding balance.
- A **didn't-happen callout** that surfaces the share of appointments that were no-shows or
  cancellations — the number a clinic owner needs to see, not bury.
- A unified chart system: three matching **donuts** (payment status, appointments overview, common
  treatments), revenue vs. expense **trend** charts with 3M/6M/12M toggles, expenses by category, a
  staff-performance bar, patient demographics and an **appointment heatmap** — all on one
  CVD-validated palette, with semantic red/amber/green reserved strictly for good/warning/bad.

Everything is role-aware and **CSV-exportable**.

### 🧑‍💼 Staff management
A role-based directory (searchable, role-filtered) where each member opens a **management profile**,
not a business card: for doctors, real **activity metrics** (appointments, completion rate, assigned
patients, attributed revenue), an **upcoming schedule**, assigned-patient chips, and the granular
access grid described above.

### 🔐 Auth &amp; platform
JWT authentication with a single 401→logout interceptor; **TanStack Query** caches every main screen
so navigation is instant (revisits are served from cache, refreshed in the background); a home-grown
design system (teal *Clinic Pulse* brand, Inter + Space Grotesk, shared motion tokens, branded
skeletons and empty states).

---

## Tech stack

| Layer | Technologies |
|------|--------------|
| **Frontend** | React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · TanStack Query 5 · React Router 7 · Framer Motion · Radix UI · Recharts 3 · Axios · Lucide · Sonner |
| **Backend** | Node.js 20+ · Express 4 · TypeScript · Prisma 5 · JWT · bcryptjs · Zod · Helmet · Pino · Multer |
| **Database** | PostgreSQL 15+ |
| **Tooling** | ESLint · ts-node-dev · Prisma Migrate · Docker (optional) |

The design system is home-grown: a teal **"Clinic Pulse"** brand, Inter for body + Space Grotesk
for display, a shared motion vocabulary, and a CVD-validated chart palette.

---

## Getting started

### Prerequisites

- **Node.js 20+** and npm
- **PostgreSQL 15+** (local install or Docker)

### 1. Clone

```bash
git clone https://github.com/YahiaKerroum/Dentist-Management-System.git
cd Dentist-Management-System/dental-clinic-app
```

### 2. Start PostgreSQL (Docker option)

```bash
docker run -d --name clinic-pulse-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dental_clinic_db \
  -p 5432:5432 postgres:15
```

### 3. Configure the backend environment

Create `dental-clinic-app/backend/.env`:

```properties
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dental_clinic_db?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/dental_clinic_db?schema=public"
JWT_SECRET="change_this_to_a_strong_secret"
PORT=4000
```

Optionally create `dental-clinic-app/frontend/.env` to point the client at the API
(defaults to `http://localhost:4000/api`):

```properties
VITE_API_URL="http://localhost:4000/api"
```

### 4. Install, migrate &amp; seed the backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy   # or: npx prisma migrate dev --name init
npm run seed                # loads demo staff, patients, appointments, treatments, payments
```

### 5. Run the backend

```bash
npm run dev                 # http://localhost:4000  (health: /health)
```

### 6. Run the frontend

```bash
cd ../frontend
npm install
npm run dev                 # http://localhost:5173
```

Open **http://localhost:5173** and sign in with a demo account below.

---

## Demo accounts

The seed script creates ready-to-use accounts (all share the same password):

| Role | Username | Password |
|------|----------|----------|
| Manager | `manager` | `password123` |
| Doctor | `doctor` | `password123` |
| Assistant | `assistant` | `password123` |

> Use the **Manager** account for the full experience (finances, reports, staff).
> The login screen also has a "Demo accounts" shortcut that fills these in for you.

---

## Available scripts

**Backend** (`dental-clinic-app/backend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the API in watch mode (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run seed` | Seed the database with demo data |

**Frontend** (`dental-clinic-app/frontend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

---

## Roles &amp; permissions

Four base roles set sensible defaults for what each screen shows:

| Capability | Manager | Doctor | Assistant |
|------------|:------:|:-----:|:--------:|
| Clinic Pulse dashboard | ✅ | ✅ | ✅ |
| Patients | ✅ | ✅ | ✅ |
| Appointments | ✅ | ✅ | ✅ |
| Treatments &amp; odontogram | ✅ | ✅ | ✅ |
| Finances (payments &amp; expenses) | ✅ | ✅ | ✅ |
| Reports &amp; analytics | ✅ (all) | ✅ (own) | ✅ (subset) |
| Staff management | ✅ | — | — |

…and on top of that, a Manager can **override any single action** (view / create / update / delete)
for any feature, per staff member — see [Granular permission control](#-granular-permission-control----the-signature-feature).
Every grant is enforced server-side on the route, not just hidden in the UI.

---

## Project structure

```
Dentist-Management-System/
└── dental-clinic-app/
    ├── backend/
    │   ├── src/
    │   │   ├── controllers/     # HTTP request/response handling
    │   │   ├── services/        # Business logic (reports, appointments, finances, …)
    │   │   ├── routes/          # API endpoint definitions
    │   │   ├── middleware/      # Auth, validation, error handling
    │   │   ├── utils/           # Shared helpers (JWT, Drive, permissions)
    │   │   ├── scripts/         # Database seed
    │   │   ├── app.ts           # Express app setup
    │   │   └── server.ts        # Entry point
    │   └── prisma/
    │       ├── schema.prisma    # Data models & relationships
    │       └── migrations/      # Versioned schema changes
    ├── frontend/
    │   └── src/
    │       ├── pages/           # Screen-level components (ClinicPulse, Patients, …)
    │       ├── components/      # UI primitives, layout, feature components
    │       │   ├── ui/          # Design-system primitives (Button, Card, BrandMark, …)
    │       │   ├── layout/      # Sidebar, header, main layout
    │       │   ├── appointments/ patients/ treatments/ finances/ staff/ reports/
    │       ├── services/        # Typed API client functions
    │       ├── lib/             # Query keys, motion tokens, chart theme
    │       ├── contexts/        # Auth context
    │       ├── routes/          # React Router configuration
    │       └── types/           # Shared TypeScript types
    └── docs/                    # Setup, API, database, and design docs
```

---

## Architecture &amp; data model

The backend is a layered Express app (routes → controllers → services → Prisma), and the frontend
is a routed React SPA that caches server state with TanStack Query.

<details>
<summary><strong>Domain model (UML class diagram)</strong></summary>

```mermaid
classDiagram
    class Staff {
        <<abstract>>
        -UserID: String
        -firstName: String
        -lastName: String
        -phone: String
        -email: String
        -username: String
        +login() Boolean
        +updateProfile() void
    }
    class Manager {
        +modifyPermissions(staff) void
        +approveExpense(expenseID) void
        +generateReport() Report
        +addStaff(staff) void
    }
    class Doctor {
        -specialization: String
        -workingTime: List~String~
        +createTreatment() Treatment
        +viewAppointments() List~Appointment~
        +completeTreatment(treatmentID) void
    }
    class Assistant {
        +scheduleAppointment() Appointment
        +registerPatient() Patient
        +recordPayment() Payment
    }
    class Patient {
        -firstName: String
        -lastName: String
        -dateOfBirth: Date
        -primaryDentistID: String
        +getOutstandingBalance() Decimal
        +viewTreatmentHistory() List~Treatment~
    }
    class Appointment {
        -dateOfTreatment: Date
        -status: Enum
        -typeOfTreatment: Enum
        -roomID: String
        +reschedule(newDate) void
        +updateStatus(status) void
    }
    class Treatment {
        -dateOfTreatment: Date
        -status: Enum
        -cost: Decimal
        +addNotes(notes) void
        +scheduleFollowUp() Appointment
    }
    class Payment {
        -amount: Decimal
        -method: Enum
        -date: Date
    }
    class Expense {
        -category: String
        -paidTo: String
        -approved: Boolean
        +requestApproval() void
    }

    Staff <|-- Manager
    Staff <|-- Doctor
    Staff <|-- Assistant
    Patient "1" -- "0..*" Treatment : receives
    Patient "1" -- "0..*" Appointment : books
    Doctor "1" -- "0..*" Appointment : has
    Doctor "1" -- "0..*" Treatment : creates
    Patient "1" -- "0..*" Payment : makes
    Manager -- Expense : approves
    Manager -- Staff : supervises
```

</details>

---

## Documentation

More detailed docs live in [`dental-clinic-app/docs/`](dental-clinic-app/docs/):

| Doc | What it covers |
|-----|----------------|
| [setup.md](dental-clinic-app/docs/setup.md) | Full local setup & troubleshooting |
| [api.md](dental-clinic-app/docs/api.md) | REST API endpoints |
| [database.md](dental-clinic-app/docs/database.md) | Prisma schema & relationships |
| [components.md](dental-clinic-app/docs/components.md) | Frontend component reference |
| [REDESIGN_STATUS.md](dental-clinic-app/docs/REDESIGN_STATUS.md) | Product/design overhaul status & decisions |

---

## Roadmap

- [ ] Treatment plans + cost estimator + e-signature / consent
- [ ] Online booking + automated appointment reminders
- [ ] Patient portal (separate patient login)
- [ ] Medical alerts / allergies on the patient record
- [ ] Automated tests &amp; CI

---

## License

This project was built for educational purposes. See the repository for license details.

<div align="center">
<br />
<sub>Built with React, Express, Prisma & PostgreSQL · <strong>Clinic Pulse</strong></sub>
</div>
