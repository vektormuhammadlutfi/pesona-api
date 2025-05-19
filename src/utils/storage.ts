import fs from "fs";
import path from "path";
import { CONFIG } from "../config";
import logger from "../logging";

export const STORAGE_PATHS = {
  BASE: path.join(process.cwd(), CONFIG.STORAGE_PATH),
  REPORTS: path.join(process.cwd(), CONFIG.REPORT_PATH),
  LOGS: path.join(process.cwd(), CONFIG.LOG_PATH),
};

// Initialize storage directories
export function initStorage() {
  Object.values(STORAGE_PATHS).forEach((dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.app.info(`Created directory: ${dirPath}`);
    }
  });
}

// Get report path with date-based directory structure
export function getReportPath(filename: string): string {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");

  const yearMonthPath = path.join(STORAGE_PATHS.REPORTS, year, month);

  if (!fs.existsSync(yearMonthPath)) {
    fs.mkdirSync(yearMonthPath, { recursive: true });
  }

  return path.join(yearMonthPath, filename);
}

// Clean old files
export function cleanOldFiles(
  ageInDays: number = CONFIG.STORAGE.RETENTION_DAYS
) {
  const now = Date.now();
  const maxAge = ageInDays * 24 * 60 * 60 * 1000;

  function cleanup(directory: string) {
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        cleanup(filePath);
        // Remove empty directories
        if (fs.readdirSync(filePath).length === 0) {
          fs.rmdirSync(filePath);
          logger.app.info(`Removed empty directory: ${filePath}`);
        }
      } else if (stat.isFile() && file !== ".gitkeep") {
        if (now - stat.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          logger.app.info(`Deleted old file: ${filePath}`);
        }
      }
    });
  }

  try {
    cleanup(STORAGE_PATHS.REPORTS);
    logger.app.info("Storage cleanup completed");
  } catch (error) {
    logger.app.error("Error during storage cleanup:", error);
  }
}
