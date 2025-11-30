# Profiles Page — Frontend (for beginners)

Overview

This document explains the frontend code for the Profiles page in simple steps and shows where to find and modify the logic.

Files to look at

- `frontend/src/pages/ProfilePage.tsx` — the page wrapper and data loading.
- `frontend/src/components/profile/ProfileCard.tsx` — presentational card showing user profile details.
- `frontend/src/services/user.service.ts` — API helpers to fetch and update user/profile data.
- `frontend/src/components/layout/MainLayout.tsx` — where the page is mounted and token is passed.

What the page does

- Loads the current user's profile from the backend on mount.
- Shows editable fields (name, email, phone, role) using a `ProfileCard` form.
- Allows the user to update the profile (PUT request) and shows success/error feedback.

Important component map

- ProfilePage.tsx
  - Calls `userService.getProfile(token)` on mount.
  - Holds `profile`, `loading`, `error` state and passes them to `ProfileCard`.
- ProfileCard.tsx
  - Renders the profile fields and an Edit button.
  - Validates inputs locally and calls `onSave(updatedProfile)` when submitting.

State shape (simplified)

- profile: { id: string; firstName: string; lastName: string; email: string; phone?: string; role: string }
- loading: boolean
- error: string | null

Typical flow (user updates profile)

1. User edits fields and clicks Save.
2. `ProfileCard` runs light validation (non-empty required fields).
3. `ProfileCard` calls `onSave` with the updated data.
4. `ProfilePage` calls `userService.updateProfile(profile, token)`.
5. On success, the page updates local `profile` state and shows a success message.

API integration points

- `user.service.ts`
  - `getProfile(token)` -> GET `/api/users/me`
  - `updateProfile(data, token)` -> PUT `/api/users/:id`

Edge cases and guards

- Token missing: the page should redirect to Login if token is not present.
- Network failure: show a user-friendly error and allow retry.
- Partial profile data: use optional chaining and default values when rendering fields to avoid crashes.

How to test quickly

1. Start backend and frontend.
2. Log in using a valid account.
3. Navigate to Profile page and verify fields load.
4. Change a field and save; confirm the UI reflects the update and backend has new values.

Debugging tips

- If fields don’t load, check `user.service.getProfile` network call in DevTools.
- If save fails with 401, verify the `Authorization` header contains `Bearer <token>`.

Notes for maintainers

- Keep validation thin on the client; enforce rules on the backend as the source of truth.
- Consider extracting a shared `useApi` hook for repetitive fetch + token logic.
