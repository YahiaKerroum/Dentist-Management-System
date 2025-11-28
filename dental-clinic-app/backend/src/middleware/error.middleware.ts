import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.errors";
import { Prisma } from "@prisma/client";
import logger from "../utils/logger";
import { ENV } from "../config/env";
import { ZodError } from "zod";

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error({
        err: error,
        req: {
            method: req.method,
            url: req.url,
            params: req.params,
            query: req.query,
        },
    });

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                message: error.message,
                code: error.code,
                details: error.details,
                ...(ENV.NODE_ENV === "development" && { stack: error.stack }),
            },
        });
    }

    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: {
                message: "Validation failed",
                code: "VALIDATION_ERROR",
                details: error.errors,
            },
        });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                error: {
                    message: "Resource already exists",
                    code: "DUPLICATE_ENTRY",
                    details: error.meta,
                },
            });
        }

        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                error: {
                    message: "Resource not found",
                    code: "NOT_FOUND",
                    details: error.meta,
                },
            });
        }

        return res.status(400).json({
            success: false,
            error: {
                message: "Database operation failed",
                code: error.code,
                details: error.meta,
            },
        });
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            success: false,
            error: {
                message: "Invalid data format",
                code: "VALIDATION_ERROR",
            },
        });
    }

    return res.status(500).json({
        success: false,
        error: {
            message: ENV.NODE_ENV === "development"
                ? error.message
                : "Internal server error",
            code: "INTERNAL_ERROR",
            ...(ENV.NODE_ENV === "development" && { stack: error.stack }),
        },
    });
};

export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.method} ${req.url} not found`,
            code: "ROUTE_NOT_FOUND",
        },
    });
};
