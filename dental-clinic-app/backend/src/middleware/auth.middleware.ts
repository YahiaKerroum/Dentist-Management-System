import { Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/app.errors";
import { verifyToken } from "../utils/jwt.utils";
import { AuthenticatedRequest } from "../types/auth.types";
import { asyncHandler } from "../utils/async.handler";

export const authenticate = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        // In development mode, allow bypass without token
        if (process.env.NODE_ENV === 'development' && (!authHeader || !authHeader.startsWith('Bearer '))) {
            // Mock user with manager role for testing
            req.user = {
                userId: 'dev-manager-id',
                username: 'dev-manager',
                email: 'dev@example.com',
                role: 'MANAGER',
            } as any;
            return next();
        }

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("No token provided");
        }

        const token = authHeader.substring(7);

        try {
            const payload = verifyToken(token);
            req.user = payload;
            next();
        } catch (error) {
            throw new UnauthorizedError("Invalid or expired token");
        }
    }
);
