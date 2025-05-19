import { z } from "zod";
import { initTRPC } from "@trpc/server";
import { categoryService } from "./service";
import { handleTRPCError } from "@/utils/error-handler";
import { Context } from "@/trpc/context";

// Create tRPC instance here to avoid circular dependency
const t = initTRPC.context<Context>().create();

/**
 * Category tRPC Router
 * Defines all category-related procedures with input validation
 */
export const categoryRouter = t.router({
  // List all categories
  list: t.procedure.query(async () => {
    try {
      return await categoryService.listCategories();
    } catch (error) {
      handleTRPCError(error);
    }
  }),

  // Get category by ID
  getById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        return await categoryService.getCategoryById(input.id);
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
