import app from "./app";
import { ENV } from "./config/env";
import logger from "./utils/logger";
import prisma from "./config/prisma";

const startServer = async () => {
    try {
        await prisma.$connect();
        logger.info("Database connected successfully");

        const server = app.listen(ENV.PORT, () => {
            logger.info(`Server running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`);
            logger.info(`Health check: http://localhost:${ENV.PORT}/health`);
            logger.info(`API base URL: http://localhost:${ENV.PORT}/api`);
        });

        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received, closing server gracefully`);

            server.close(async () => {
                logger.info("HTTP server closed");

                await prisma.$disconnect();
                logger.info("Database disconnected");

                process.exit(0);
            });

            setTimeout(() => {
                logger.error("Forced shutdown after timeout");
                process.exit(1);
            }, 10000);
        };

        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    } catch (error) {
        logger.error({ err: error }, "Failed to start server");
        process.exit(1);
    }
};

startServer();
