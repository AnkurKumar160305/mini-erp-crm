import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { CreateCustomerInput, UpdateCustomerInput, CreateFollowUpInput } from '../validators/customer.validator';

export class CustomerService {
  async list(params: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    status?: string;
    customerType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const where: Prisma.CustomerWhereInput = {};

    if (params.search) {
      where.OR = [
        { customerName: { contains: params.search, mode: 'insensitive' } },
        { mobile: { contains: params.search, mode: 'insensitive' } },
        { businessName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.status) {
      where.status = params.status as any;
    }

    if (params.customerType) {
      where.customerType = params.customerType as any;
    }

    const orderBy: Prisma.CustomerOrderByWithRelationInput = {};
    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    (orderBy as any)[sortField] = sortOrder;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy,
        skip: params.skip,
        take: params.limit,
        include: {
          _count: { select: { followUps: true, challans: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total };
  }

  async getById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        _count: { select: { challans: true } },
      },
    });

    if (!customer) {
      throw { statusCode: 404, message: 'Customer not found' };
    }

    return customer;
  }

  async create(input: CreateCustomerInput) {
    return prisma.customer.create({
      data: {
        customerName: input.customerName,
        mobile: input.mobile,
        email: input.email || null,
        businessName: input.businessName || null,
        gstNumber: input.gstNumber || null,
        customerType: input.customerType,
        address: input.address || null,
        status: input.status,
        followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
        notes: input.notes || null,
      },
    });
  }

  async update(id: string, input: UpdateCustomerInput) {
    await this.getById(id);

    const data: any = { ...input };
    if (data.followUpDate) {
      data.followUpDate = new Date(data.followUpDate);
    }
    if (data.email === '') data.email = null;
    if (data.businessName === '') data.businessName = null;
    if (data.gstNumber === '') data.gstNumber = null;
    if (data.address === '') data.address = null;
    if (data.notes === '') data.notes = null;

    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.getById(id);
    return prisma.customer.delete({ where: { id } });
  }

  async getFollowUps(customerId: string) {
    await this.getById(customerId);
    return prisma.customerFollowUp.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async addFollowUp(customerId: string, input: CreateFollowUpInput, userId: string) {
    await this.getById(customerId);

    return prisma.customerFollowUp.create({
      data: {
        customerId,
        note: input.note,
        followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
        createdBy: userId,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }
}

export const customerService = new CustomerService();
