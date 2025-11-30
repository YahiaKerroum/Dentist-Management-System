# User & Account — Frontend (for beginners)

Overview

This guide explains where user/account UI and logic live on the frontend and how to change them.

Files to check

- `frontend/src/services/user.service.ts` — API calls related to users.
- `frontend/src/pages/ProfilePage.tsx` — profile editing for the current user.
- `frontend/src/pages/UsersPage.tsx` (if present) — admin view for user management.
- `frontend/src/components/...` — user forms and modals for creating/updating users.

Typical flows

- Create account: a registration form calls `auth.service.register` or `user.service.createUser`.
- List users (admin): call `getUsers(token)` and render results.
- Edit user (admin): open a modal with `updateUser(id, data, token)` on submit.

Best practices

- Keep API calls in `services/*` and UI code in pages/components.
- Validate on both client and server.
- Check roles on client to show/hide admin actions but enforce on server.

How to test

- Create/edit a user and verify network calls and DB changes via Prisma Studio.