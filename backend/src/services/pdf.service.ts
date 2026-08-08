import PDFDocument from 'pdfkit';
import prisma from '../config/database';

export class PdfService {
  async generateChallanPdf(challanId: string): Promise<Buffer> {
    const challan = await prisma.salesChallan.findUnique({
      where: { id: challanId },
      include: {
        customer: true,
        items: true,
        user: { select: { name: true } },
      },
    });

    if (!challan) {
      throw { statusCode: 404, message: 'Challan not found' };
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ── Header ────────────────────────────────────────
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('MINI ERP + CRM', { align: 'center' })
        .fontSize(10)
        .font('Helvetica')
        .text('Wholesale Distribution Company', { align: 'center' })
        .text('123 Business Park, Mumbai, India', { align: 'center' })
        .moveDown(0.5);

      // Divider
      doc
        .strokeColor('#3B82F6')
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke()
        .moveDown(0.5);

      // ── Document Title ────────────────────────────────
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('SALES CHALLAN', { align: 'center' })
        .moveDown(0.5);

      // ── Challan Info ──────────────────────────────────
      const infoY = doc.y;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Challan Number:', 50, infoY)
        .font('Helvetica')
        .text(challan.challanNumber, 160, infoY)
        .font('Helvetica-Bold')
        .text('Date:', 350, infoY)
        .font('Helvetica')
        .text(new Date(challan.createdAt).toLocaleDateString('en-IN'), 400, infoY)
        .font('Helvetica-Bold')
        .text('Status:', 350, infoY + 15)
        .font('Helvetica')
        .text(challan.status, 400, infoY + 15);

      doc.y = infoY + 40;
      doc.moveDown(0.5);

      // ── Customer Details ──────────────────────────────
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Bill To:')
        .moveDown(0.3);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Customer: ${challan.customer.customerName}`);
      if (challan.customer.businessName) {
        doc.text(`Business: ${challan.customer.businessName}`);
      }
      doc.text(`Mobile: ${challan.customer.mobile}`);
      if (challan.customer.email) {
        doc.text(`Email: ${challan.customer.email}`);
      }
      if (challan.customer.gstNumber) {
        doc.text(`GST: ${challan.customer.gstNumber}`);
      }
      if (challan.customer.address) {
        doc.text(`Address: ${challan.customer.address}`);
      }

      doc.moveDown(1);

      // ── Items Table ───────────────────────────────────
      const tableTop = doc.y;
      const colX = {
        num: 50,
        product: 80,
        sku: 230,
        qty: 330,
        price: 400,
        amount: 480,
      };

      // Table header
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#FFFFFF')
        .rect(50, tableTop, 495, 20)
        .fill('#3B82F6');

      doc
        .fillColor('#FFFFFF')
        .text('#', colX.num + 5, tableTop + 5, { width: 25 })
        .text('Product', colX.product + 5, tableTop + 5, { width: 140 })
        .text('SKU', colX.sku + 5, tableTop + 5, { width: 90 })
        .text('Qty', colX.qty + 5, tableTop + 5, { width: 60 })
        .text('Unit Price', colX.price + 5, tableTop + 5, { width: 70 })
        .text('Amount', colX.amount + 5, tableTop + 5, { width: 60 });

      doc.fillColor('#000000');

      // Table rows
      let y = tableTop + 25;
      challan.items.forEach((item, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        const bgColor = index % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
        doc.rect(50, y - 3, 495, 20).fill(bgColor);

        doc
          .fillColor('#000000')
          .font('Helvetica')
          .fontSize(9)
          .text(`${index + 1}`, colX.num + 5, y, { width: 25 })
          .text(item.productNameSnapshot, colX.product + 5, y, { width: 140 })
          .text(item.skuSnapshot, colX.sku + 5, y, { width: 90 })
          .text(`${item.quantity}`, colX.qty + 5, y, { width: 60 })
          .text(`₹${item.unitPriceSnapshot.toFixed(2)}`, colX.price + 5, y, { width: 70 })
          .text(`₹${item.totalPrice.toFixed(2)}`, colX.amount + 5, y, { width: 60 });

        y += 20;
      });

      // ── Totals ────────────────────────────────────────
      y += 10;
      doc
        .strokeColor('#E2E8F0')
        .lineWidth(1)
        .moveTo(350, y)
        .lineTo(545, y)
        .stroke();

      y += 10;
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Total Quantity:', 350, y)
        .text(`${challan.totalQuantity}`, 480, y, { width: 65 });

      y += 20;
      doc
        .fontSize(12)
        .text('Grand Total:', 350, y)
        .text(`₹${challan.totalAmount.toFixed(2)}`, 470, y, { width: 75 });

      // ── Footer ────────────────────────────────────────
      doc.moveDown(3);
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#64748B')
        .text(`Created by: ${challan.user.name}`, 50)
        .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50)
        .moveDown(2)
        .text('This is a computer-generated document.', 50, undefined, { align: 'center' });

      doc.end();
    });
  }
}

export const pdfService = new PdfService();
