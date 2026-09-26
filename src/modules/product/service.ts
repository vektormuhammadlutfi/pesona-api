import { prisma } from "@/config/database";
import { ProductAggregationSchema } from "@/utils/advanced-filter";
import { z } from "zod";
import { AppError } from "@/utils/error-handler";
import { ProductSchema } from "@/utils/validation";

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

  /**
   * Create a new product
   * @param data - Product creation data
   */
  async createProduct(data: unknown) {
    const validatedData = ProductSchema.parse(data);
    const { variants, ...productData } = validatedData;

    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [{ slug: productData.slug }, { sku: productData.sku }],
      },
    });

    if (existingProduct) {
      throw new AppError(
        "Product with this slug or SKU already exists",
        "CONFLICT"
      );
    }

    return prisma.product.create({
      data: {
        ...productData,
        variants: variants
          ? {
              create: variants,
            }
          : undefined,
      },
      include: { category: true, variants: true },
    });
  }

  /**
   * Update an existing product
   * @param id - Product ID
   * @param data - Update data
   */
  async updateProduct(id: string, data: unknown) {
    const validatedData = ProductSchema.partial().parse(data);
    const { variants, ...productData } = validatedData;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new AppError("Product not found", "NOT_FOUND");
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...productData,
        variants: variants
          ? {
              deleteMany: {},
              create: variants,
            }
          : undefined,
      },
      include: { category: true, variants: true },
    });
  }

  /**
   * Delete a product
   * @param id - Product ID
   */
  async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new AppError("Product not found", "NOT_FOUND");
    }

    await prisma.variant.deleteMany({
      where: { productId: id },
    });

    return prisma.product.delete({
      where: { id },
    });
  }
}

export const productService = new ProductService();
