# Why Use Separate Frontend Interfaces vs. Prisma Types?

You asked if Prisma types are enough. While it is *possible* to share Prisma types in a full-stack monorepo, using separate frontend interfaces is generally recommended for several reasons:

## 1. Separation of Concerns
- **Backend (Prisma)**: Represents your **Database Schema**. It includes everything in your DB (passwords, internal flags, relation IDs).
- **Frontend (Interfaces)**: Represents your **API Contract**. It should only include what the UI needs to display.

## 2. Security & Data Hiding
Your API often filters data. For example, a `User` model in Prisma might have:
```typescript
model User {
  id String
  passwordHash String // ⚠️ Should never reach frontend
  isAdmin Boolean
}
```
If you use the Prisma type on the frontend, TypeScript will think you have access to `passwordHash`, but your API (hopefully) doesn't send it. This leads to false confidence and potential bugs.

## 3. Decoupling
If you rename a database column from `first_name` to `firstName`, your Prisma types change immediately.
- **With Prisma Types**: Your frontend build breaks immediately.
- **With Interfaces**: Your frontend code remains valid, but the API response might not match. You can then update your API transformer (DTO) to map the new DB column to the old API field name, preventing a frontend breakage.

## 4. Build Dependencies
Prisma types are generated into `node_modules/@prisma/client`. Importing this into a frontend project (like Vite/React) can sometimes cause build errors because it might try to pull in server-side code or binaries that don't work in the browser.

## Summary
Creating explicit interfaces (like `src/types/patient.ts`) acts as a **contract**. It forces you to be conscious about what data is actually being sent over the network.
