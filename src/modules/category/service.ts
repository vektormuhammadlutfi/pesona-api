import { prisma } from "@/config/database";
import { AppError } from "@/utils/error-handler";
import { z } from "zod";

// Category validation schema
const CategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional(),
});

/**
 * Category service with business logic and data operations
 */
export class CategoryService {
  /**
   * List all categories with product count
   */
  async listCategories() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get a category by ID with its products
   * @param id - Category ID
   */
  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      throw new AppError("Category not found", "NOT_FOUND");
    }

    return category;
  }

  /**
   * Create a new category
   * @param data - Category creation data
   */
  async createCategory(data: unknown) {
    // Validate input
    const validatedData = CategorySchema.parse(data);

    // Check for existing category name
    const existingCategory = await prisma.category.findUnique({
      where: { name: validatedData.name },
    });

    if (existingCategory) {
      throw new AppError("Category name must be unique", "CONFLICT");
    }

    return prisma.category.create({ data: validatedData });
  }

  /**
   * Update an existing category
   * @param id - Category ID
   * @param data - Update data
   */
  async updateCategory(id: string, data: unknown) {
    // Validate input
    const validatedData = CategorySchema.partial().parse(data);

    // Ensure category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new AppError("Category not found", "NOT_FOUND");
    }

    return prisma.category.update({
      where: { id },
      data: validatedData,
    });
  }

  /**
   * Delete a category
   * @param id - Category ID to delete
   */
  async deleteCategory(id: string) {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError("Category not found", "NOT_FOUND");
    }

    // Check for associated products
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new AppError(
        "Cannot delete category with associated products",
        "PRECONDITION_FAILED",
      );
    }

    await prisma.category.delete({ where: { id } });
  }
}

export const categoryService = new CategoryService();
