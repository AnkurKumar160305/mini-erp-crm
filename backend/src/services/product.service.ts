import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator';

export class ProductService {
  async list(params: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    category?: string;
    lowStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
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

    if (params.lowStock) {
      where.currentStock = {
        lte: prisma.product.fields.minimumStock as any,
      };
      // Prisma doesn't support field comparison directly, use raw where
      where.currentStock = { lte: 0 }; // We'll handle this differently
      delete where.currentStock;
      where.AND = [
        {
          // Use a raw approach for column comparison
          currentStock: { lte: 100 }, // Will be filtered in code or use raw SQL
        },
      ];
      // Better approach: just fetch all with low stock
      delete where.AND;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    (orderBy as any)[sortField] = sortOrder;

    let products: any[];
    let total: number;

    if (params.lowStock) {
      // For low stock, we need to filter where currentStock <= minimumStock
      const allProducts = await prisma.$queryRaw<any[]>`
        SELECT * FROM products 
        WHERE "currentStock" <= "minimumStock"
        ${params.search ? Prisma.sql`AND (name ILIKE ${`%${params.search}%`} OR sku ILIKE ${`%${params.search}%`})` : Prisma.sql``}
        ${params.category ? Prisma.sql`AND category = ${params.category}` : Prisma.sql``}
        ORDER BY "createdAt" DESC
        LIMIT ${params.limit} OFFSET ${params.skip}
      `;

      const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM products 
        WHERE "currentStock" <= "minimumStock"
        ${params.search ? Prisma.sql`AND (name ILIKE ${`%${params.search}%`} OR sku ILIKE ${`%${params.search}%`})` : Prisma.sql``}
        ${params.category ? Prisma.sql`AND category = ${params.category}` : Prisma.sql``}
      `;

      products = allProducts;
      total = Number(countResult[0].count);
    } else {
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip: params.skip,
          take: params.limit,
        }),
        prisma.product.count({ where }),
      ]);
    }

    return { products, total };
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    return product;
  }

  async create(input: CreateProductInput) {
    const existing = await prisma.product.findUnique({
      where: { sku: input.sku },
    });

    if (existing) {
      throw { statusCode: 409, message: `Product with SKU "${input.sku}" already exists` };
    }

    return prisma.product.create({
      data: {
        name: input.name,
        sku: input.sku,
        category: input.category,
        unitPrice: input.unitPrice,
        currentStock: input.currentStock || 0,
        minimumStock: input.minimumStock || 10,
        warehouseLocation: input.warehouseLocation || null,
      },
    });
  }

  async update(id: string, input: UpdateProductInput) {
    await this.getById(id);

    const data: any = { ...input };
    if (data.warehouseLocation === '') data.warehouseLocation = null;

    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.getById(id);
    return prisma.product.delete({ where: { id } });
  }

  async updateImage(id: string, imageUrl: string, imageKey: string) {
    return prisma.product.update({
      where: { id },
      data: { imageUrl, imageKey },
    });
  }

  async getCategories() {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return categories.map((c) => c.category);
  }
}

export const productService = new ProductService();
