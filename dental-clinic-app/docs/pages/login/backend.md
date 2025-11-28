# Login Page — Backend (for beginners)

Overview

This doc explains the backend side of login: how a `POST /api/auth/login` request flows through the server and returns a token.

Files to look at

- `backend/src/controllers/auth.controller.ts` — controller handling login route.
- `backend/src/services/auth.service.ts` — verifies credentials and signs tokens.
- `backend/src/utils/jwt.utils.ts` — helper to sign/verify JWTs.
- `backend/prisma/schema.prisma` — `User` model (stores email, passwordHash, role).

Flow step-by-step

1. Client POSTs credentials to `/api/auth/login`.
2. Router dispatches to `auth.controller.login` which extracts `email` and `password`.
3. Controller calls `authService.login({ email, password })`.
4. Service finds user in DB (`prisma.user.findUnique`) and compares password using bcrypt.
5. If password matches, service signs a JWT containing user id and role and returns it.
6. Controller returns JSON `{ success: true, data: { token, user } }`.

Key implementation notes

- Passwords are stored hashed. Use `bcrypt.hash` when creating users and `bcrypt.compare` when verifying.
- Keep JWT secret in env variables (`process.env.JWT_SECRET`).
- Set appropriate token expiry (e.g., 1h) and consider refresh tokens for long sessions.

How to test

- Use Postman to POST to `/api/auth/login` with JSON body `{ email, password }`.
- Expect a 200 on success with a token in the response; 401 or 400 on errors.

Security checklist

- Do not log plaintext passwords.
- Use HTTPS in production.
- Rotate and secure JWT secrets.