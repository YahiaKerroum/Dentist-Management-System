import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { Role } from "../types/prisma.types";
import { ForbiddenError } from "../errors/app.errors";

export const authorize = (...allowedRoles: Role[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new ForbiddenError("Authentication required");
        }

        const userRole = req.user.role as Role;

        if (!allowedRoles.includes(userRole)) {
            throw new ForbiddenError(
                `Access denied. Required roles: ${allowedRoles.join(", ")}`
            );
        }

        next();
    };
};
