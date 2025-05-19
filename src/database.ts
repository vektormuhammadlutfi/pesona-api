import { PrismaClient } from '@prisma/client';
import logger from './logging';

export const prismaClient = new PrismaClient({
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
    ],
});

prismaClient.$on('query', (e) => {
    logger.query.info({
        query: e.query,
        params: e.params,
        duration: e.duration,
        timestamp: new Date().toISOString()
    });
});

prismaClient.$on('error', (e) => {
    logger.app.error({
        message: 'Prisma Error',
        error: e,
        timestamp: new Date().toISOString()
    });
});

prismaClient.$on('info', (e) => {
    logger.app.info({
        message: 'Prisma Info',
        info: e,
        timestamp: new Date().toISOString()
    });
});

prismaClient.$on('warn', (e) => {
    logger.app.warn({
        message: 'Prisma Warning',
        warning: e,
        timestamp: new Date().toISOString()
    });
});

export default prismaClient;
