/**
 * Milestone 3 test accounts, shared by the seed and the helper scripts.
 * Local test data only: the .test domain is reserved and never deliverable.
 */

/** Shared password for every test account. */
export const TEST_PASSWORD = 'M3Test!2026';

export const ACCOUNT_EMAILS = {
  ADMIN: 'admin@m3.test',
  VIEWER: 'viewer@m3.test',
  AG1: 'ag1@m3.test',
  AG2: 'ag2@m3.test',
  AG3: 'ag3@m3.test',
  U1: 'u1@m3.test',
  U2: 'u2@m3.test',
  U3: 'u3@m3.test',
} as const;

export type AccountKey = keyof typeof ACCOUNT_EMAILS;
