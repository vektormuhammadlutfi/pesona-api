import path from 'path';
import fs from 'fs';
import { CONFIG } from '../config';

export const PATHS = {
    REPORTS: path.join(process.cwd(), CONFIG.REPORT_PATH),
    LOGS: path.join(process.cwd(), CONFIG.LOG_PATH),
};

// Ensure directories exist
Object.values(PATHS).forEach(dirPath => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});
