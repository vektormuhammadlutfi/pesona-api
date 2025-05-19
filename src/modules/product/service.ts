import { prisma } from "@/config/database";
import { ProductAggregationSchema } from "@/utils/advanced-filter";
import { z } from "zod";
import { AppError } from "@/utils/error-handler";

/**
 * Product service with business logic and data operations
 */
export class ProductService {
  /**
   * Perform product aggregations
   * @param prismaClient - Prisma client instance
   * @param aggregationOptions - Aggregation parameters
   */
  async aggregateProducts(
    prismaClient: any,
    aggregationOptions: z.infer<typeof ProductAggregationSchema>,
  ) {
    switch (aggregationOptions.groupBy) {
      case "category":
        return prismaClient.product.groupBy({
          by: ["categoryId"],
          _count: { _all: true },
          _avg: { price: true },
          _sum: { stockQuantity: true },
        });

      case "price":
        return prismaClient.product.aggregate({
          _avg: { price: true },
          _min: { price: true },
          _max: { price: true },
          _sum: { stockQuantity: true },
        });

      default:
        throw new AppError("Invalid aggregation option", "BAD_REQUEST");
    }
  }

  /**
   * Retrieve products with advanced filtering and pagination
   * @param options - Filtering and pagination options
   * @returns Paginated product list
   */
  async listProducts(
    options: {
      page?: number;
      limit?: number;
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
    } = {},
  ) {
    const { page = 1, limit = 10, categoryId, minPrice, maxPrice } = options;

    // Construct dynamic filtering
    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (minPrice !== undefined) where.price = { gte: minPrice };
    if (maxPrice !== undefined)
      where.price = {
        ...(typeof where.price === "object" && where.price !== null
          ? where.price
          : {}),
        lte: maxPrice,
      };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a product by slug with detailed information
   * @param slug - Product slug
   * @returns Detailed product information
   */
  async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
      },
    });

    if (!product) {
      throw new AppError("Product not found", "NOT_FOUND");
    }

    return product;
  }
}

export const productService = new ProductService();
