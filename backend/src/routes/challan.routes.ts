import { Router } from 'express';
import { challanController } from '../controllers/challan.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { createChallanSchema } from '../validators/challan.validator';

const router = Router();

/**
 * @swagger
 * /challans:
 *   get:
 *     tags: [Sales Challans]
 *     summary: List challans with search, filter, pagination
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, CONFIRMED, CANCELLED] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated challan list
 */
router.get('/', requireAuth, requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), (req, res) => challanController.list(req, res));

/**
 * @swagger
 * /challans/{id}:
 *   get:
 *     tags: [Sales Challans]
 *     summary: Get challan by ID
 *     responses:
 *       200:
 *         description: Challan details with items
 */
router.get('/:id', requireAuth, requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), (req, res) => challanController.getById(req, res));

/**
 * @swagger
 * /challans:
 *   post:
 *     tags: [Sales Challans]
 *     summary: Create a new draft challan
 *     responses:
 *       201:
 *         description: Draft challan created
 */
router.post('/', requireAuth, requireRole('ADMIN', 'SALES'), validate(createChallanSchema), (req, res) => challanController.create(req, res));

/**
 * @swagger
 * /challans/{id}/confirm:
 *   post:
 *     tags: [Sales Challans]
 *     summary: Confirm a draft challan (transaction-safe stock deduction)
 *     responses:
 *       200:
 *         description: Challan confirmed
 *       400:
 *         description: Insufficient stock or invalid status
 */
router.post('/:id/confirm', requireAuth, requireRole('ADMIN', 'SALES'), (req, res) => challanController.confirm(req, res));

/**
 * @swagger
 * /challans/{id}/cancel:
 *   post:
 *     tags: [Sales Challans]
 *     summary: Cancel a challan (with stock reversal if confirmed)
 *     responses:
 *       200:
 *         description: Challan cancelled
 */
router.post('/:id/cancel', requireAuth, requireRole('ADMIN'), (req, res) => challanController.cancel(req, res));

/**
 * @swagger
 * /challans/{id}/pdf:
 *   get:
 *     tags: [Sales Challans]
 *     summary: Download challan PDF
 *     produces:
 *       - application/pdf
 *     responses:
 *       200:
 *         description: PDF file
 */
router.get('/:id/pdf', requireAuth, requireRole('ADMIN', 'SALES', 'ACCOUNTS'), (req, res) => challanController.downloadPdf(req, res));

export default router;
