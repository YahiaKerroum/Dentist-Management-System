import { config } from "dotenv";
config();

export const ENV = {
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    PORT: Number(process.env.PORT) || 4000,
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
};
