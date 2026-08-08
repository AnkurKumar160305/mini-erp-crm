import prisma from '../config/database';
import { Prisma, MovementType } from '@prisma/client';
import { CreateStockMovementInput } from '../validators/inventory.validator';

export class InventoryService {
  async getInventory(params: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    category?: string;
  }) {
    const where: Prisma.ProductWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { sku: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.category) {
      where.category = params.category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: params.skip,
        take: params.limit,
        select: {
          id: true,
          name: true,
          sku: true,
          category: true,
          currentStock: true,
          minimumStock: true,
          warehouseLocation: true,
          unitPrice: true,
          imageUrl: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async getLowStock() {
    const products = await prisma.$queryRaw<any[]>`
      SELECT id, name, sku, category, "currentStock", "minimumStock", "warehouseLocation", "unitPrice"
      FROM products
      WHERE "currentStock" <= "minimumStock"
      ORDER BY "currentStock" ASC
    `;
    return products;
  }

  async getMovements(params: {
    page: number;
    limit: number;
    skip: number;
    productId?: string;
    movementType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: Prisma.StockMovementWhereInput = {};

    if (params.productId) {
      where.productId = params.productId;
    }

    if (params.movementType) {
      where.movementType = params.movementType as MovementType;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.createdAt.lte = new Date(params.endDate);
      }
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.limit,
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
          user: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return { movements, total };
  }

  async createMovement(input: CreateStockMovementInput, userId: string) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    // For OUT movement, check stock availability
    if (input.movementType === 'OUT') {
      if (product.currentStock < input.quantity) {
        throw {
          statusCode: 400,
          message: 'Insufficient stock',
          availableStock: product.currentStock,
          requestedQuantity: input.quantity,
        };
      }
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update product stock
      const stockChange = input.movementType === 'IN' ? input.quantity : -input.quantity;

      const updatedProduct = await tx.product.update({
        where: { id: input.productId },
        data: {
          currentStock: { increment: stockChange },
        },
      });

      // Double-check stock didn't go negative (race condition protection)
      if (updatedProduct.currentStock < 0) {
        throw {
          statusCode: 400,
          message: 'Insufficient stock',
          availableStock: product.currentStock,
          requestedQuantity: input.quantity,
        };
      }

      // Create movement record
      const movement = await tx.stockMovement.create({
        data: {
          productId: input.productId,
          quantity: input.quantity,
          movementType: input.movementType,
          reason: input.reason || null,
          createdBy: userId,
        },
        include: {
          product: {
            select: { id: true, name: true, sku: true, currentStock: true },
          },
          user: {
            select: { id: true, name: true },
          },
        },
      });

      return movement;
    });

    return result;
  }
}

export const inventoryService = new InventoryService();
