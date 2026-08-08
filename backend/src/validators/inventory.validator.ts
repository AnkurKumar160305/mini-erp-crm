import { z } from 'zod';

export const createStockMovementSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  movementType: z.enum(['IN', 'OUT']),
  reason: z.string().max(500).optional().or(z.literal('')),
});

export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
