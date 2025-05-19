import { PrismaClient } from '@prisma/client';
import winston from 'winston';

// Create a singleton Prisma client to prevent multiple instances
class DatabaseClient {
  private static instance: PrismaClient;
  private static logger: winston.Logger;

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {}

  /**
   * Get or create a singleton Prisma client instance
   * @returns PrismaClient instance
   */
  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new PrismaClient({
        log: [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
        ],
      });

      // Setup logging for database operations
      DatabaseClient.setupLogging();
    }

    return DatabaseClient.instance;
  }

  /**
   * Configure logging for database events
   */
  private static setupLogging() {
    const instance = DatabaseClient.instance;

    instance.$on('query', (e) => {
      console.log('Query:', e.query);
      console.log('Params:', e.params);
      console.log('Duration:', e.duration + 'ms');
    });

    instance.$on('error', (e) => {
      console.error('Database Error:', e);
    });
  }

  /**
   * Disconnect the Prisma client
   */
  public static async disconnect() {
    if (DatabaseClient.instance) {
      await DatabaseClient.instance.$disconnect();
    }
  }
}

export const prisma = DatabaseClient.getInstance();

// Graceful shutdown
process.on('SIGINT', async () => {
  await DatabaseClient.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await DatabaseClient.disconnect();
  process.exit(0);
});
