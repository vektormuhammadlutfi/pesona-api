import { z } from "zod";

/**
 * Advanced filtering options for products
 */
export const ProductFilterSchema = z.object({
  // Pagination
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),

  // Search
  search: z.string().optional(),

  // Pricing
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),

  // Sorting
  sortBy: z
    .enum(["name", "price", "createdAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),

  // Filtering
  categoryIds: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),

  // Advanced text search
  searchFields: z
    .array(z.enum(["name", "description", "sku"]))
    .optional()
    .default(["name", "description"]),
});

/**
 * Build advanced database filter based on input
 * @param filter - Parsed filter options
 * @returns Prisma where and orderBy options
 */
export function buildProductFilter(
  filter: z.infer<typeof ProductFilterSchema>,
) {
  const where: Record<string, any> = {};
  const orderBy: Record<string, "asc" | "desc">[] = [];

  // Text search
  if (filter.search && filter.searchFields) {
    where.OR = filter.searchFields.map((field) => ({
      [field]: {
        contains: filter.search,
        mode: "insensitive",
      },
    }));
  }

  // Price range
  if (filter.minPrice !== undefined) {
    where.price = { ...where.price, gte: filter.minPrice };
  }
  if (filter.maxPrice !== undefined) {
    where.price = { ...where.price, lte: filter.maxPrice };
  }

  // Category filtering
  if (filter.categoryIds && filter.categoryIds.length > 0) {
    where.categoryId = { in: filter.categoryIds };
  }

  // Stock filtering
  if (filter.inStock !== undefined) {
    where.stockQuantity = filter.inStock ? { gt: 0 } : { equals: 0 };
  }

  // Sorting
  if (filter.sortBy) {
    orderBy.push({
      [filter.sortBy]: filter.sortOrder,
    });
  }

  return { where, orderBy };
}

/**
 * Create aggregation for product statistics
 */
export const ProductAggregationSchema = z.object({
  groupBy: z.enum(["category", "price"]).optional(),
  metric: z.enum(["count", "avgPrice", "totalValue"]).optional(),
});

/**
 * Perform product aggregations
 * @param aggregationOptions - Aggregation parameters
 */
export async function aggregateProducts(
  prisma: any,
  aggregationOptions: z.infer<typeof ProductAggregationSchema>,
) {
  switch (aggregationOptions.groupBy) {
    case "category":
      return prisma.product.groupBy({
        by: ["categoryId"],
        _count: { _all: true },
        _avg: { price: true },
        _sum: { stockQuantity: true },
      });

    case "price":
      return prisma.product.aggregate({
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
        _sum: { stockQuantity: true },
      });

    default:
      throw new Error("Invalid aggregation option");
  }
}
