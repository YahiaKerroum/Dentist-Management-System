# Sprint 1 Documentation: Project Initialization & Database Design

**Project:** Dentist Management System  
**Sprint Duration:** Sprint 1  
**Sprint Goal:** Project conceptualization, initial setup, and database schema design  
**Status:** Completed ✅

---

## Table of Contents
1. [Sprint Overview](#sprint-overview)
2. [Technical Stack Setup](#technical-stack-setup)
3. [Database Architecture](#database-architecture)
4. [Project Structure](#project-structure)
5. [Development Environment](#development-environment)
6. [Deliverables](#deliverables)

---

## Sprint Overview

### Objectives
- Establish project architecture and technology stack
- Design and implement database schema using Prisma ORM
- Set up development environment with Docker support
- Create initial project structure for frontend and backend
- Define core entities and relationships

### Key Achievements
- ✅ Monorepo structure established with pnpm workspace
- ✅ Database schema designed and migrated
- ✅ Docker configuration for PostgreSQL
- ✅ Backend API foundation with Express.js
- ✅ Frontend application scaffold with React + TypeScript + Vite
- ✅ Development workflow and tooling configured

---

## Technical Stack Setup

### Backend Technologies
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs

### Frontend Technologies
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Icons:** Lucide React
- **HTTP Client:** Native Fetch API

### DevOps & Tools
- **Package Manager:** pnpm
- **Containerization:** Docker & Docker Compose
- **Version Control:** Git
- **Code Quality:** ESLint, TypeScript strict mode

---

## Database Architecture

### Schema Overview
The database schema was designed following these principles:
- **Normalization:** 3NF compliance for data integrity
- **Referential Integrity:** Foreign key constraints
- **Scalability:** Designed for future growth
- **Audit Trail:** CreatedAt/UpdatedAt timestamps on all entities

### Core Entities

#### 1. User Entity
**Purpose:** Authentication and user management  
**Table:** `User`

```prisma
model User {
  id           String   @id @default(uuid())
  username     String   @unique
  email        String   @unique
  passwordHash String
  firstName    String
  lastName     String
  role         Role     @default(ASSISTANT)
  phone        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**Roles:**
- `MANAGER` - Full system access
- `DOCTOR` - Clinical operations
- `ASSISTANT` - Support operations
- `RECEPTIONIST` - Front desk operations

#### 2. Patient Entity
**Purpose:** Patient demographic and contact information  
**Table:** `Patient`

```prisma
model Patient {
  id                String    @id @default(uuid())
  firstName         String
  lastName          String
  email             String?
  phone             String?
  dateOfBirth       DateTime?
  primaryDentistId  String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

#### 3. Doctor Profile Entity
**Purpose:** Doctor-specific professional information  
**Table:** `DoctorProfile`

```prisma
model DoctorProfile {
  id             String   @id @default(uuid())
  userId         String   @unique
  specialization String?
  workingTime    Json?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

**Working Time Structure:**
```json
[
  { "day": "Monday", "hours": "09:00-17:00" },
  { "day": "Tuesday", "hours": "09:00-17:00" }
]
```

#### 4. Permission System
**Purpose:** Fine-grained access control  
**Tables:** `Permission`, `UserPermission`

```prisma
model Permission {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  resource    String
  action      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model UserPermission {
  id           String   @id @default(uuid())
  userId       String
  permissionId String
  grantedAt    DateTime @default(now())
  grantedBy    String?
}
```

**Permission Format:** `{resource}.{action}`
- Examples: `patients.view`, `appointments.create`, `treatments.update`

#### 5. Appointment Entity
**Purpose:** Schedule patient visits  
**Table:** `Appointment`

```prisma
model Appointment {
  id              String            @id @default(uuid())
  doctorId        String
  patientId       String
  dateOfTreatment DateTime
  status          AppointmentStatus @default(SCHEDULED)
  typeOfTreatment TreatmentType?
  notes           String?
  procedure       String?
  teethInvolved   Int[]
  followUpRequired Boolean         @default(false)
  createdByUserId String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}
```

**Status Values:**
- `SCHEDULED` - Confirmed appointment
- `COMPLETED` - Visit finished
- `CANCELLED` - Cancelled by patient/staff
- `NO_SHOW` - Patient didn't attend

#### 6. Treatment Entity
**Purpose:** Clinical treatment records  
**Table:** `Treatment`

```prisma
model Treatment {
  id              String        @id @default(uuid())
  doctorId        String
  patientId       String
  dateOfTreatment DateTime
  typeOfTreatment TreatmentType
  notes           String?
  procedure       String?
  teethInvolved   Int[]
  followUpRequired Boolean      @default(false)
  completed       Boolean       @default(false)
  appointmentId   String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

**Treatment Types:**
- `CONSULTATION`, `FILLING`, `EXTRACTION`, `ROOT_CANAL`, `CLEANING`, `IMPLANT`, `ORTHODONTICS`, `OTHER`

#### 7. Payment Entity
**Purpose:** Financial transaction tracking  
**Table:** `Payment`

```prisma
model Payment {
  id           String        @id @default(uuid())
  patientId    String
  amount       Decimal       @db.Decimal(10, 2)
  paymentDate  DateTime      @default(now())
  method       PaymentMethod
  status       PaymentStatus @default(PENDING)
  treatmentId  String?
  notes        String?
  createdBy    String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

**Payment Methods:** `CASH`, `CREDIT_CARD`, `INSURANCE`, `OTHER`  
**Payment Status:** `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`

#### 8. Expense Entity
**Purpose:** Clinic operational expenses  
**Table:** `Expense`

```prisma
model Expense {
  id          String        @id @default(uuid())
  amount      Decimal       @db.Decimal(10, 2)
  category    ExpenseCategory
  description String?
  expenseDate DateTime      @default(now())
  approvedBy  String?
  status      ExpenseStatus @default(PENDING)
  createdBy   String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

**Expense Categories:** `SUPPLIES`, `EQUIPMENT`, `UTILITIES`, `SALARIES`, `RENT`, `MAINTENANCE`, `OTHER`

#### 9. Document Entity
**Purpose:** Patient document management  
**Table:** `Document`

```prisma
model Document {
  id         String   @id @default(uuid())
  patientId  String
  name       String
  type       String
  url        String
  uploadedBy String?
  uploadedAt DateTime @default(now())
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### Entity Relationships

```
User (1) ────────── (1) DoctorProfile
  │
  ├── (1:N) UserPermission
  ├── (1:N) Appointment (as doctor)
  ├── (1:N) Treatment (as doctor)
  ├── (1:N) Appointment (as creator)
  └── (1:N) Document (as uploader)

Patient (1) ────────── (N) Appointment
  │
  ├── (1:N) Treatment
  ├── (1:N) Payment
  └── (1:N) Document

DoctorProfile (1) ─── (N) Patient (as primary dentist)

Appointment (1) ────── (0..1) Treatment

Permission (1) ────── (N) UserPermission
```

---

## Project Structure

### Monorepo Layout
```
dental-clinic-app/
├── backend/                 # Express.js API
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── seed.ts         # Initial data seeding
│   │   └── migrations/     # Database migrations
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   ├── errors/         # Custom error classes
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── ui/        # UI primitives
│   │   │   ├── layout/    # Layout components
│   │   │   ├── patients/  # Patient components
│   │   │   ├── staff/     # Staff components
│   │   │   └── ...
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript interfaces
│   │   ├── App.tsx        # Root component
│   │   └── main.tsx       # Entry point
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                   # Documentation
│   ├── api.md
│   ├── database.md
│   ├── setup.md
│   └── ...
│
├── docker-compose.yml      # Docker services
├── pnpm-workspace.yaml     # Workspace config
└── package.json            # Root package
```

### Backend Architecture Layers

#### 1. Routes Layer (`src/routes/`)
- Define API endpoints
- Apply middleware (authentication, authorization)
- Route requests to controllers

#### 2. Controllers Layer (`src/controllers/`)
- Handle HTTP requests/responses
- Validate request data
- Call service layer
- Format responses

#### 3. Services Layer (`src/services/`)
- Implement business logic
- Database operations via Prisma
- Data transformation
- Business rule enforcement

#### 4. Middleware Layer (`src/middleware/`)
- `auth.middleware.ts` - JWT authentication
- `rbac.middleware.ts` - Role-based access control
- `error.middleware.ts` - Centralized error handling
- `validate.middleware.ts` - Request validation
- `logger.middleware.ts` - Request logging

#### 5. Utils Layer (`src/utils/`)
- `jwt.utils.ts` - Token generation/verification
- `password.utils.ts` - Password hashing/comparison
- `response.utils.ts` - Standardized API responses
- `async.handler.ts` - Async error handling wrapper

### Frontend Architecture

#### Component Structure
```
components/
├── ui/                     # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── ...
├── layout/                 # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── ...
└── [feature]/             # Feature-specific components
    ├── [Feature]Form.tsx
    ├── [Feature]Table.tsx
    └── [Feature]Card.tsx
```

#### Service Layer Pattern
```typescript
// services/[entity].service.ts
export const getAll = async (token: string) => {
  const response = await fetch(`${API_URL}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

---

## Development Environment

### Environment Variables

#### Backend (`.env`)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dentist_db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
PORT=4000
NODE_ENV="development"
```

#### Frontend (`.env`)
```env
VITE_API_URL="http://localhost:4000/api"
```

### Database Setup

#### Using Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: dentist_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

#### Prisma Migration Commands
```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed
```

### Development Workflow

#### Starting the Application
```bash
# Terminal 1 - Database
docker-compose up -d

# Terminal 2 - Backend
cd backend
pnpm install
pnpm run dev

# Terminal 3 - Frontend
cd frontend
pnpm install
pnpm run dev
```

#### Build Process
```bash
# Backend
cd backend
pnpm run build

# Frontend
cd frontend
pnpm run build
```

---

## Deliverables

### Completed Items
1. ✅ **Database Schema**
   - All 12 core entities defined
   - Relationships established
   - Migrations created and tested

2. ✅ **Project Structure**
   - Monorepo with pnpm workspace
   - Backend API foundation
   - Frontend application scaffold

3. ✅ **Development Environment**
   - Docker Compose configuration
   - Environment variable templates
   - Development scripts

4. ✅ **Documentation**
   - Database schema documentation
   - Setup guide
   - Development workflow guide

### Database Migration History
```
20251125161706_init
  - Initial schema creation
  - All core entities
  - Relationships and indexes
```

---

## Technical Decisions

### Why Prisma ORM?
- **Type Safety:** Auto-generated TypeScript types
- **Developer Experience:** Intuitive API and great tooling
- **Migration Management:** Built-in migration system
- **Performance:** Efficient query generation

### Why Monorepo?
- **Code Sharing:** Shared types between frontend/backend
- **Simplified Deployment:** Single repository management
- **Dependency Management:** Centralized package management with pnpm

### Why PostgreSQL?
- **Relational Integrity:** Strong foreign key support
- **JSON Support:** Flexible schema for working hours
- **Scalability:** Proven performance at scale
- **Open Source:** No licensing costs

### Why JWT Authentication?
- **Stateless:** No server-side session storage
- **Scalable:** Easy to distribute across services
- **Standard:** Wide industry adoption

---

## Future Considerations (Sprint 2 Preview)

### Planned Features
- User authentication implementation
- Patient CRUD operations
- User management interface
- Dashboard creation
- Permission system implementation

### Technical Improvements
- API documentation with Swagger
- Unit testing setup
- Error logging system
- Database query optimization

---

## Sprint Retrospective

### What Went Well
- Clean database schema design
- Proper separation of concerns
- Type-safe development environment
- Docker integration for consistent development

### Challenges
- Initial Prisma learning curve
- Complex relationship modeling
- Permission system design decisions

### Lessons Learned
- Plan schema thoroughly before coding
- Use Prisma Studio for quick database inspection
- Keep migrations small and focused
- Document decisions early

---

**Document Version:** 1.0  
**Last Updated:** January 26, 2026  
**Prepared By:** Development Team  
**Status:** Sprint Completed ✅
