# Sprint 2 Documentation: Authentication, User Management & Patient Features

**Project:** Dentist Management System  
**Sprint Duration:** Sprint 2  
**Sprint Goal:** Implement authentication, user account management, patient management, and dashboard functionality  
**Status:** Completed ✅

---

## Table of Contents
1. [Sprint Overview](#sprint-overview)
2. [Authentication System](#authentication-system)
3. [User Management](#user-management)
4. [Patient Management](#patient-management)
5. [Dashboard Features](#dashboard-features)
6. [UI Components & Styling](#ui-components--styling)
7. [Permission System](#permission-system)
8. [API Endpoints](#api-endpoints)
9. [Security Implementation](#security-implementation)

---

## Sprint Overview

### Objectives
- Implement secure JWT-based authentication
- Create user account management system
- Build patient management features (CRUD operations)
- Develop dashboard with key metrics
- Implement role-based access control (RBAC)
- Design modern UI with Tailwind CSS

### Key Achievements
- ✅ Complete authentication flow (login, logout, token refresh)
- ✅ User CRUD operations with role management
- ✅ Patient management with detailed views
- ✅ Interactive dashboard with statistics
- ✅ Permission-based access control
- ✅ Modern responsive UI design
- ✅ Form validation and error handling

---

## Authentication System

### Login Flow

#### Backend Implementation

**Service Layer** (`auth.service.ts`)
```typescript
static async login(username: string, password: string) {
  // 1. Find user by username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email: username }],
    },
    include: {
      doctorProfile: true,
      managerProfile: true,
      assistantProfile: true,
    },
  });

  // 2. Validate credentials
  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // 3. Generate JWT tokens
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // 4. Return user data and tokens
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
}
```

**JWT Utilities** (`jwt.utils.ts`)
```typescript
export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
}

export const signAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};
```

**Authentication Middleware** (`auth.middleware.ts`)
```typescript
export const authenticate = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);
  
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};
```

#### Frontend Implementation

**Login Component** (`Login.tsx`)
```typescript
const Login: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData.username, formData.password);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with icons and validation */}
    </form>
  );
};
```

**Modern Login UI Features:**
- Mint color theme (#3DBEA3)
- Icon-based input fields (User, Lock icons)
- Loading states with spinner
- Error message display with AlertCircle icon
- Responsive design
- Smooth transitions and hover effects

### Password Security

**Hashing Implementation** (`password.utils.ts`)
```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

**Password Change Flow**
```typescript
static async changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
) {
  // 1. Verify old password
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isValid = await comparePassword(oldPassword, user.passwordHash);
  
  if (!isValid) {
    throw new BadRequestError("Current password is incorrect");
  }

  // 2. Hash and update new password
  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword },
  });
}
```

---

## User Management

### User CRUD Operations

#### Backend API

**User Service** (`user.service.ts`)
```typescript
export class UserService {
  // Create user with automatic profile creation
  static async createUser(data: CreateUserDTO) {
    const hashedPassword = await hashPassword(data.password);
    
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
      },
    });

    // Create role-specific profile
    if (data.role === 'DOCTOR') {
      await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          specialization: data.specialization,
          workingTime: data.workingTime,
        },
      });
    }

    return user;
  }

  // Get all users with filters
  static async getAllUsers(filters?: {
    role?: Role;
    search?: string;
  }) {
    return prisma.user.findMany({
      where: {
        role: filters?.role,
        OR: filters?.search ? [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        doctorProfile: true,
        managerProfile: true,
        assistantProfile: true,
      },
    });
  }

  // Update user
  static async updateUser(id: string, data: UpdateUserDTO) {
    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
    };

    // Update doctor-specific fields
    if (data.specialization !== undefined) {
      await prisma.doctorProfile.update({
        where: { userId: id },
        data: {
          specialization: data.specialization,
          workingTime: data.workingTime,
        },
      });
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      include: { doctorProfile: true },
    });
  }
}
```

#### Frontend Staff Management

**Staff Form Modal** (`StaffFormModal.tsx`)

**Features:**
- Modern mint-themed design
- Icon-prefixed input fields
- Role-based conditional fields
- Working hours management for doctors
- Permission management interface
- Real-time validation

**Working Hours Management:**
```typescript
const [formData, setFormData] = useState({
  workingTime: [] as Array<{ day: string; hours: string }>
});

const addWorkingHour = () => {
  setFormData({
    ...formData,
    workingTime: [...formData.workingTime, { day: 'Monday', hours: '09:00-17:00' }]
  });
};

// Array safety check to prevent crashes
useEffect(() => {
  if (staff) {
    let workingTimeArray: Array<{ day: string; hours: string }> = [];
    if (staff.doctorProfile?.workingTime) {
      if (Array.isArray(staff.doctorProfile.workingTime)) {
        workingTimeArray = staff.doctorProfile.workingTime;
      }
    }
    setFormData({ ...formData, workingTime: workingTimeArray });
  }
}, [staff]);
```

**UI Improvements:**
- Rounded input fields (rounded-xl)
- Mint focus rings: `focus:ring-2 focus:ring-[#3DBEA3]/30`
- Icon-based labels (User, Mail, Lock, Phone, Stethoscope, Shield)
- Gradient backgrounds for better visual hierarchy
- Smooth transitions and hover states

**Staff Table** (`StaffTable.tsx`)
- Searchable and filterable by role
- Displays user information with role badges
- Edit and delete actions (permission-based)
- Doctor-specific information (specialization, patient count)
- Responsive grid layout

---

## Patient Management

### Patient CRUD Operations

#### Backend API

**Patient Service** (`patient.service.ts`)
```typescript
export class PatientService {
  static async createPatient(data: CreatePatientDTO) {
    return prisma.patient.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        primaryDentistId: data.primaryDentistId,
      },
      include: {
        primaryDentist: {
          include: { user: true }
        }
      },
    });
  }

  static async getAllPatients(filters?: {
    search?: string;
    primaryDentistId?: string;
  }) {
    return prisma.patient.findMany({
      where: {
        primaryDentistId: filters?.primaryDentistId,
        OR: filters?.search ? [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        primaryDentist: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

#### Frontend Patient Management

**Patient Form** (`PatientForm.tsx`)

**Modern Design Features:**
- Icon-prefixed inputs (User, Mail, Phone, Calendar, Stethoscope)
- Mint color scheme throughout
- Real-time doctor selection dropdown
- Date picker for date of birth
- Responsive two-column grid layout
- Error display with AlertCircle icon

**Form Structure:**
```typescript
<form onSubmit={handleSubmit} className="space-y-5">
  {/* Error Alert */}
  {error && (
    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl">
      <AlertCircle size={18} />
      {error}
    </div>
  )}

  {/* Name Fields Grid */}
  <div className="grid grid-cols-2 gap-4">
    {/* First Name with User icon */}
    {/* Last Name with User icon */}
  </div>

  {/* Contact Fields Grid */}
  <div className="grid grid-cols-2 gap-4">
    {/* Email with Mail icon */}
    {/* Phone with Phone icon */}
  </div>

  {/* Date of Birth with Calendar icon */}
  {/* Primary Doctor dropdown with Stethoscope icon */}
  
  {/* Action Buttons */}
  <div className="flex gap-3 pt-4 border-t border-gray-100">
    <Button type="submit" className="flex-1 bg-[#3DBEA3]">
      {mode === 'add' ? 'Add Patient' : 'Save Changes'}
    </Button>
    <Button type="button" variant="secondary" className="flex-1">
      Cancel
    </Button>
  </div>
</form>
```

**Patient Detail Page** (`PatientDetailPage.tsx`)

**Overview Tab - Patient Dashboard:**
- **Summary Statistics Cards:**
  - Total Treatments (mint gradient)
  - Scheduled Appointments (blue gradient)
  - Last Visit Date (purple gradient)
  
- **Contact Information Card:**
  - Email, Phone, Date of Birth
  - Icon-based display
  
- **Recent Activity Timeline:**
  - Latest treatment with type and date
  - Last completed appointment
  - Next scheduled appointment
  - Color-coded activity dots
  
- **Treatment Summary Grid:**
  - Total treatments count
  - All appointments count
  - Completed visits count
  - Documents count

**Data Loading Strategy:**
```typescript
// Load appointments and treatments on component mount for overview
useEffect(() => {
  fetchAppointments();
  fetchTreatments();
}, [patient.id]);

// Calculate statistics
const upcomingAppointments = appointments.filter(
  a => a.status === 'SCHEDULED'
).length;

const lastVisit = appointments
  .filter(a => a.status === 'COMPLETED')
  .sort((a, b) => new Date(b.dateOfTreatment) - new Date(a.dateOfTreatment))[0];
```

**Treatments Tab:**
- List of all patient treatments
- Treatment type, date, doctor
- Teeth involved display
- Notes and procedures
- Follow-up indicators

**Appointments Tab:**
- Scheduled appointments list
- Status badges (Scheduled, Completed, Cancelled)
- Date and time display
- Doctor assignment
- Quick actions (edit, cancel)

**Documents Tab:**
- Document upload functionality
- File type categorization
- View/download options
- Delete with confirmation
- Upload progress indicator

**Modal Enhancements:**
```typescript
// Modern modal header with icon
<div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-xl bg-[#3DBEA3]/10 flex items-center justify-center">
    <UserPlus size={20} className="text-[#3DBEA3]" />
  </div>
  <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
</div>
```

---

## Dashboard Features

### Dashboard Layout

**Dashboard Page** (`DashboardPage.tsx`)

**Key Metrics Cards:**
1. **Total Patients**
   - Count of all patients
   - Calendar icon
   - Mint color theme

2. **Today's Appointments**
   - Count of scheduled appointments for current day
   - Users icon
   - Blue color theme

3. **Revenue (This Month)**
   - Sum of completed payments
   - DollarSign icon
   - Green color theme

4. **Active Treatments**
   - Count of ongoing treatments
   - Stethoscope icon
   - Purple color theme

**Recent Appointments Section:**
- Table with upcoming appointments
- Patient name, doctor, date/time
- Status indicators
- Quick navigation to details

**Recent Patients Section:**
- Newly registered patients
- Contact information display
- View details button

**Quick Actions:**
- Add New Patient button
- Schedule Appointment button
- View Reports button
- Modern card-based layout

---

## UI Components & Styling

### Design System

**Color Palette:**
- **Primary (Mint):** #3DBEA3
- **Primary Hover:** #35a892
- **Secondary (Gray):** #6b7280
- **Success:** #10b981
- **Warning:** #f59e0b
- **Error:** #ef4444
- **Background:** #f9fafb

**Typography:**
- **Font Family:** System UI fonts
- **Headings:** font-semibold to font-bold
- **Body:** font-normal, text-sm to text-base
- **Labels:** font-medium, text-sm

**Component Patterns:**

**Button Component:**
```typescript
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors';
  
  const variantStyles = {
    primary: 'text-white hover:opacity-90',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };

  const variantInlineStyles = {
    primary: { backgroundColor: '#3DBEA3' },
    secondary: {},
    destructive: {},
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{ ...variantInlineStyles[variant] }}
      {...props}
    >
      {children}
    </button>
  );
};
```

**Input Component Pattern:**
```typescript
<div className="relative">
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <IconComponent size={18} className="text-gray-400" />
  </div>
  <input
    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3] transition-all"
    placeholder="Enter value"
  />
</div>
```

**Modal Component:**
- Backdrop blur effect
- Rounded corners (rounded-2xl)
- Shadow and elevation
- Sticky header
- Scrollable content area
- Icon-enhanced header

---

## Permission System

### Permission Structure

**Permission Format:** `{resource}.{action}`

**Resource Types:**
- `patients` - Patient management
- `appointments` - Appointment management
- `treatments` - Treatment records
- `payment` - Payment processing
- `documents` - Document management
- `users` - User management (admin)

**Action Types:**
- `view` - Read access
- `create` - Create new records
- `update` - Modify existing records
- `delete` - Remove records

**Permission Examples:**
- `patients.view` - View patient list
- `patients.create` - Add new patients
- `appointments.update` - Modify appointments
- `treatments.delete` - Remove treatment records
- `payment.view` - View payment information

### Permission Management

#### Backend Implementation

**Get User Permissions:**
```typescript
static async getUserPermissions(userId: string): Promise<string[]> {
  const userPermissions = await prisma.userPermission.findMany({
    where: { userId },
    include: { permission: true },
  });

  return userPermissions.map(up => up.permission.name);
}
```

**Get Current User Permissions (New in Sprint 2):**
```typescript
// Controller method for self-permission fetch
static getMyPermissions = asyncHandler(async (req: any, res: Response) => {
  const perms = await UserService.getUserPermissions(req.user.userId);
  sendSuccess(res, perms);
});
```

**Grant Permission:**
```typescript
static async grantPermission(userId: string, permissionName: string) {
  const permission = await prisma.permission.findUnique({
    where: { name: permissionName },
  });

  await prisma.userPermission.create({
    data: {
      userId,
      permissionId: permission.id,
    },
  });
}
```

**Revoke Permission:**
```typescript
static async revokePermission(userId: string, permissionName: string) {
  const userPermission = await prisma.userPermission.findFirst({
    where: {
      userId,
      permission: { name: permissionName },
    },
  });

  await prisma.userPermission.delete({
    where: { id: userPermission.id },
  });
}
```

#### Frontend Permission Service

**Permission Service** (`user.service.ts`)
```typescript
// Get current user's permissions (accessible by all authenticated users)
export const getMyPermissions = async (
  token: string
): Promise<{ success: boolean; data: string[] }> => {
  const response = await fetch(`${API_URL}/me/permissions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch permissions');
  }

  return response.json();
};

// Get other user's permissions (manager only)
export const getUserPermissions = async (
  id: string,
  token: string
): Promise<{ success: boolean; data: string[] }> => {
  const response = await fetch(`${API_URL}/${id}/permissions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch permissions');
  }

  return response.json();
};
```

**Permission Check Pattern:**
```typescript
// In React components
const canEditPatient = userPermissions.includes('patients.update');
const canDeletePatient = userPermissions.includes('patients.delete');
const canCreateAppointment = userPermissions.includes('appointments.create');

// Conditional rendering
{canEditPatient && (
  <Button onClick={handleEdit}>Edit</Button>
)}

{canDeletePatient && (
  <Button variant="destructive" onClick={handleDelete}>Delete</Button>
)}
```

**Permission Management UI:**

In `StaffFormModal.tsx`:
```typescript
const permissionGroups = [
  {
    key: 'patients',
    label: 'Patients',
    actions: [
      { label: 'View', value: 'patients.view' },
      { label: 'Create', value: 'patients.create' },
      { label: 'Update', value: 'patients.update' },
      { label: 'Delete', value: 'patients.delete' },
    ],
  },
  // ... more groups
];

// Render permission checkboxes
{permissionGroups.map((group) => (
  <div key={group.key} className="border border-gray-200 rounded-xl p-4">
    <div className="font-semibold text-sm mb-3">{group.label}</div>
    <div className="grid grid-cols-2 gap-2">
      {group.actions.map((action) => (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={permissions.includes(action.value)}
            onChange={() => togglePermission(action.value)}
            className="w-4 h-4 text-[#3DBEA3] border-gray-300 rounded focus:ring-[#3DBEA3]"
          />
          <span className="text-gray-700">{action.label}</span>
        </label>
      ))}
    </div>
  </div>
))}
```

### Role-Based Access Control (RBAC)

**Backend Authorization Middleware** (`rbac.middleware.ts`)
```typescript
export const authorize = (...allowedRoles: Role[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};
```

**Route Protection:**
```typescript
// Manager-only routes
router.post("/", authorize(Role.MANAGER), UserController.create);
router.delete("/:id", authorize(Role.MANAGER), UserController.delete);

// Multi-role routes
router.get("/", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), UserController.getAll);

// Self-access routes (any authenticated user)
router.get("/me", UserController.getMe);
router.get("/me/permissions", UserController.getMyPermissions);
```

---

## API Endpoints

### Authentication Endpoints

```
POST /api/auth/login
  Body: { username: string, password: string }
  Response: { user: User, accessToken: string, refreshToken: string }

POST /api/auth/change-password
  Headers: Authorization: Bearer <token>
  Body: { oldPassword: string, newPassword: string }
  Response: { message: string }
```

### User Endpoints

```
GET /api/users
  Headers: Authorization: Bearer <token>
  Query: ?role=DOCTOR&search=john
  Response: { data: User[] }

GET /api/users/me
  Headers: Authorization: Bearer <token>
  Response: { data: User }

GET /api/users/me/permissions
  Headers: Authorization: Bearer <token>
  Response: { data: string[] }

POST /api/users
  Headers: Authorization: Bearer <token>
  Body: CreateUserDTO
  Response: { data: User }

GET /api/users/:id
  Headers: Authorization: Bearer <token>
  Response: { data: User }

PUT /api/users/:id
  Headers: Authorization: Bearer <token>
  Body: UpdateUserDTO
  Response: { data: User }

DELETE /api/users/:id
  Headers: Authorization: Bearer <token>
  Response: { message: string }

GET /api/users/:id/permissions
  Headers: Authorization: Bearer <token>
  Response: { data: string[] }

POST /api/users/:id/permissions
  Headers: Authorization: Bearer <token>
  Body: { permissionName: string }
  Response: { message: string }

DELETE /api/users/:id/permissions/:permissionName
  Headers: Authorization: Bearer <token>
  Response: { message: string }
```

### Patient Endpoints

```
GET /api/patients
  Headers: Authorization: Bearer <token>
  Query: ?search=john&primaryDentistId=uuid
  Response: { data: Patient[] }

POST /api/patients
  Headers: Authorization: Bearer <token>
  Body: CreatePatientDTO
  Response: { data: Patient }

GET /api/patients/:id
  Headers: Authorization: Bearer <token>
  Response: { data: Patient }

PUT /api/patients/:id
  Headers: Authorization: Bearer <token>
  Body: UpdatePatientDTO
  Response: { data: Patient }

DELETE /api/patients/:id
  Headers: Authorization: Bearer <token>
  Response: { message: string }
```

---

## Security Implementation

### Security Measures

1. **Password Security:**
   - bcrypt hashing with salt rounds: 10
   - No plain-text password storage
   - Password strength requirements enforced

2. **JWT Security:**
   - Access tokens expire in 24 hours
   - Refresh tokens for extended sessions
   - Token verification on every protected route

3. **Authorization:**
   - Role-based access control
   - Fine-grained permission system
   - Middleware-based route protection

4. **Input Validation:**
   - Email format validation
   - Required field validation
   - Type checking with TypeScript

5. **Error Handling:**
   - Custom error classes
   - Centralized error middleware
   - No sensitive data in error messages

6. **CORS Configuration:**
   - Restricted origins in production
   - Credentials support for cookies
   - Proper headers handling

### Error Handling System

**Custom Error Classes** (`app.errors.ts`)
```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}
```

**Error Middleware** (`error.middleware.ts`)
```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error('Unexpected error:', err);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
```

---

## Key Bug Fixes & Improvements

### 1. Staff Form Working Time Array Safety
**Issue:** Crash when editing doctors due to `workingTime.map is not a function`  
**Fix:** Added array validation before mapping:
```typescript
let workingTimeArray: Array<{ day: string; hours: string }> = [];
if (staff.doctorProfile?.workingTime) {
  if (Array.isArray(staff.doctorProfile.workingTime)) {
    workingTimeArray = staff.doctorProfile.workingTime;
  }
}

// Runtime guard
{Array.isArray(formData.workingTime) && formData.workingTime.map(...)}
```

### 2. Patient Detail Page Crash
**Issue:** White screen due to missing `userRole` prop  
**Fix:** Added `userRole = ''` to component parameters

### 3. Permission Fetch 403 Error
**Issue:** Assistants and doctors couldn't fetch their own permissions  
**Root Cause:** `/api/users/:id/permissions` restricted to managers only  
**Fix:** Added `/api/users/me/permissions` endpoint accessible to all authenticated users

### 4. Default Role Selection
**Issue:** Staff form defaulted to "Doctor" role  
**Fix:** Changed default to "Assistant" role

### 5. Appointment Count Always Zero
**Issue:** Appointments not loaded for overview tab  
**Fix:** Added data fetching on component mount:
```typescript
useEffect(() => {
  fetchAppointments();
  fetchTreatments();
}, [patient.id]);
```

### 6. Scheduled Appointments Filter
**Issue:** Scheduled appointments showing 0 despite having data  
**Root Cause:** Filter checked for future dates AND scheduled status  
**Fix:** Removed future date requirement, showing all scheduled appointments

---

## Sprint Retrospective

### What Went Well
- ✅ Smooth authentication implementation
- ✅ Clean separation of concerns in code
- ✅ Modern and consistent UI design
- ✅ Comprehensive permission system
- ✅ Good error handling throughout

### Challenges & Solutions
- **Challenge:** Permission system 403 errors for non-managers
  - **Solution:** Created `/me/permissions` endpoint for self-access
  
- **Challenge:** Working time data structure inconsistency
  - **Solution:** Added defensive array checks and type validation
  
- **Challenge:** Form state management complexity
  - **Solution:** Implemented controlled components with proper validation

### Technical Debt
- Need comprehensive API documentation (Swagger/OpenAPI)
- Missing unit tests for services and controllers
- No automated testing for UI components
- Loading states could be more sophisticated

### Lessons Learned
- Always validate array types before mapping
- Provide self-service endpoints for common user data
- Design permissions early to avoid refactoring
- Modern UI requires consistent icon and color usage
- Type safety catches bugs early

---

## Next Sprint Preview (Sprint 3)

### Planned Features
- Appointment scheduling system
- Treatment management
- Payment processing
- Expense tracking
- Financial reports
- Analytics dashboard

### Technical Improvements
- Unit testing implementation
- API documentation
- Performance optimization
- Enhanced error logging
- Code coverage reporting

---

**Document Version:** 1.0  
**Last Updated:** January 26, 2026  
**Prepared By:** Development Team  
**Status:** Sprint Completed ✅
