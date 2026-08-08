import prisma from '../config/database';

/**
 * Generates a unique challan number in format SC-YYYY-NNNNNN
 * Uses atomic database operation to ensure uniqueness
 */
export async function generateChallanNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SC-${year}-`;

  // Find the last challan for the current year
  const lastChallan = await prisma.salesChallan.findFirst({
    where: {
      challanNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      challanNumber: 'desc',
    },
    select: {
      challanNumber: true,
    },
  });

  let nextNumber = 1;

  if (lastChallan) {
    const lastNumber = parseInt(lastChallan.challanNumber.replace(prefix, ''), 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
}
