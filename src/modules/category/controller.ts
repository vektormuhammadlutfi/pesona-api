import { Context } from "hono";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function listCategories(c: Context) {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: "desc" },
    });

    return c.json({
      success: true,
      data: categories.map((category) => ({
        ...category,
        productCount: category._count.products,
      })),
    });
  } catch (error) {
    console.error("Error listing categories:", error);
    return c.json(
      { success: false, message: "Failed to list categories" },
      500,
    );
  }
}

export async function getCategoryById(c: Context) {
  try {
    const { id } = c.req.param();
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      return c.json({ success: false, message: "Category not found" }, 404);
    }

    return c.json({ success: true, data: category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return c.json({ success: false, message: "Failed to fetch category" }, 500);
  }
}
