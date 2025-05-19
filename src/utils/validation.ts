import { z } from 'zod';

/**
 * Validates input against a Zod schema
 * @param schema - Zod validation schema
 * @param data - Data to validate
 * @throws AppError if validation fails
 */
export function validateInput<T extends z.ZodTypeAny>(
  schema: T, 
  data: unknown
): z.TypeOf<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => err.message);
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
    throw error;
  }
}

// Product validation schemas
export const ProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be a positive number'),
  stockQuantity: z.number().int().nonnegative('Stock quantity must be non-negative').optional(),
  categoryId: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  variants: z.array(
    z.object({
      name: z.string(),
      value: z.string()
    })
  ).optional()
});

export const CategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional()
});
