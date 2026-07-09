export interface DecodedToken {
  userId: string;
  username: string;
  email?: string;
  role: string;
  [key: string]: unknown;
}

/** Decodes a JWT payload without verifying the signature (verification happens server-side). */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload)) as DecodedToken;
  } catch {
    return null;
  }
}
