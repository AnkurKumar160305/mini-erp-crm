import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const DEMO_PASSWORD = 'Password123!';

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.salesChallanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerFollowUp.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  // ─── Users ─────────────────────────────────────────
  console.log('👤 Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: { name: 'Admin User', email: 'admin@example.com', passwordHash, role: 'ADMIN' },
    }),
    prisma.user.create({
      data: { name: 'Sales Manager', email: 'sales@example.com', passwordHash, role: 'SALES' },
    }),
    prisma.user.create({
      data: { name: 'Warehouse Manager', email: 'warehouse@example.com', passwordHash, role: 'WAREHOUSE' },
    }),
    prisma.user.create({
      data: { name: 'Accounts Manager', email: 'accounts@example.com', passwordHash, role: 'ACCOUNTS' },
    }),
  ]);

  const [admin, sales, warehouse, accounts] = users;

  // ─── Customers ─────────────────────────────────────
  console.log('👥 Creating customers...');
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        customerName: 'Rajesh Sharma',
        mobile: '9876543210',
        email: 'rajesh@sharma.com',
        businessName: 'Sharma Trading Co.',
        gstNumber: '27AADCS0472N1ZT',
        customerType: 'WHOLESALE',
        address: '123 Market Street, Mumbai, MH 400001',
        status: 'ACTIVE',
        notes: 'Premium wholesale client. Bulk orders monthly.',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Priya Patel',
        mobile: '9876543211',
        email: 'priya@patel.in',
        businessName: 'Patel Enterprises',
        gstNumber: '24AADCP0847Q1ZX',
        customerType: 'DISTRIBUTOR',
        address: '456 Industrial Area, Ahmedabad, GJ 380015',
        status: 'ACTIVE',
        notes: 'Distributor for Gujarat region.',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Amit Kumar',
        mobile: '9876543212',
        email: 'amit@retail.com',
        businessName: 'Kumar General Store',
        customerType: 'RETAIL',
        address: '789 Main Road, Delhi, DL 110001',
        status: 'ACTIVE',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Sunita Reddy',
        mobile: '9876543213',
        email: 'sunita@reddy.co',
        businessName: 'Reddy Distributors',
        gstNumber: '36AADCR0123S1ZV',
        customerType: 'DISTRIBUTOR',
        address: '101 Tech Park, Hyderabad, TS 500081',
        status: 'ACTIVE',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Vikram Singh',
        mobile: '9876543214',
        businessName: 'Singh Brothers',
        customerType: 'WHOLESALE',
        address: '222 Wholesale Market, Jaipur, RJ 302001',
        status: 'LEAD',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes: 'Interested in bulk orders. Follow up next week.',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Neha Gupta',
        mobile: '9876543215',
        email: 'neha@gupta.in',
        businessName: 'Gupta & Sons',
        customerType: 'WHOLESALE',
        address: '333 Commercial Complex, Lucknow, UP 226001',
        status: 'ACTIVE',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Rahul Verma',
        mobile: '9876543216',
        email: 'rahul@verma.biz',
        customerType: 'RETAIL',
        address: '444 Shopping Mall, Pune, MH 411001',
        status: 'INACTIVE',
        notes: 'Account inactive since 6 months.',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Ananya Desai',
        mobile: '9876543217',
        email: 'ananya@desai.com',
        businessName: 'Desai Traders',
        gstNumber: '27AADCD0912M1ZR',
        customerType: 'WHOLESALE',
        address: '555 Trade Center, Nashik, MH 422001',
        status: 'ACTIVE',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Karthik Nair',
        mobile: '9876543218',
        email: 'karthik@nair.in',
        businessName: 'Nair Enterprises',
        customerType: 'DISTRIBUTOR',
        address: '666 Business Hub, Kochi, KL 682001',
        status: 'LEAD',
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Deepa Iyer',
        mobile: '9876543219',
        email: 'deepa@iyer.co',
        businessName: 'Iyer Associates',
        customerType: 'RETAIL',
        address: '777 High Street, Chennai, TN 600001',
        status: 'ACTIVE',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Manish Agarwal',
        mobile: '9876543220',
        email: 'manish@agarwal.biz',
        businessName: 'Agarwal Industries',
        gstNumber: '09AADCA0567P1ZQ',
        customerType: 'WHOLESALE',
        address: '888 Factory Area, Kanpur, UP 208001',
        status: 'ACTIVE',
      },
    }),
    prisma.customer.create({
      data: {
        customerName: 'Sanjay Mehta',
        mobile: '9876543221',
        email: 'sanjay@mehta.com',
        businessName: 'Mehta Supplies',
        customerType: 'WHOLESALE',
        address: '999 Market Road, Surat, GJ 395001',
        status: 'LEAD',
      },
    }),
  ]);

  // ─── Follow-ups ────────────────────────────────────
  console.log('📝 Creating follow-ups...');
  await Promise.all([
    prisma.customerFollowUp.create({
      data: {
        customerId: customers[0].id,
        note: 'Discussed bulk pricing for next quarter. Will send revised quotation.',
        followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdBy: sales.id,
      },
    }),
    prisma.customerFollowUp.create({
      data: {
        customerId: customers[0].id,
        note: 'Initial meeting completed. Very interested in our product line.',
        createdBy: sales.id,
      },
    }),
    prisma.customerFollowUp.create({
      data: {
        customerId: customers[1].id,
        note: 'Sent distribution agreement draft. Awaiting feedback.',
        followUpDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        createdBy: sales.id,
      },
    }),
    prisma.customerFollowUp.create({
      data: {
        customerId: customers[4].id,
        note: 'Cold call — showed interest. Schedule demo next week.',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: sales.id,
      },
    }),
    prisma.customerFollowUp.create({
      data: {
        customerId: customers[8].id,
        note: 'Meeting scheduled for product demonstration.',
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdBy: admin.id,
      },
    }),
  ]);

  // ─── Products ──────────────────────────────────────
  console.log('📦 Creating products...');
  const products = await Promise.all([
    prisma.product.create({
      data: { name: 'Premium Basmati Rice 5kg', sku: 'RIC-BAS-5KG', category: 'Grains', unitPrice: 450, currentStock: 200, minimumStock: 50, warehouseLocation: 'A1-01' },
    }),
    prisma.product.create({
      data: { name: 'Extra Virgin Olive Oil 1L', sku: 'OIL-OLV-1LT', category: 'Oils', unitPrice: 850, currentStock: 75, minimumStock: 20, warehouseLocation: 'B2-03' },
    }),
    prisma.product.create({
      data: { name: 'Organic Turmeric Powder 500g', sku: 'SPC-TUR-500', category: 'Spices', unitPrice: 180, currentStock: 300, minimumStock: 100, warehouseLocation: 'C1-05' },
    }),
    prisma.product.create({
      data: { name: 'Darjeeling Tea Leaves 250g', sku: 'TEA-DAR-250', category: 'Beverages', unitPrice: 320, currentStock: 150, minimumStock: 40, warehouseLocation: 'D3-02' },
    }),
    prisma.product.create({
      data: { name: 'Cashew Nuts Premium 1kg', sku: 'NUT-CSH-1KG', category: 'Dry Fruits', unitPrice: 1200, currentStock: 80, minimumStock: 25, warehouseLocation: 'E1-01' },
    }),
    prisma.product.create({
      data: { name: 'Pure Honey 500g', sku: 'HNY-PUR-500', category: 'Sweeteners', unitPrice: 350, currentStock: 120, minimumStock: 30, warehouseLocation: 'F2-04' },
    }),
    prisma.product.create({
      data: { name: 'Almond Butter 350g', sku: 'NUT-ALM-350', category: 'Dry Fruits', unitPrice: 580, currentStock: 45, minimumStock: 15, warehouseLocation: 'E1-03' },
    }),
    prisma.product.create({
      data: { name: 'Black Pepper Whole 250g', sku: 'SPC-BPP-250', category: 'Spices', unitPrice: 220, currentStock: 180, minimumStock: 60, warehouseLocation: 'C1-02' },
    }),
    prisma.product.create({
      data: { name: 'Saffron Kashmir 5g', sku: 'SPC-SAF-005', category: 'Spices', unitPrice: 950, currentStock: 30, minimumStock: 10, warehouseLocation: 'C2-01' },
    }),
    prisma.product.create({
      data: { name: 'Coconut Oil Cold Pressed 1L', sku: 'OIL-COC-1LT', category: 'Oils', unitPrice: 280, currentStock: 160, minimumStock: 40, warehouseLocation: 'B2-01' },
    }),
    prisma.product.create({
      data: { name: 'Green Tea Organic 100g', sku: 'TEA-GRN-100', category: 'Beverages', unitPrice: 250, currentStock: 90, minimumStock: 25, warehouseLocation: 'D3-04' },
    }),
    prisma.product.create({
      data: { name: 'Quinoa White 500g', sku: 'GRN-QNA-500', category: 'Grains', unitPrice: 380, currentStock: 60, minimumStock: 20, warehouseLocation: 'A2-03' },
    }),
    prisma.product.create({
      data: { name: 'Flax Seeds 250g', sku: 'SED-FLX-250', category: 'Seeds', unitPrice: 150, currentStock: 200, minimumStock: 50, warehouseLocation: 'G1-01' },
    }),
    prisma.product.create({
      data: { name: 'Chia Seeds Organic 200g', sku: 'SED-CHI-200', category: 'Seeds', unitPrice: 280, currentStock: 110, minimumStock: 30, warehouseLocation: 'G1-02' },
    }),
    prisma.product.create({
      data: { name: 'Jaggery Powder 1kg', sku: 'SWT-JGR-1KG', category: 'Sweeteners', unitPrice: 120, currentStock: 250, minimumStock: 80, warehouseLocation: 'F2-01' },
    }),
    prisma.product.create({
      data: { name: 'Ragi Flour 1kg', sku: 'GRN-RAG-1KG', category: 'Grains', unitPrice: 95, currentStock: 180, minimumStock: 60, warehouseLocation: 'A3-01' },
    }),
    prisma.product.create({
      data: { name: 'Walnut Kernels 250g', sku: 'NUT-WAL-250', category: 'Dry Fruits', unitPrice: 450, currentStock: 55, minimumStock: 15, warehouseLocation: 'E1-02' },
    }),
    prisma.product.create({
      data: { name: 'Mustard Oil 1L', sku: 'OIL-MST-1LT', category: 'Oils', unitPrice: 180, currentStock: 140, minimumStock: 40, warehouseLocation: 'B1-02' },
    }),
    prisma.product.create({
      data: { name: 'Cinnamon Sticks 100g', sku: 'SPC-CIN-100', category: 'Spices', unitPrice: 160, currentStock: 8, minimumStock: 20, warehouseLocation: 'C1-04' },
    }),
    prisma.product.create({
      data: { name: 'Pumpkin Seeds 200g', sku: 'SED-PMP-200', category: 'Seeds', unitPrice: 220, currentStock: 5, minimumStock: 25, warehouseLocation: 'G1-03' },
    }),
  ]);

  // ─── Stock Movements ──────────────────────────────
  console.log('📊 Creating stock movements...');
  for (const product of products) {
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        quantity: product.currentStock,
        movementType: 'IN',
        reason: 'Initial stock entry',
        createdBy: warehouse.id,
      },
    });
  }

  // Additional movements for realism
  await prisma.stockMovement.create({
    data: { productId: products[0].id, quantity: 50, movementType: 'OUT', reason: 'Bulk order — Sharma Trading', createdBy: warehouse.id },
  });
  await prisma.stockMovement.create({
    data: { productId: products[2].id, quantity: 25, movementType: 'OUT', reason: 'Distribution order', createdBy: warehouse.id },
  });
  await prisma.stockMovement.create({
    data: { productId: products[4].id, quantity: 30, movementType: 'IN', reason: 'Restocked from supplier', createdBy: warehouse.id },
  });
  await prisma.stockMovement.create({
    data: { productId: products[7].id, quantity: 15, movementType: 'OUT', reason: 'Retail fulfillment', createdBy: warehouse.id },
  });

  // ─── Sample Challans ──────────────────────────────
  console.log('📋 Creating sample challans...');

  // Draft challan
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'SC-2026-000001',
      customerId: customers[0].id,
      totalQuantity: 15,
      totalAmount: 11550,
      status: 'DRAFT',
      createdBy: sales.id,
      items: {
        create: [
          { productId: products[0].id, productNameSnapshot: products[0].name, skuSnapshot: products[0].sku, unitPriceSnapshot: products[0].unitPrice, quantity: 10, totalPrice: 4500 },
          { productId: products[2].id, productNameSnapshot: products[2].name, skuSnapshot: products[2].sku, unitPriceSnapshot: products[2].unitPrice, quantity: 5, totalPrice: 900 },
        ],
      },
    },
  });

  // Confirmed challan
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'SC-2026-000002',
      customerId: customers[1].id,
      totalQuantity: 25,
      totalAmount: 22250,
      status: 'CONFIRMED',
      createdBy: sales.id,
      items: {
        create: [
          { productId: products[1].id, productNameSnapshot: products[1].name, skuSnapshot: products[1].sku, unitPriceSnapshot: products[1].unitPrice, quantity: 10, totalPrice: 8500 },
          { productId: products[4].id, productNameSnapshot: products[4].name, skuSnapshot: products[4].sku, unitPriceSnapshot: products[4].unitPrice, quantity: 5, totalPrice: 6000 },
          { productId: products[3].id, productNameSnapshot: products[3].name, skuSnapshot: products[3].sku, unitPriceSnapshot: products[3].unitPrice, quantity: 10, totalPrice: 3200 },
        ],
      },
    },
  });

  // Another confirmed challan
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'SC-2026-000003',
      customerId: customers[2].id,
      totalQuantity: 8,
      totalAmount: 4560,
      status: 'CONFIRMED',
      createdBy: admin.id,
      items: {
        create: [
          { productId: products[5].id, productNameSnapshot: products[5].name, skuSnapshot: products[5].sku, unitPriceSnapshot: products[5].unitPrice, quantity: 3, totalPrice: 1050 },
          { productId: products[8].id, productNameSnapshot: products[8].name, skuSnapshot: products[8].sku, unitPriceSnapshot: products[8].unitPrice, quantity: 2, totalPrice: 1900 },
          { productId: products[7].id, productNameSnapshot: products[7].name, skuSnapshot: products[7].sku, unitPriceSnapshot: products[7].unitPrice, quantity: 3, totalPrice: 660 },
        ],
      },
    },
  });

  // Cancelled challan
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'SC-2026-000004',
      customerId: customers[6].id,
      totalQuantity: 20,
      totalAmount: 6400,
      status: 'CANCELLED',
      createdBy: sales.id,
      items: {
        create: [
          { productId: products[3].id, productNameSnapshot: products[3].name, skuSnapshot: products[3].sku, unitPriceSnapshot: products[3].unitPrice, quantity: 20, totalPrice: 6400 },
        ],
      },
    },
  });

  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Demo Credentials:');
  console.log('─────────────────────────────────────');
  console.log(`  Admin:     admin@example.com     / ${DEMO_PASSWORD}`);
  console.log(`  Sales:     sales@example.com     / ${DEMO_PASSWORD}`);
  console.log(`  Warehouse: warehouse@example.com / ${DEMO_PASSWORD}`);
  console.log(`  Accounts:  accounts@example.com  / ${DEMO_PASSWORD}`);
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
