import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code: TRPCError["code"] = "INTERNAL_SERVER_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Error handling utility for tRPC
 */
export function handleTRPCError(error: unknown) {
  // Zod validation errors
  if (error instanceof ZodError) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: error.errors.map((e) => e.message).join(", "),
    });
  }

  // Custom AppError
  if (error instanceof AppError) {
    throw new TRPCError({
      code: error.code,
      message: error.message,
    });
  }

  // Prisma unique constraint violations
  if (error instanceof Error && error.message.includes("Unique constraint")) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "A record with this unique identifier already exists.",
    });
  }

  // Database-related errors
  if (error instanceof Error && error.message.includes("Database")) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "A database error occurred.",
    });
  }

  // Network or external service errors
  if (error instanceof Error && error.message.includes("Network")) {
    throw new TRPCError({
      code: "TIMEOUT",
      message: "An external service is not responding.",
    });
  }

  // Generic error fallback
  if (error instanceof Error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }

  // Unknown error type
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred.",
  });
}

/**
 * Centralized error logging utility
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  console.error("Error Log", {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
  });
}

/**
 * Error tracking and reporting interface
 */
export class ErrorTracker {
  private static instance: ErrorTracker;

  private constructor() {}

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Track and report an error
   */
  track(error: unknown, context?: Record<string, unknown>) {
    logError(error, context);
    // Future: Add integration with error tracking services
  }

  /**
   * Report a non-critical warning
   */
  warn(message: string, context?: Record<string, unknown>) {
    console.warn("Warning", {
      timestamp: new Date().toISOString(),
      message,
      context,
    });
  }
}

// Singleton error tracker instance
export const errorTracker = ErrorTracker.getInstance();
