import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

import { Context } from "./context";
import { productRouter } from "@/modules/product/router";
import { categoryRouter } from "@/modules/category/router";

/**
 * Initialize tRPC with SuperJSON for advanced serialization
 */
export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
      },
    };
  },
});

/**
 * Main application router combining all sub-routers
 */
export const appRouter = t.router({
  product: productRouter,
  category: categoryRouter,

  // Example of a standalone procedure
  healthCheck: t.procedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }),

  // Example of a procedure with input validation
  echo: t.procedure
    .input(z.object({ message: z.string() }))
    .query(({ input }) => {
      return {
        message: `Echo: ${input.message}`,
      };
    }),
});

// Export type definition of router
export type AppRouter = typeof appRouter;
