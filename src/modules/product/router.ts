import { z } from "zod";
import { initTRPC } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { productService } from "./service";
import {
  ProductFilterSchema,
  ProductAggregationSchema,
  buildProductFilter,
} from "@/utils/advanced-filter";
import { handleTRPCError } from "@/utils/error-handler";
import { Context } from "@/trpc/context";
import { prisma } from "@/config/database";
import logger from "@/logging";

// Create tRPC instance here to avoid circular dependency
const t = initTRPC.context<Context>().create();

/**
 * Product tRPC Router
 * Defines all product-related procedures with input validation
 */
export const productRouter = t.router({
  // List products with advanced filtering
  list: t.procedure
    .input(
      ProductFilterSchema.optional().default({
        page: 1,
        limit: 10,
      }),
    )
    .query(async ({ input }) => {
      try {
        logger.app.info(`Listing products`, {
          page: input.page,
          limit: input.limit,
          filters: input,
        });

        const { where, orderBy } = buildProductFilter(input);

        logger.app.debug("Product list query", {
          where,
          orderBy,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        });

        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            orderBy,
            include: {
              category: true,
              variants: true,
            },
            skip: (input.page - 1) * input.limit,
            take: input.limit,
          }),
          prisma.product.count({ where }),
        ]);

        return {
          products,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            pages: Math.ceil(total / input.limit),
          },
        };
      } catch (error) {
        logger.app.error(`Error listing products`, {
          error: error instanceof Error ? error.message : String(error),
        });
        handleTRPCError(error);
      }
    }),

  // Product aggregation for analytics
  aggregate: t.procedure
    .input(
      ProductAggregationSchema.optional().default({
        groupBy: "category",
        metric: "count",
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        return await productService.aggregateProducts(ctx.prisma, input);
      } catch (error) {
        logger.app.error(`Error aggregating products`, {
          error: error instanceof Error ? error.message : String(error),
        });
        handleTRPCError(error);
      }
    }),

  // Get product by slug
  getBySlug: t.procedure
    .input(
      z
        .object({
          slug: z.string().min(1, "Slug must not be empty"),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      try {
        // If no input or no slug is provided, fetch the first product
        if (!input?.slug) {
          const firstProduct = await prisma.product.findFirst({
            include: {
              category: true,
              variants: true,
            },
          });

          if (!firstProduct) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "No products found",
            });
          }

          return firstProduct;
        }

        // Fetch product by slug
        return await productService.getProductBySlug(input.slug);
      } catch (error) {
        logger.app.error(`Error getting product by slug`, {
          error: error instanceof Error ? error.message : String(error),
        });
        handleTRPCError(error);
      }
    }),
});
