/**
 * Central registry of TanStack Query cache keys. Using one place keeps reads and
 * the invalidations that follow mutations in sync — a page reads `patients` and a
 * create/edit/delete elsewhere invalidates the same key, so revisits stay fresh
 * without refetching on every navigation.
 */
export const queryKeys = {
  patients: ['patients'] as const,
  userPermissions: (userId: string) => ['user-permissions', userId] as const,
  appointments: (filters?: unknown) =>
    filters ? (['appointments', filters] as const) : (['appointments'] as const),
  rooms: ['rooms'] as const,
  payments: ['payments'] as const,
  expenses: ['expenses'] as const,
  treatments: (filters?: unknown) =>
    filters ? (['treatments', filters] as const) : (['treatments'] as const),
  clinicPulse: ['clinic-pulse'] as const,
};
