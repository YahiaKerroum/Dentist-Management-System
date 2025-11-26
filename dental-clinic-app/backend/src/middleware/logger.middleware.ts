import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { randomUUID } from "crypto";

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const requestId = randomUUID();
    const startTime = Date.now();

    res.setHeader("X-Request-ID", requestId);

    logger.info({
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get("user-agent"),
    });

    res.on("finish", () => {
        const duration = Date.now() - startTime;
        logger.info({
            requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        });
    });

    next();
};
