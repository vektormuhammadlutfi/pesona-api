import { Context } from 'hono';

import { productService } from './service';
import { asyncHandler } from '@/utils/error-handler';

/**
 * Product controller with route handlers
 */
export const listProducts = asyncHandler(async (c: Context) => {
  const { page, limit, categoryId, minPrice, maxPrice } = c.req.query();

  const result = await productService.listProducts({
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    categoryId: categoryId as string,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
  });

  return c.json({ 
    success: true, 
    data: result 
  });
});

export const getProductBySlug = asyncHandler(async (c: Context) => {
  const { slug } = c.req.param();
  const product = await productService.getProductBySlug(slug);

  return c.json({ 
    success: true, 
    data: product 
  });
});

export const createProduct = asyncHandler(async (c: Context) => {
  const productData = await c.req.json();
  const product = await productService.createProduct(productData);

  return c.json({ 
    success: true, 
    data: product 
  }, 201);
});

export const updateProduct = asyncHandler(async (c: Context) => {
  const { id } = c.req.param();
  const productData = await c.req.json();
  const product = await productService.updateProduct(id, productData);

  return c.json({ 
    success: true, 
    data: product 
  });
});

export const deleteProduct = asyncHandler(async (c: Context) => {
  const { id } = c.req.param();
  await productService.deleteProduct(id);

  return c.json({ 
    success: true, 
    message: 'Product deleted successfully' 
  });
});
