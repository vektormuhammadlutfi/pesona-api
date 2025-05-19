import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { prisma } from "@/config/database";

/**
 * Creates context for tRPC procedures
 * Allows sharing of request-scoped resources
 */
export async function createContext(opts?: FetchCreateContextFnOptions) {
  return {
    req: opts?.req,
    prisma,
    // Placeholder for future authentication
    user: null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
