# Profiles Page — Backend (for beginners)

Overview

This document explains how the backend supports the Profiles page: which endpoints the frontend calls, where the logic lives, and how to trace a request from route to database.

Files to look at

- `backend/src/controllers/user.controller.ts` — controller handling profile routes.
- `backend/src/services/user.service.ts` — business logic to read/update user profiles.
- `backend/src/middleware/auth.middleware.ts` — ensures the request has a valid token and sets `req.user`.
- `backend/prisma/schema.prisma` — `User` model (fields for profile data).

Common endpoints

- GET `/api/users/me` — returns the logged-in user's profile.
- PUT `/api/users/:id` — updates a user's profile (checks permissions).

Typical request flow (GET /api/users/me)

1. Router maps `/api/users/me` to `userController.getMe`.
2. `auth.middleware` runs: verifies JWT and attaches `userId` to the request.
3. Controller calls `userService.getById(userId)` which queries Prisma.
4. Service returns the user object (without password hash) to the controller.
5. Controller returns JSON `{ success: true, data: user }`.

Security and permission notes

- Ensure `PUT /api/users/:id` checks that either the requester is updating their own profile or has an admin role.
- Never return `passwordHash` in responses.
- Validate input server-side (email format, lengths).

How to test

- Use Postman to GET `/api/users/me` with an Authorization header `Bearer <token>`.
- Try updating a profile via PUT and confirm database changes via Prisma Studio or `prisma.user.findUnique`.

Quick debugging checklist

- 401 errors: confirm JWT secret and token expiry.
- 403 errors on update: check role/permission checks in the controller or service.
- Missing fields: verify Prisma select/omit rules in the service functions.
