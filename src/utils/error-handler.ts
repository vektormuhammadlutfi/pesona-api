import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import type { Context } from "hono";

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
 * Async handler middleware wrapper for Hono route handlers
 */
export function asyncHandler<T extends Context = Context>(
  fn: (c: T) => Promise<Response | void>
) {
  return async (c: T) => {
    try {
      return await fn(c);
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json(
          {
            success: false,
            error: "Validation failed",
            details: error.errors.map((e) => e.message),
          },
          400
        );
      }

      if (error instanceof AppError) {
        const statusMap: Record<string, 400 | 401 | 403 | 404 | 408 | 409 | 500> = {
          BAD_REQUEST: 400,
          UNAUTHORIZED: 401,
          FORBIDDEN: 403,
          NOT_FOUND: 404,
          TIMEOUT: 408,
          CONFLICT: 409,
          INTERNAL_SERVER_ERROR: 500,
        };
        const status = statusMap[error.code] || 500;
        return c.json({ success: false, error: error.message }, status);
      }

      logError(error);
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return c.json({ success: false, error: message }, 500);
    }
  };
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
