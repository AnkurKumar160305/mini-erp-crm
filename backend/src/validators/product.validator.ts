import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  sku: z.string().min(1, 'SKU is required').max(50),
  category: z.string().min(1, 'Category is required').max(100),
  unitPrice: z.number().positive('Unit price must be positive'),
  currentStock: z.number().int().min(0).default(0),
  minimumStock: z.number().int().min(0).default(10),
  warehouseLocation: z.string().max(100).optional().or(z.literal('')),
});

export const updateProductSchema = createProductSchema.partial().omit({ sku: true });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
