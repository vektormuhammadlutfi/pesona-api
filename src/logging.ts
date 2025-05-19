import winston from "winston";
import { PATHS } from "./utils/paths";
import path from "path";

// Query logger
export const queryLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(PATHS.LOGS, "queries.log"),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Application logger
export const appLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(PATHS.LOGS, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(PATHS.LOGS, "combined.log"),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export default {
  query: queryLogger,
  app: appLogger,
};
