import prisma from '../config/database';

export class DashboardService {
  async getStats() {
    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      draftChallans,
      confirmedChallans,
      cancelledChallans,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count(),
      prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM products WHERE "currentStock" <= "minimumStock" AND "currentStock" > 0`,
      prisma.product.count({ where: { currentStock: 0 } }),
      prisma.salesChallan.count({ where: { status: 'DRAFT' } }),
      prisma.salesChallan.count({ where: { status: 'CONFIRMED' } }),
      prisma.salesChallan.count({ where: { status: 'CANCELLED' } }),
    ]);

    const totalStockResult = await prisma.$queryRaw<[{ total: bigint | null }]>`
      SELECT COALESCE(SUM("currentStock"), 0) as total FROM products
    `;

    return {
      totalCustomers,
      activeCustomers,
      totalProducts,
      totalStock: Number(totalStockResult[0].total || 0),
      lowStockProducts: Number(lowStockProducts[0]?.count || 0),
      outOfStockProducts,
      draftChallans,
      confirmedChallans,
      cancelledChallans,
    };
  }

  async getCharts() {
    // Customer distribution by type
    const customerDistribution = await prisma.customer.groupBy({
      by: ['customerType'],
      _count: { _all: true },
    });

    // Customer status distribution
    const customerStatusDist = await prisma.customer.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    // Challan status distribution
    const challanStatusDist = await prisma.salesChallan.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    // Product category distribution
    const categoryDist = await prisma.product.groupBy({
      by: ['category'],
      _count: { _all: true },
      _sum: { currentStock: true },
    });

    // Recent challans (last 30 days trend)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentChallans = await prisma.salesChallan.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, status: true, totalAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    // Recent activity
    const recentActivity = await prisma.stockMovement.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, sku: true } },
        user: { select: { name: true } },
      },
    });

    return {
      customerDistribution: customerDistribution.map((c) => ({
        name: c.customerType,
        value: c._count._all,
      })),
      customerStatusDistribution: customerStatusDist.map((c) => ({
        name: c.status,
        value: c._count._all,
      })),
      challanStatusDistribution: challanStatusDist.map((c) => ({
        name: c.status,
        value: c._count._all,
      })),
      categoryDistribution: categoryDist.map((c) => ({
        name: c.category,
        count: c._count._all,
        stock: c._sum.currentStock || 0,
      })),
      challanTrend: recentChallans,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        type: a.movementType,
        product: a.product.name,
        sku: a.product.sku,
        quantity: a.quantity,
        reason: a.reason,
        user: a.user.name,
        date: a.createdAt,
      })),
    };
  }
}

export const dashboardService = new DashboardService();
