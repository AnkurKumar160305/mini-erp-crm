import prisma from '../config/database';
import { Prisma, ChallanStatus } from '@prisma/client';
import { CreateChallanInput } from '../validators/challan.validator';
import { generateChallanNumber } from '../utils/challan';

export class ChallanService {
  async list(params: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    status?: string;
    customerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const where: Prisma.SalesChallanWhereInput = {};

    if (params.search) {
      where.OR = [
        { challanNumber: { contains: params.search, mode: 'insensitive' } },
        { customer: { customerName: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    if (params.status) {
      where.status = params.status as ChallanStatus;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    const orderBy: Prisma.SalesChallanOrderByWithRelationInput = {};
    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    (orderBy as any)[sortField] = sortOrder;

    const [challans, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where,
        orderBy,
        skip: params.skip,
        take: params.limit,
        include: {
          customer: {
            select: { id: true, customerName: true, businessName: true, mobile: true },
          },
          user: {
            select: { id: true, name: true },
          },
          _count: { select: { items: true } },
        },
      }),
      prisma.salesChallan.count({ where }),
    ]);

    return { challans, total };
  }

  async getById(id: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, currentStock: true, imageUrl: true },
            },
          },
        },
      },
    });

    if (!challan) {
      throw { statusCode: 404, message: 'Challan not found' };
    }

    return challan;
  }

  async create(input: CreateChallanInput, userId: string) {
    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: input.customerId },
    });

    if (!customer) {
      throw { statusCode: 404, message: 'Customer not found' };
    }

    // Fetch all products for the challan items
    const productIds = input.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw { statusCode: 400, message: 'One or more products not found' };
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Generate challan number
    const challanNumber = await generateChallanNumber();

    // Calculate totals and create snapshot items
    let totalQuantity = 0;
    let totalAmount = 0;

    const challanItems = input.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const totalPrice = product.unitPrice * item.quantity;
      totalQuantity += item.quantity;
      totalAmount += totalPrice;

      return {
        productId: item.productId,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
        totalPrice,
      };
    });

    // Create draft challan (no stock deduction)
    const challan = await prisma.salesChallan.create({
      data: {
        challanNumber,
        customerId: input.customerId,
        totalQuantity,
        totalAmount,
        status: 'DRAFT',
        createdBy: userId,
        items: {
          create: challanItems,
        },
      },
      include: {
        customer: {
          select: { id: true, customerName: true, businessName: true },
        },
        items: true,
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return challan;
  }

  /**
   * CRITICAL BUSINESS OPERATION — Transaction-safe challan confirmation
   * 
   * Uses PostgreSQL transaction to ensure:
   * 1. All stock checks pass for ALL items
   * 2. All stock deductions happen atomically
   * 3. If ANY item has insufficient stock, EVERYTHING rolls back
   */
  async confirm(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch challan with items
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        throw { statusCode: 404, message: 'Challan not found' };
      }

      // 2. Verify challan is DRAFT
      if (challan.status !== 'DRAFT') {
        throw {
          statusCode: 400,
          message: `Cannot confirm challan with status "${challan.status}". Only DRAFT challans can be confirmed.`,
        };
      }

      // 3. Fetch all products and check stock
      const productIds = challan.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      // 4. Check stock for ALL items BEFORE deducting anything
      const insufficientItems: { productName: string; available: number; requested: number }[] = [];

      for (const item of challan.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw { statusCode: 400, message: `Product ${item.productNameSnapshot} no longer exists` };
        }
        if (product.currentStock < item.quantity) {
          insufficientItems.push({
            productName: item.productNameSnapshot,
            available: product.currentStock,
            requested: item.quantity,
          });
        }
      }

      // 5. If ANY item has insufficient stock, ROLLBACK
      if (insufficientItems.length > 0) {
        throw {
          statusCode: 400,
          message: 'Insufficient stock for one or more products',
          insufficientItems,
        };
      }

      // 6. Deduct stock and create OUT movements for ALL items
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { decrement: item.quantity },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: 'OUT',
            reason: `Sales Challan ${challan.challanNumber} confirmed`,
            createdBy: userId,
          },
        });
      }

      // 7. Update challan status
      const confirmedChallan = await tx.salesChallan.update({
        where: { id },
        data: { status: 'CONFIRMED' },
        include: {
          customer: true,
          items: true,
          user: { select: { id: true, name: true } },
        },
      });

      return confirmedChallan;
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * Cancel a challan. 
   * - DRAFT → CANCELLED: No stock changes
   * - CONFIRMED → CANCELLED: Reverse stock (create IN movements) inside transaction
   */
  async cancel(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        throw { statusCode: 404, message: 'Challan not found' };
      }

      if (challan.status === 'CANCELLED') {
        throw { statusCode: 400, message: 'Challan is already cancelled' };
      }

      // If CONFIRMED, reverse stock
      if (challan.status === 'CONFIRMED') {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: { increment: item.quantity },
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: 'IN',
              reason: `Sales Challan ${challan.challanNumber} cancelled — stock reversed`,
              createdBy: userId,
            },
          });
        }
      }

      // Update status
      const cancelledChallan = await tx.salesChallan.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          customer: true,
          items: true,
          user: { select: { id: true, name: true } },
        },
      });

      return cancelledChallan;
    }, { maxWait: 10000, timeout: 30000 });
  }
}

export const challanService = new ChallanService();
