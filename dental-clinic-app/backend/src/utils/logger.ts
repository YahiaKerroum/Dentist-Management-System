import pino from "pino";
import { ENV } from "../config/env";

const isDevelopment = ENV.NODE_ENV === "development";

export const logger = pino({
  level: ENV.LOG_LEVEL || "info",
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  base: {
    env: ENV.NODE_ENV,
  },
});

export default logger;
