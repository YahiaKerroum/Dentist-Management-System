# Backend API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Get Access Token

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "manager",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "Admin",
      "lastName": "Manager",
      "email": "manager@clinic.com",
      "username": "manager",
      "role": "MANAGER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Role-Based Access Control

### Roles
- **MANAGER** - Full access to all resources
- **DOCTOR** - Access to patients, appointments, treatments, reports
- **ASSISTANT** - Access to patients, appointments, payments
- **RECEPTIONIST** - Limited access

### Permissions Matrix

| Resource | Create | Read | Update | Delete | Special Actions |
|----------|--------|------|--------|--------|-----------------|
| **Users** | Manager | All | Manager | Manager | - |
| **Patients** | Manager, Assistant | All | Manager, Assistant | Manager | View History (Manager, Doctor) |
| **Appointments** | All Staff | All Staff | All Staff | Manager, Assistant | Update Status (All Staff) |
| **Treatments** | Manager, Doctor | Manager, Doctor | Manager, Doctor | - | Mark Complete (Manager, Doctor) |
| **Payments** | Manager, Assistant | Manager, Assistant | - | - | - |
| **Expenses** | Manager | Manager | - | - | Approve (Manager) |
| **Reports** | - | Manager (Financial), Manager+Doctor (Dashboard) | - | - | - |

---

## API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

---

### Users

#### Create User
```http
POST /api/users
Authorization: Bearer <token>
Roles: MANAGER
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "username": "string",
  "password": "string",
  "role": "MANAGER | DOCTOR | ASSISTANT",
  "phone": "string",
  "specialization": "string",
  "workingTime": {}
}
```

#### Get All Users
```http
GET /api/users?role=DOCTOR&search=john
Authorization: Bearer <token>
Roles: MANAGER, DOCTOR, ASSISTANT
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Roles: MANAGER
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
Roles: MANAGER
```

---

### Patients

#### Create Patient
```http
POST /api/patients
Authorization: Bearer <token>
Roles: MANAGER, ASSISTANT
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "2000-01-01T00:00:00Z",
  "phone": "string",
  "email": "string",
  "primaryDentistId": "uuid"
}
```

#### Get All Patients
```http
GET /api/patients?search=john&primaryDentistId=uuid
```

#### Get Patient by ID
```http
GET /api/patients/:id
```

#### Get Patient History
```http
GET /api/patients/:id/history
Roles: MANAGER, DOCTOR
```

#### Update Patient
```http
PUT /api/patients/:id
Roles: MANAGER, ASSISTANT
```

#### Delete Patient
```http
DELETE /api/patients/:id
Roles: MANAGER
```

---

### Appointments

#### Create Appointment
```http
POST /api/appointments
```

**Request Body:**
```json
{
  "doctorId": "uuid",
  "patientId": "uuid",
  "dateOfTreatment": "2025-01-01T10:00:00Z",
  "typeOfTreatment": "CONSULTATION",
  "notes": "string",
  "teethInvolved": [1, 2, 3]
}
```

#### Get All Appointments
```http
GET /api/appointments?doctorId=uuid&status=SCHEDULED&dateFrom=2025-01-01
```

#### Update Appointment Status
```http
PATCH /api/appointments/:id/status

{
  "status": "SCHEDULED | COMPLETED | CANCELLED | NO_SHOW"
}
```

---

### Treatments

#### Create Treatment
```http
POST /api/treatments
Roles: MANAGER, DOCTOR
```

#### Mark Treatment as Completed
```http
PATCH /api/treatments/:id/complete
```

---

### Payments

#### Create Payment
```http
POST /api/payments
Roles: MANAGER, ASSISTANT

{
  "patientId": "uuid",
  "amount": 150.00,
  "method": "CASH | CARD | INSURANCE | TRANSFER"
}
```

---

### Expenses

#### Create Expense
```http
POST /api/expenses
Roles: MANAGER
```

#### Approve Expense
```http
PATCH /api/expenses/:id/approve
Roles: MANAGER
```

---

### Reports

#### Get Dashboard Statistics
```http
GET /api/reports/dashboard
Roles: MANAGER, DOCTOR
```

#### Get Financial Report
```http
GET /api/reports/financial?dateFrom=2025-01-01&dateTo=2025-12-31
Roles: MANAGER
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

---

## Test Accounts

| Role | Username | Email | Password |
|------|----------|-------|----------|
| Manager | manager | manager@clinic.com | password123 |
| Doctor | doctor | doctor@clinic.com | password123 |
| Assistant | assistant | assistant@clinic.com | password123 |

---

## Health Check

```http
GET /health
```

Returns server status without authentication.
