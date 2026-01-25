# Login Page — Frontend (for beginners)

Overview

This document explains the frontend login flow in plain language and shows where to find and change the code.

Files to look at

- `frontend/src/components/Login.tsx` — the login form component.
- `frontend/src/services/auth.service.ts` — client helpers that call the API.
- `frontend/src/App.tsx` — decides whether to render `Login` or `MainLayout` based on token.

What happens when a user logs in

1. User types email/username and password into the form.
2. The component validates the inputs (makes sure they're not empty).
3. The form calls `auth.service.login(email, password)` which sends the request to the backend.
4. Backend responds with a token (JWT) on success.
5. `App.tsx` stores the token in state and `localStorage` and renders the main app.

Quick code map

- `Login.tsx`
  - useState for `email`, `password`, `loading`, `error`.
  - `handleSubmit` calls auth service and on success calls `onLoginSuccess(token)` prop.
- `auth.service.ts`
  - `login(email, password)` uses fetch/axios to POST to `/api/auth/login`.
  - The function returns the parsed JSON response.
- `App.tsx`
  - Holds `token` in state. `handleLoginSuccess` stores token and triggers re-render.

Common issues & debugging

- No network call: ensure `handleSubmit` is wired to the `onSubmit` of the form and `e.preventDefault()` is used.
- 401 Unauthorized: inspect request body and headers in DevTools to ensure correct JSON.
- App doesn't re-render after login: confirm `onLoginSuccess` is setting token in a state that `App.tsx` uses.

Security notes

- Store credentials only temporarily in memory; do not persist passwords on the client.
- Store tokens according to your security model (localStorage vs httpOnly cookie). LocalStorage is simple, httpOnly cookie is safer against XSS.

How to test

- Start backend and frontend.
- Use the UI to log in with known credentials.
- Verify `localStorage.token` exists and the app navigates to the main layout.