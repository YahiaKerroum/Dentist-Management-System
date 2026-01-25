# User & Account — Backend (for beginners)

Overview

This document explains user/account server-side responsibilities and where to find the code.

Files to check

- `backend/src/controllers/user.controller.ts`
- `backend/src/services/user.service.ts`
- `backend/prisma/schema.prisma`
- `backend/src/middleware/rbac.middleware.ts` — role-based access control

Common endpoints

- `POST /api/auth/register` — register new user
- `GET /api/users` — list users (admin)
- `GET /api/users/:id` — get user
- `PUT /api/users/:id` — update user
- `DELETE /api/users/:id` — delete user

Important notes

- Always hash passwords before saving (bcrypt/argon2).
- Enforce role checks on protected routes via middleware.
- When schema changes run Prisma migrations and update frontend types.