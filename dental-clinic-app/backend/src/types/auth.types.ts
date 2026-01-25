import { Request } from "express";
import { JWTPayload } from "../utils/jwt.utils";

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
