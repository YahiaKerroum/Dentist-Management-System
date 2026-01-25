# Service Layer - Complete Line-by-Line Documentation

## Architecture Overview

The service layer implements the **business logic** of the application. It sits between controllers (HTTP layer) and Prisma (database layer).

**Why this architecture?**
- **Separation of Concerns:** Business logic is isolated from HTTP handling
- **Reusability:** Services can be called from multiple controllers or other services
- **Testability:** Services can be unit tested without HTTP context
- **Maintainability:** Changes to business logic don't affect routing/controllers

---

## 1. AuthService

### Purpose
Handles user authentication and password management.

---

### Method: `login(username: string, password: string)`

**Purpose:** Authenticate a user and return JWT tokens.

```typescript
static async login(username: string, password: string) {
```
**Why static?** Service methods are stateless utilities - no need for instances.  
**Why async?** Database operations are asynchronous.

```typescript
    const user = await prisma.user.findFirst({
        where: {
            OR: [{ username }, { email: username }],
        },
```
**Why `findFirst` with OR?** Allows login with either username OR email for better UX.  
**Why OR clause?** User might forget whether they used username or email.

```typescript
        include: {
            doctorProfile: true,
            managerProfile: true,
            assistantProfile: true,
        },
    });
```
**Why include profiles?** Need to return complete user data including role-specific profile.  
**Why all three?** User will have exactly one profile based on their role.

```typescript
    if (!user) {
        throw new UnauthorizedError("Invalid credentials");
    }
```
**Why UnauthorizedError?** 401 status code for authentication failures.  
**Why generic message?** Security best practice - don't reveal if username exists.

```typescript
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid credentials");
    }
```
**Why separate password check?** Could combine with user check, but this is clearer.  
**Why same error message?** Again, security - don't reveal if username or password was wrong.  
**Why use utility function?** Centralized bcrypt comparison logic.

```typescript
    const payload: JWTPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    };
```
**Why create payload object?** JWT needs specific fields, not entire user object.  
**Why include role?** Used for authorization checks without database queries.  
**Why NOT include password?** Never put sensitive data in JWT.

```typescript
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
```
**Why two tokens?** Standard practice - short-lived access token + long-lived refresh token.  
**Why separate functions?** Different expiration times configured in utilities.

```typescript
    return {
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            role: user.role,
            profile: user.doctorProfile || user.managerProfile || user.assistantProfile,
        },
        accessToken,
        refreshToken,
    };
```
**Why filter user fields?** Don't return passwordHash to client.  
**Why use || for profile?** User has exactly one profile; returns whichever exists.  
**Why return all this?** Frontend needs user info + tokens for state management.

---

### Method: `changePassword(userId, oldPassword, newPassword)`

```typescript
static async changePassword(userId: string, oldPassword: string, newPassword: string) {
```
**Why require userId?** From authenticated token - user can only change own password.  
**Why require oldPassword?** Security - verify user knows current password.

```typescript
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    
    if (!user) {
        throw new UnauthorizedError("User not found");
    }
```
**Why findUnique?** Faster than findFirst when querying by primary key.  
**Why throw error?** Should never happen with valid JWT, but defensive programming.

```typescript
    const isPasswordValid = await comparePassword(oldPassword, user.passwordHash);
    
    if (!isPasswordValid) {
        throw new BadRequestError("Current password is incorrect");
    }
```
**Why BadRequestError?** 400 status - client error (wrong password).  
**Why different from UnauthorizedError?** This is authenticated user making mistake.

```typescript
    const hashedPassword = await hashPassword(newPassword);
```
**Why hash new password?** Never store plain text passwords.  
**Why await?** bcrypt hashing is CPU-intensive async operation.

```typescript
    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
    });
```
**Why update directly?** Simple operation, no need for complex logic.  
**Why not validate password strength?** Should be done at controller/validation layer.

```typescript
    return { message: "Password changed successfully" };
```
**Why return message?** Confirm operation succeeded to client.

---

## 2. UserService

### Purpose
Manages staff user accounts and their role-specific profiles.

---

### Method: `createUser(data)`

```typescript
static async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: string;
    phone?: string;
    specialization?: string;
    workingTime?: any;
}) {
```
**Why single data object?** Easier to extend, better than 10 separate parameters.  
**Why optional fields?** Not all fields apply to all roles.

```typescript
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ username: data.username }, { email: data.email }],
        },
    });
    
    if (existingUser) {
        throw new ConflictError("Username or email already exists");
    }
```
**Why check before creating?** Better error message than Prisma unique constraint error.  
**Why check both?** Both username and email must be unique.  
**Why ConflictError?** 409 status code for resource conflicts.

```typescript
    const passwordHash = await hashPassword(data.password);
```
**Why hash before transaction?** If hashing fails, no database changes made.

```typescript
    const user = await prisma.user.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            username: data.username,
            passwordHash,
            phone: data.phone,
            role: data.role,
        },
    });
```
**Why create user first?** Need userId for profile foreign key.  
**Why not use nested create?** More complex logic needed per role.

```typescript
    if (data.role === "DOCTOR") {
        await prisma.doctor.create({
            data: {
                userId: user.id,
                specialization: data.specialization,
                workingTime: data.workingTime,
            },
        });
    }
```
**Why separate creates?** Each role has different profile structure.  
**Why if-else chain?** TypeScript can't discriminate unions without explicit checks.  
**Why not use transaction?** Should ideally use transaction - room for improvement.

```typescript
    const createdUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            doctorProfile: true,
            managerProfile: true,
            assistantProfile: true,
        },
    });
```
**Why query again?** To get user with profile included.  
**Why not return from create?** Nested creates are complex with conditional logic.

```typescript
    const { passwordHash: _, ...userWithoutPassword } = createdUser!;
    return userWithoutPassword;
```
**Why destructure?** Removes passwordHash from returned object.  
**Why underscore?** Convention for unused variables.  
**Why non-null assertion (!)?** We just created it, guaranteed to exist.

---

### Method: `getAllUsers(filters)`

```typescript
static async getAllUsers(filters?: { role?: string; search?: string }) {
```
**Why optional filters?** Can fetch all users or filtered subset.  
**Why string types?** Comes from query parameters (always strings).

```typescript
    const where: any = {};
```
**Why any type?** Prisma where clause has complex conditional structure.  
**Why empty object?** Build where clause conditionally.

```typescript
    if (filters?.role) {
        where.role = filters.role;
    }
```
**Why optional chaining?** filters might be undefined.  
**Why simple assignment?** Exact role match is what we want.

```typescript
    if (filters?.search) {
        where.OR = [
            { firstName: { contains: filters.search, mode: "insensitive" } },
            { lastName: { contains: filters.search, mode: "insensitive" } },
            { email: { contains: filters.search, mode: "insensitive" } },
            { username: { contains: filters.search, mode: "insensitive" } },
        ];
    }
```
**Why OR?** Match if ANY field contains search term.  
**Why contains?** Partial matching for better UX.  
**Why insensitive?** Case-insensitive search.  
**Why multiple fields?** User might search by any identifier.

```typescript
    const users = await prisma.user.findMany({
        where,
        include: {
            doctorProfile: true,
            managerProfile: true,
            assistantProfile: true,
        },
    });
```
**Why findMany?** Returns array of users.  
**Why include profiles?** Frontend needs complete user data.

```typescript
    return users.map(({ passwordHash, ...user }) => user);
```
**Why map?** Remove passwordHash from each user.  
**Why destructure in map?** Cleaner than delete operation.

---

### Method: `getUserById(id)`

```typescript
static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            doctorProfile: true,
            managerProfile: true,
            assistantProfile: true,
        },
    });
    
    if (!user) {
        throw new NotFoundError("User not found");
    }
```
**Why  findUnique?** Querying by primary key.  
**Why throw NotFoundError?** 404 status code for missing resources.

```typescript
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
```
**Why remove password?** Security - never expose password hashes.

---

### Method: `updateUser(id, data)`

```typescript
static async updateUser(id: string, data: { ... }) {
    const user = await prisma.user.findUnique({
        where: { id },
    });
    
    if (!user) {
        throw new NotFoundError("User not found");
    }
```
**Why check existence first?** Better error message than Prisma error.

```typescript
    if (data.username && data.username !== user.username) {
        const existing = await prisma.user.findUnique({
            where: { username: data.username },
        });
        if (existing) {
            throw new ConflictError("Username already exists");
        }
    }
```
**Why check username uniqueness?** Prevent duplicate usernames.  
**Why check !== current?** Allow updating other fields without username conflict.  
**Why similar check for email?** Both must be unique.

```typescript
    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            username: data.username,
            phone: data.phone,
        },
    });
```
**Why explicit fields?** Don't update role or password via this method.  
**Why not spread data?** Type safety - only update allowed fields.

```typescript
    if (user.role === "DOCTOR") {
        await prisma.doctor.update({
            where: { userId: id },
            data: {
                specialization: data.specialization,
                workingTime: data.workingTime,
            },
        });
    }
```
**Why update profile separately?** Different tables require separate queries.  
**Why check role?** Only update the profile that exists.

---

### Method: `deleteUser(id)`

```typescript
static async deleteUser(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
    });
    
    if (!user) {
        throw new NotFoundError("User not found");
    }
```
**Why check first?** Return 404 if user doesn't exist, not Prisma error.

```typescript
    await prisma.user.delete({
        where: { id },
    });
```
**Why simple delete?** Prisma handles cascade deletes based on schema.  
**Why no profile deletion?** Schema has onDelete: Cascade, automatic cleanup.

```typescript
    return { message: "User deleted successfully" };
```
**Why return message?** Confirm deletion to client.

---

## 3. PatientService

### Purpose
Manages patient records and medical history.

---

### Method: `createPatient(data, registeredById)`

```typescript
static async createPatient(
    data: { firstName, lastName, dateOfBirth, phone, email, primaryDentistId },
    registeredById?: string
) {
```
**Why separate registeredById?** Comes from authenticated user context, not request body.  
**Why optional?** System-created patients might not have registeredBy.

```typescript
    const patient = await prisma.patient.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            phone: data.phone,
            email: data.email,
            primaryDentistId: data.primaryDentistId,
            registeredById,
        },
        include: {
            primaryDentist: {
                include: {
                    user: true,
                },
            },
            registeredBy: true,
        },
    });
```
**Why include primaryDentist?** Return complete patient info with dentist details.  
**Why nested include user?** Doctor profile alone isn't useful without user data.  
**Why include registeredBy?** Audit trail - know who registered patient.

```typescript
    return patient;
```
**Why return full object?** Unlike users, no sensitive data to hide.

---

### Method: `getAllPatients(filters)`

```typescript
static async getAllPatients(filters?: { search?: string; primaryDentistId?: string }) {
    const where: any = {};
    
    if (filters?.primaryDentistId) {
        where.primaryDentistId = filters.primaryDentistId;
    }
```
**Why filter by dentist?** Common use case - see "my patients".

```typescript
    if (filters?.search) {
        where.OR = [
            { firstName: { contains: filters.search, mode: "insensitive" } },
            { lastName: { contains: filters.search, mode: "insensitive" } },
            { phone: { contains: filters.search } },
            { email: { contains: filters.search, mode: "insensitive" } },
        ];
    }
```
**Why search multiple fields?** User might search by name, phone, or email.  
**Why no mode on phone?** Phone numbers are typically searched exactly.

```typescript
    const patients = await prisma.patient.findMany({
        where,
        include: {
            primaryDentist: {
                include: {
                    user: true,
                },
            },
            _count: {
                select: {
                    appointments: true,
                    treatments: true,
                    payments: true,
                },
            },
        },
    });
```
**Why _count?** Efficient way to get counts without loading all related records.  
**Why count these tables?** Useful metrics for patient profile.

---

### Method: `getPatientHistory(id)`

```typescript
static async getPatientHistory(id: string) {
    const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
            appointments: {
                include: {
                    doctor: {
                        include: {
                            user: true,
                        },
                    },
                    createdByUser: true,
                },
                orderBy: {
                    dateOfTreatment: "desc",
                },
            },
```
**Why include doctor and createdBy?** Full context of who treated and who scheduled.  
**Why orderBy desc?** Most recent appointments first.

```typescript
            treatments: {
                include: {
                    doctor: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: {
                    dateOfTreatment: "desc",
                },
            },
```
**Why separate from appointments?** Treatments can exist without appointments.  
**Why same ordering?** Chronological display.

```typescript
            payments: {
                include: {
                    recordedBy: true,
                },
                orderBy: {
                    date: "desc",
                },
            },
        },
    });
    
    if (!patient) {
        throw new NotFoundError("Patient not found");
    }
    
    return patient;
```
**Why single query?** Efficient - one database roundtrip for all data.  
**Why this structure?** Complete medical and financial history.

---

## 4. AppointmentService

### Purpose
Manages appointment scheduling and status tracking.

---

### Method: `createAppointment(data, createdByUserId)`

```typescript
static async createAppointment(
    data: {
        doctorId, patientId, dateOfTreatment, typeOfTreatment,
        notes, procedure, teethInvolved, followUpRequired
    },
    createdByUserId?: string
) {
```
**Why separate createdByUserId?** Audit trail - track who scheduled appointment.

```typescript
    const appointment = await prisma.appointment.create({
        data: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            dateOfTreatment: data.dateOfTreatment,
            status: "SCHEDULED",
            typeOfTreatment: data.typeOfTreatment,
            notes: data.notes,
            procedure: data.procedure,
            teethInvolved: data.teethInvolved || [],
            followUpRequired: data.followUpRequired || false,
            createdByUserId,
        },
```
**Why hardcode status: "SCHEDULED"?** New appointments are always scheduled.  
**Why default empty array for teeth?** Prevent null issues.  
**Why default false for followUp?** Safer than undefined.

```typescript
        include: {
            doctor: {
                include: {
                    user: true,
                },
            },
            patient: true,
            createdByUser: true,
        },
    });
```
**Why include all relations?** Return complete appointment context.

---

### Method: `getAllAppointments(filters)`

```typescript
static async getAllAppointments(filters?: {
    doctorId?: string;
    patientId?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
}) {
```
**Why so many filters?** Common queries - "my appointments", "today's schedule", etc.

```typescript
    const where: any = {};
    
    if (filters?.doctorId) {
        where.doctorId = filters.doctorId;
    }
    
    if (filters?.patientId) {
        where.patientId = filters.patientId;
    }
    
    if (filters?.status) {
        where.status = filters.status;
    }
```
**Why simple assignments?** These are exact matches.

```typescript
    if (filters?.dateFrom || filters?.dateTo) {
        where.dateOfTreatment = {};
        if (filters.dateFrom) {
            where.dateOfTreatment.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
            where.dateOfTreatment.lte = filters.dateTo;
        }
    }
```
**Why gte/lte?** Greater-than-or-equal, less-than-or-equal for date ranges.  
**Why nested object?** Prisma DateTimeFilter syntax.  
**Why check both independently?** Can filter by just start or just end date.

```typescript
    return await prisma.appointment.findMany({
        where,
        include: {
            doctor: {
                include: {
                    user: true,
                },
            },
            patient: true,
        },
        orderBy: {
            dateOfTreatment: "desc",
        },
    });
```
**Why orderBy desc?** Most recent first is usually what's needed.

---

### Method: `updateAppointmentStatus(id, status)`

```typescript
static async updateAppointmentStatus(id: string, status: string) {
    const appointment = await prisma.appointment.findUnique({
        where: { id },
    });
    
    if (!appointment) {
        throw new NotFoundError("Appointment not found");
    }
```
**Why check first?** Custom error message.

```typescript
    return await prisma.appointment.update({
        where: { id },
        data: { status },
        include: {
            doctor: {
                include: {
                    user: true,
                },
            },
            patient: true,
        },
    });
```
**Why separate method?** Status updates are common, deserve dedicated endpoint.  
**Why include relations?** Return updated appointment with full context.

---

## 5. TreatmentService

### Purpose
Records completed dental treatments and procedures.

---

### Method: `createTreatment(data)`

```typescript
static async createTreatment(data: {
    doctorId, patientId, dateOfTreatment, typeOfTreatment,
    notes, procedure, teethInvolved, followUpRequired, appointmentId
}) {
```
**Why include appointmentId?** Link treatment to appointment it came from.

```typescript
    const treatment = await prisma.treatment.create({
        data: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            dateOfTreatment: data.dateOfTreatment,
            typeOfTreatment: data.typeOfTreatment,
            notes: data.notes,
            procedure: data.procedure,
            teethInvolved: data.teethInvolved || [],
            followUpRequired: data.followUpRequired || false,
            completed: false,
            appointmentId: data.appointmentId,
        },
```
**Why completed: false?** Treatments start as incomplete.  
**Why default values?** Prevent null/undefined issues.

```typescript
        include: {
            doctor: {
                include: {
                    user: true,
                },
            },
            patient: true,
            appointment: true,
        },
    });
    
    return treatment;
```
**Why include appointment?** Track which appointment led to treatment.

---

### Method: `markCompleted(id)`

```typescript
static async markCompleted(id: string) {
    const treatment = await prisma.treatment.findUnique({
        where: { id },
    });
    
    if (!treatment) {
        throw new NotFoundError("Treatment not found");
    }
```
**Why check first?** Better error handling.

```typescript
    return await prisma.treatment.update({
        where: { id },
        data: { completed: true },
        include: {
            doctor: {
                include: {
                    user: true,
                },
            },
            patient: true,
        },
    });
```
**Why dedicated method?** Common operation, simple to call.  
**Why set to true?** Mark treatment as finished.

---

## 6. PaymentService

### Purpose
Handles financial transactions and revenue tracking.

---

### Method: `createPayment(data, recordedById)`

```typescript
static async createPayment(
    data: { patientId, amount, method, notes },
    recordedById?: string
) {
```
**Why recordedById?** Audit trail - track who processed payment.

```typescript
    const payment = await prisma.payment.create({
        data: {
            patientId: data.patientId,
            amount: data.amount,
            method: data.method,
            notes: data.notes,
            recordedById,
            date: new Date(),
        },
```
**Why set date?** Record when payment was made.  
**Why new Date()?** Server time is authoritative.

```typescript
        include: {
            patient: true,
            recordedBy: true,
        },
    });
    
    return payment;
```
**Why include recordedBy?** Know who processed transaction.

---

### Method: `getTotalRevenue(filters)`

```typescript
static async getTotalRevenue(filters?: { dateFrom?: Date; dateTo?: Date }) {
    const where: any = {};
    
    if (filters?.dateFrom || filters?.dateTo) {
        where.date = {};
        if (filters.dateFrom) {
            where.date.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
            where.date.lte = filters.dateTo;
        }
    }
```
**Why date filtering?** Calculate revenue for specific periods.

```typescript
    const result = await prisma.payment.aggregate({
        where,
        _sum: {
            amount: true,
        },
    });
```
**Why aggregate?** Efficient - database calculates sum.  
**Why _sum?** Prisma syntax for aggregation.

```typescript
    return Number(result._sum.amount || 0);
```
**Why Number()?** Prisma returns Decimal, convert to number.  
**Why || 0?** Default to 0 if no payments.

---

## 7. ExpenseService

### Purpose
Manages clinic operational expenses with approval workflow.

---

### Method: `createExpense(data, recordedById)`

```typescript
static async createExpense(
    data: { category, paidTo, amount, notes },
    recordedById?: string
) {
    const expense = await prisma.expense.create({
        data: {
            category: data.category,
            paidTo: data.paidTo,
            amount: data.amount,
            notes: data.notes,
            recordedById,
            date: new Date(),
            approved: false,
        },
```
**Why approved: false?** Expenses require manager approval.  
**Why recordedById?** Track who created expense.

```typescript
        include: {
            recordedBy: true,
        },
    });
    
    return expense;
```

---

### Method: `approveExpense(id, approvedById)`

```typescript
static async approveExpense(id: string, approvedById: string) {
    const expense = await prisma.expense.findUnique({
        where: { id },
    });
    
    if (!expense) {
        throw new NotFoundError("Expense not found");
    }
```
**Why check first?** Validate expense exists.

```typescript
    if (expense.approved) {
        throw new ForbiddenError("Expense already approved");
    }
```
**Why check if approved?** Prevent double-approval.  
**Why ForbiddenError?** 403 - action not allowed.

```typescript
    return await prisma.expense.update({
        where: { id },
        data: {
            approved: true,
            approvedById,
        },
        include: {
            recordedBy: true,
            approvedBy: true,
        },
    });
```
**Why track approvedById?** Accountability - know who approved.  
**Why include both users?** Complete audit trail.

---

## 8. ReportService

### Purpose
Generates analytics and statistical reports.

---

### Method: `getDashboardStats()`

```typescript
static async getDashboardStats() {
    const [
        totalPatients,
        totalAppointments,
        totalTreatments,
        totalRevenue,
        totalExpenses,
    ] = await Promise.all([
        prisma.patient.count(),
        prisma.appointment.count(),
        prisma.treatment.count(),
        PaymentService.getTotalRevenue(),
        ExpenseService.getTotalExpenses({ approved: true }),
    ]);
```
**Why Promise.all?** Run queries in parallel for speed.  
**Why count()?** Fast - doesn't load data.  
**Why call other services?** Reuse existing logic.  
**Why only approved expenses?** Unapproved don't affect finances yet.

```typescript
    const profit = totalRevenue - totalExpenses;
```
**Why calculate profit?** Basic financial metric.

```typescript
    return {
        totalPatients,
        totalAppointments,
        totalTreatments,
        totalRevenue,
        totalExpenses,
        profit,
    };
```
**Why return object?** Clean structure for frontend.

---

### Method: `getFinancialReport(dateFrom, dateTo)`

```typescript
static async getFinancialReport(dateFrom?: Date, dateTo?: Date) {
    const [revenue, expenses, payments, expensesList] = await Promise.all([
        PaymentService.getTotalRevenue({ dateFrom, dateTo }),
        ExpenseService.getTotalExpenses({ approved: true, dateFrom, dateTo }),
        PaymentService.getAllPayments({ dateFrom, dateTo }),
        ExpenseService.getAllExpenses({ approved: true, dateFrom, dateTo }),
    ]);
```
**Why parallel queries?** Performance optimization.  
**Why fetch totals AND lists?** Need totals for summary, lists for breakdowns.

```typescript
    const revenueByMethod = payments.reduce((acc, payment) => {
        const method = payment.method;
        acc[method] = (acc[method] || 0) + Number(payment.amount);
        return acc;
    }, {} as Record<string, number>);
```
**Why reduce?** Transform array into grouped object.  
**Why Record<string, number>?** TypeScript type for key-value pairs.  
**Why || 0?** Initialize if method not seen before.  
**Why Number()?** Convert Decimal to number.

```typescript
    const expensesByCategory = expensesList.reduce((acc, expense) => {
        const category = expense.category;
        acc[category] = (acc[category] || 0) + Number(expense.amount);
        return acc;
    }, {} as Record<string, number>);
```
**Why same pattern?** Group expenses by category.

```typescript
    return {
        revenue,
        expenses,
        profit: revenue - expenses,
        revenueByMethod,
        expensesByCategory,
    };
```
**Why this structure?** Comprehensive financial overview.

---

### Method: `getAppointmentStats(dateFrom, dateTo)`

```typescript
static async getAppointmentStats(dateFrom?: Date, dateTo?: Date) {
    const where: any = {};
    
    if (dateFrom || dateTo) {
        where.dateOfTreatment = {};
        if (dateFrom) {
            where.dateOfTreatment.gte = dateFrom;
        }
        if (dateTo) {
            where.dateOfTreatment.lte = dateTo;
        }
    }
```
**Why build where clause?** Support optional date filtering.

```typescript
    const [total, byStatus, byDoctor] = await Promise.all([
        prisma.appointment.count({ where }),
        prisma.appointment.groupBy({
            by: ["status"],
            where,
            _count: true,
        }),
        prisma.appointment.groupBy({
            by: ["doctorId"],
            where,
            _count: true,
        }),
    ]);
```
**Why groupBy?** SQL GROUP BY - count per category.  
**Why by status?** See how many scheduled/completed/cancelled.  
**Why by doctor?** See doctor's workload.

```typescript
    const statusCounts = byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
    }, {} as Record<string, number>);
```
**Why transform?** Convert array to object for easier access.

```typescript
    return {
        total,
        byStatus: statusCounts,
        totalByDoctor: byDoctor.length,
    };
```
**Why this structure?** Multiple perspectives on appointment data.

---

## Design Patterns Used

### 1. **Static Methods**
All service methods are static because services are stateless utilities.

### 2. **Async/Await**
All database operations use async/await for clean asynchronous code.

### 3. **Error Throwing**
Services throw custom errors that middleware converts to HTTP responses.

### 4. **Data Transformation**
Services transform database results before returning (e.g., removing passwords).

### 5. **Filter Pattern**
Many methods accept optional filter objects for flexible querying.

### 6. **Include Pattern**
Services use Prisma's include to fetch related data efficiently.

### 7. **Validation**
Services validate business rules and throw appropriate errors.

### 8. **Separation of Concerns**
Services don't know about HTTP - only business logic.

---

## Best Practices Applied

✅ **Single Responsibility:** Each service handles one domain  
✅ **DRY:** Services reuse each other (e.g., ReportService calls PaymentService)  
✅ **Error Handling:** Descriptive custom errors with appropriate status codes  
✅ **Type Safety:** TypeScript types for parameters and return values  
✅ **Efficiency:** Use of aggregate, count, and parallel queries  
✅ **Security:** Never expose password hashes  
✅ **Audit Trail:** Track who created/modified records  
✅ **Defaults:** Sensible defaults for optional fields  
✅ **Consistency:** Similar patterns across all services  

---

## Performance Optimizations

1. **Parallel Queries:** `Promise.all` for independent queries
2. **Aggregations:** Database-level calculations (count, sum)
3. **Selective Includes:** Only load needed relations
4. **Efficient Filtering:** Database-level filtering vs application-level
5. **Count vs FindMany:** Use count() when only number needed

---

This documentation explains the complete service layer architecture and every design decision made!
