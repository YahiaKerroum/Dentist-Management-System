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
    GOOGLE_DRIVE_CLIENT_EMAIL: process.env.GOOGLE_DRIVE_CLIENT_EMAIL!,
    GOOGLE_DRIVE_PRIVATE_KEY: process.env.GOOGLE_DRIVE_PRIVATE_KEY!,
    GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID || undefined,
    // OAuth (fallback) for uploading to a user's Drive quota
    GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    GOOGLE_OAUTH_REDIRECT_URI: process.env.GOOGLE_OAUTH_REDIRECT_URI,
    GOOGLE_OAUTH_REFRESH_TOKEN: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
};
