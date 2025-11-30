# Database Schema Documentation

## Overview

The database schema for the Dentist Management System uses PostgreSQL with Prisma ORM. It implements a role-based access control system with relationships between staff, patients, appointments, treatments, and financial records.

---

## Database Models

### User
Represents all staff members in the system.

**Fields:**
- `id` (String, UUID, PK)
- `firstName` (String)
- `lastName` (String)
- `phone` (String, Optional)
- `email` (String, Unique)
- `username` (String, Unique)
- `passwordHash` (String)
- `role` (Enum: MANAGER, DOCTOR, ASSISTANT, RECEPTIONIST)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- One-to-One with Doctor/Manager/Assistant profile
- One-to-Many with Appointments (creator)
- One-to-Many with Patients (registered by)
- One-to-Many with Payments (recorded by)
- One-to-Many with Expenses (created/approved by)
- Self-relation for supervision hierarchy

---

### Doctor
Extended profile for users with DOCTOR role.

**Fields:**
- `id` (String, UUID, PK)
- `userId` (String, FK → User, Unique)
- `specialization` (String, Optional)
- `workingTime` (JSON, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- One-to-One with User
- One-to-Many with Appointments
- One-to-Many with Treatments
- One-to-Many with Patients (primary dentist)

---

### Manager
Extended profile for users with MANAGER role.

**Fields:**
- `id` (String, UUID, PK)
- `userId` (String, FK → User, Unique)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- One-to-One with User

---

### Assistant
Extended profile for users with ASSISTANT role.

**Fields:**
- `id` (String, UUID, PK)
- `userId` (String, FK → User, Unique)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- One-to-One with User

---

### Patient
Represents patients receiving dental care.

**Fields:**
- `id` (String, UUID, PK)
- `firstName` (String)
- `lastName` (String)
- `dateOfBirth` (DateTime, Optional)
- `phone` (String, Optional)
- `email` (String, Optional)
- `primaryDentistId` (String, FK → Doctor, Optional)
- `registeredById` (String, FK → User, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Many-to-One with Doctor (primary dentist)
- Many-to-One with User (registered by)
- One-to-Many with Appointments
- One-to-Many with Treatments
- One-to-Many with Payments

---

### Appointment
Represents scheduled appointments between doctors and patients.

**Fields:**
- `id` (String, UUID, PK)
- `doctorId` (String, FK → Doctor)
- `patientId` (String, FK → Patient)
- `dateOfTreatment` (DateTime)
- `status` (Enum: SCHEDULED, COMPLETED, CANCELLED, NO_SHOW)
- `typeOfTreatment` (Enum: CONSULTATION, FILLING, EXTRACTION, ROOT_CANAL, CLEANING, IMPLANT, ORTHODONTICS, OTHER, Optional)
- `notes` (String, Optional)
- `procedure` (String, Optional)
- `teethInvolved` (Int[], Default: [])
- `followUpRequired` (Boolean, Default: false)
- `createdByUserId` (String, FK → User, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Many-to-One with Doctor
- Many-to-One with Patient
- Many-to-One with User (creator)
- One-to-Many with Treatments

---

### Treatment
Records of completed dental treatments.

**Fields:**
- `id` (String, UUID, PK)
- `doctorId` (String, FK → Doctor)
- `patientId` (String, FK → Patient)
- `dateOfTreatment` (DateTime)
- `typeOfTreatment` (Enum: CONSULTATION, FILLING, EXTRACTION, ROOT_CANAL, CLEANING, IMPLANT, ORTHODONTICS, OTHER)
- `notes` (String, Optional)
- `procedure` (String, Optional)
- `teethInvolved` (Int[], Default: [])
- `followUpRequired` (Boolean, Default: false)
- `completed` (Boolean, Default: false)
- `appointmentId` (String, FK → Appointment, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Many-to-One with Doctor
- Many-to-One with Patient
- Many-to-One with Appointment (optional)

---

### Payment
Financial records of patient payments.

**Fields:**
- `id` (String, UUID, PK)
- `patientId` (String, FK → Patient)
- `recordedById` (String, FK → User, Optional)
- `date` (DateTime, Default: now)
- `amount` (Decimal, Precision: 10.2)
- `method` (Enum: CASH, CARD, INSURANCE, TRANSFER)
- `notes` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Many-to-One with Patient
- Many-to-One with User (recorded by)

---

### Expense
Clinic operational expenses.

**Fields:**
- `id` (String, UUID, PK)
- `category` (String)
- `paidTo` (String)
- `amount` (Decimal, Precision: 10.2)
- `date` (DateTime, Default: now)
- `recordedById` (String, FK → User, Optional)
- `approved` (Boolean, Default: false)
- `approvedById` (String, FK → User, Optional)
- `notes` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Many-to-One with User (recorded by)
- Many-to-One with User (approved by)

---

### AuditLog
System audit trail for tracking user actions.

**Fields:**
- `id` (String, UUID, PK)
- `actorId` (String, FK → User, Optional)
- `action` (String)
- `target` (String, Optional)
- `meta` (JSON, Optional)
- `createdAt` (DateTime)

**Relations:**
- Many-to-One with User (actor)

---

## Enums

### Role
```prisma
enum Role {
  MANAGER
  DOCTOR
  ASSISTANT
  RECEPTIONIST
}
```

### AppointmentStatus
```prisma
enum AppointmentStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

### TreatmentType
```prisma
enum TreatmentType {
  CONSULTATION
  FILLING
  EXTRACTION
  ROOT_CANAL
  CLEANING
  IMPLANT
  ORTHODONTICS
  OTHER
}
```

### PaymentMethod
```prisma
enum PaymentMethod {
  CASH
  CARD
  INSURANCE
  TRANSFER
}
```

---

## Relationships Diagram

```
User
 ├─ 1:1 → Doctor
 ├─ 1:1 → Manager
 ├─ 1:1 → Assistant
 ├─ 1:N → Appointment (created)
 ├─ 1:N → Patient (registered)
 ├─ 1:N → Payment (recorded)
 ├─ 1:N → Expense (recorded/approved)
 └─ Self → User (supervision)

Doctor
 ├─ 1:N → Appointment
 ├─ 1:N → Treatment
 └─ 1:N → Patient (primary)

Patient
 ├─ N:1 → Doctor (primary)
 ├─ 1:N → Appointment
 ├─ 1:N → Treatment
 └─ 1:N → Payment

Appointment
 ├─ N:1 → Doctor
 ├─ N:1 → Patient
 ├─ N:1 → User (creator)
 └─ 1:N → Treatment

Treatment
 ├─ N:1 → Doctor
 ├─ N:1 → Patient
 └─ N:1 → Appointment (optional)
```

---

## Indexes

Prisma automatically creates indexes for:
- Primary keys (id fields)
- Unique constraints (email, username)
- Foreign keys

For optimal performance, consider adding indexes on:
- `Appointment.dateOfTreatment`
- `Patient.phone`
- `Payment.date`
- `Expense.date`

---

## Database Commands

### Generate Prisma Client
```bash
npx prisma generate
```

### Push Schema to Database
```bash
npx prisma db push
```

### Create Migration
```bash
npx prisma migrate dev --name <migration_name>
```

### Seed Database
```bash
npm run seed
```

### Reset Database
```bash
npx prisma migrate reset
```

### Open Prisma Studio
```bash
npx prisma studio
```

---

## Connection String Format

```
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"
```

**Components:**
- `user` - PostgreSQL username
- `password` - PostgreSQL password
- `localhost` - Database host
- `5432` - PostgreSQL port
- `database` - Database name
- `schema=public` - Schema name
