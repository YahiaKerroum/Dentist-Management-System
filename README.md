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
    <td width="50%"><img src="docs/screenshots/patients.png" alt="Patients records table" /><p align="center"><strong>Patients</strong> — a sortable records table with next appointment, balance, last visit and status.</p></td>
    <td width="50%"><img src="docs/screenshots/patient-detail.png" alt="Patient detail" /><p align="center"><strong>Patient record</strong> — balance, alerts, next appointment and a live activity feed.</p></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/appointments.png" alt="Appointments" /><p align="center"><strong>Appointments</strong> — chair/day planner and a date-grouped list with status pills.</p></td>
    <td width="50%"><img src="docs/screenshots/treatments.png" alt="Treatments board" /><p align="center"><strong>Treatments</strong> — a Kanban board of treatment plans by clinical status.</p></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/finances-payments.png" alt="Finances payments" /><p align="center"><strong>Finances</strong> — payments and expenses as one system with summary strips.</p></td>
    <td width="50%"><img src="docs/screenshots/reports.png" alt="Reports and analytics" /><p align="center"><strong>Reports</strong> — revenue, payment status, appointments and treatment analytics.</p></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/staff-profile.png" alt="Staff profile" /><p align="center"><strong>Staff</strong> — a management view with per-person metrics, schedule and access.</p></td>
    <td width="50%"><img src="docs/screenshots/login.png" alt="Login" /><p align="center"><strong>Sign in</strong> — branded, role-based login.</p></td>
  </tr>
</table>

---

## Features

### 🩺 Clinic Pulse dashboard
A real-time command center: today's schedule, patients waiting / in treatment, chair occupancy,
revenue collected today vs. yesterday, pending patient balances, follow-ups due, and expenses
awaiting approval — all from a single aggregation endpoint, never fabricated.

### 👥 Patients
A working records table sortable by **next appointment, outstanding balance, last visit and
status** (active/inactive derived from real visit history). Quick actions on hover, a full patient
record with a balance-and-alerts snapshot, and a reverse-chronological activity feed.

### 📅 Appointments
A **chair/day planner** (drag to reschedule, per-chair rows) plus a date-grouped table view,
status workflow (Scheduled → Checked-in → In-progress → Completed / Cancelled / No-show), rooms,
and durations.

### 🦷 Treatments &amp; odontogram
Per-tooth clinical data: a **Kanban treatment board** by status (Planned, In-progress, Needs
follow-up, Completed, Billed, Archived), a `TreatmentTooth` model for per-tooth notes, and an
interactive **odontogram** tooth chart on each patient.

### 💳 Finances
**Payments** (money in) and **Expenses** (money out) designed as one consistent system: summary
strips (total, this month, by method / pending approval), date-grouped ledgers with per-day
subtotals, method chips, and an expense approval workflow.

### 📊 Reports &amp; analytics
Revenue trends, payment status, appointments overview, most-common treatments, expenses by
category, staff performance and an appointment heatmap — role-aware and CSV-exportable, built on a
single validated chart palette.

### 🧑‍💼 Staff management
Role-based staff directory with a rich profile view: per-doctor activity metrics (appointments,
completion rate, assigned patients, attributed revenue), upcoming schedule, and access.

### 🔐 Auth &amp; access control
JWT authentication with a single 401→logout interceptor, four roles (Manager / Doctor / Assistant /
Receptionist) and granular per-user permissions.

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

| Capability | Manager | Doctor | Assistant |
|------------|:------:|:-----:|:--------:|
| Clinic Pulse dashboard | ✅ | ✅ | ✅ |
| Patients | ✅ | ✅ | ✅ |
| Appointments | ✅ | ✅ | ✅ |
| Treatments &amp; odontogram | ✅ | ✅ | ✅ |
| Finances (payments &amp; expenses) | ✅ | ✅ | ✅ |
| Reports &amp; analytics | ✅ (all) | ✅ (own) | ✅ (subset) |
| Staff management | ✅ | — | — |

Access is enforced by role plus granular per-user permissions on the backend.

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
