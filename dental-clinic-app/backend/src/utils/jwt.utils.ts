import * as jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
}

export const signAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET as jwt.Secret, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const signRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET as jwt.Secret, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
};
