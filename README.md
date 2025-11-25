# Dentist-Management-System
The Dental Clinic Management System (DCMS) is a production-ready full-stack web application designed to streamline operations for dental clinics. It provides comprehensive management of patients, treatments, appointments, finances, and staff, with role-based access control for Managers, Doctors, and Assistants.

### Key Objectives
- **Efficiency**: Automate scheduling, billing, and record-keeping
- **Accuracy**: Maintain precise patient records and treatment history
- **Security**: Protect sensitive medical data with RBAC and encryption
- **Scalability**: Support multiple clinics and growing patient bases
- **Usability**: Intuitive interface for non-technical staff

### Target Users
- **Managers**: Clinic administrators managing staff, finances, and operations
- **Doctors**: Practitioners recording treatments and viewing schedules
- **Assistants**: Front-desk staff handling appointments and patient intake

### Architecture Layers

#### Backend Layers
1. **Routes** (`backend/src/routes/`): HTTP endpoint definitions
2. **Controllers** (`backend/src/controllers/`): Request/response handling
3. **Services** (`backend/src/services/`): Business logic
4. **Repositories** (Prisma): Data access
5. **Middleware** (`backend/src/middleware/`): Auth, validation, error handling
6. **Utils** (`backend/src/utils/`): Shared utilities

#### Frontend Layers
1. **Pages** (`frontend/src/pages/`): Screen-level components
2. **Components** (`frontend/src/components/`): Reusable UI components
3. **Services** (`frontend/src/services/api/`): API client functions
4. **Store** (`frontend/src/store/`): Zustand state management
5. **Hooks** (`frontend/src/hooks/`): Custom React hooks
6. **Routes** (`frontend/src/routes/`): React Router configuration

---

## Technology Stack

### Frontend
- **React 18.3**: UI library
- **TypeScript 5.4**: Type safety
- **Vite 5.2**: Build tool and dev server
- **Ant Design 5.19**: Component library
- **React Router 6.23**: Client-side routing
- **React Query 5.35**: Server state management
- **Zustand 4.5**: Client state management
- **Recharts 2.9**: Data visualization
- **Axios 1.7**: HTTP client
- **Day.js 1.11**: Date manipulation

### Backend
- **Node.js 20+**: Runtime
- **Express.js 4.19**: Web framework
- **TypeScript 5.4**: Type safety
- **Prisma 5.17**: ORM and database toolkit
- **PostgreSQL 15+**: Relational database
- **JWT (jsonwebtoken 9.0)**: Authentication
- **bcryptjs 2.4**: Password hashing
- **Zod 3.23**: Schema validation
- **Pino 9.1**: Logging
- **Helmet 7.1**: Security headers
- **CORS 2.8**: Cross-origin resource sharing

### Development Tools
- **pnpm 9.0**: Package manager
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Testing framework
- **Docker**: Containerization
- **Git**: Version control

## Project Structure

```
dental-clinic-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration (env, logger, prisma)
│   │   ├── uploads/         # Local file storage (created at runtime)
│   │   ├── controllers/     # Handle HTTP requests and responses
│   │   ├── errors/          # Custom error classes,and error handling
│   │   ├── middleware/      # Express middleware for Authentication, validation, and security
│   │   ├── routes/          # API endpoints and URL paths definitions
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript interfaces and type definitions
│   │   ├── utils/           # Helper functions, constants, and utilities
│   │   ├── scripts/         # Database seeding and maintenance scripts
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database models and relationships
│   │   ├── migrations/      # Database version control and changes
│   │   └── seed.ts          # Populate database with initial test data
│   ├── .env                 # Environment variables (create this)
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Shared UI components (buttons, forms, tables)
│   │   │   └── layout/      # Navigation, header, sidebar, footer
│   │   ├── pages/           # Page components
│   │   │   ├── auth/        # Login page
│   │   │   ├── dashboard/   # Role-specific dashboards
│   │   │   ├── patients/    # Patient management
│   │   │   ├── appointments/# Appointment scheduling
│   │   │   ├── finance/     # Financial management
│   │   │   ├── reports/      # Reports and analytics
│   │   │   ├── profile/      # User profiles
│   │   │   └── admin/       # Team management (Manager only)
│   │   ├── services/        # API services
│   │   │   └── api/         # API client functions
│   │   ├── store/           # Zustand stores
│   │   ├── hooks/           # Custom React hooks for reusable logic
│   │   ├── routes/          # Application routing and navigation
│   │   ├── styles/          # Global styles
│   │   ├── App.tsx          # Main application component and router
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── index.html           # HTML template
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docs/                    # Documentation
│   ├── srs.md              # Software Requirements Specification
│   ├── api.md              # API documentation
│   ├── database.md         # Database schema docs
│   ├── components.md       # Component documentation
│   ├── setup.md            # Setup instructions
│   ├── testing.md          # Testing guide
├── package.json            # Root package.json (workspace)
├── pnpm-workspace.yaml     # pnpm workspace config
└── README.md               # Project README
```