import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { createCustomerSchema, updateCustomerSchema, createFollowUpSchema } from '../validators/customer.validator';

const router = Router();

/**
 * @swagger
 * /customers:
 *   get:
 *     tags: [Customers]
 *     summary: List customers with search, filter, pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [LEAD, ACTIVE, INACTIVE] }
 *       - in: query
 *         name: customerType
 *         schema: { type: string, enum: [RETAIL, WHOLESALE, DISTRIBUTOR] }
 *     responses:
 *       200:
 *         description: Paginated customer list
 */
router.get('/', requireAuth, requireRole('ADMIN', 'SALES', 'ACCOUNTS'), (req, res) => customerController.list(req, res));

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Get customer by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer details
 *       404:
 *         description: Customer not found
 */
router.get('/:id', requireAuth, requireRole('ADMIN', 'SALES', 'ACCOUNTS'), (req, res) => customerController.getById(req, res));

/**
 * @swagger
 * /customers:
 *   post:
 *     tags: [Customers]
 *     summary: Create a new customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerName, mobile, customerType]
 *     responses:
 *       201:
 *         description: Customer created
 */
router.post('/', requireAuth, requireRole('ADMIN', 'SALES'), validate(createCustomerSchema), (req, res) => customerController.create(req, res));

/**
 * @swagger
 * /customers/{id}:
 *   patch:
 *     tags: [Customers]
 *     summary: Update a customer
 *     responses:
 *       200:
 *         description: Customer updated
 */
router.patch('/:id', requireAuth, requireRole('ADMIN', 'SALES'), validate(updateCustomerSchema), (req, res) => customerController.update(req, res));

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     tags: [Customers]
 *     summary: Delete a customer
 *     responses:
 *       200:
 *         description: Customer deleted
 */
router.delete('/:id', requireAuth, requireRole('ADMIN'), (req, res) => customerController.delete(req, res));

/**
 * @swagger
 * /customers/{id}/followups:
 *   get:
 *     tags: [Customers]
 *     summary: Get customer follow-ups
 *     responses:
 *       200:
 *         description: Follow-up list
 */
router.get('/:id/followups', requireAuth, requireRole('ADMIN', 'SALES'), (req, res) => customerController.getFollowUps(req, res));

/**
 * @swagger
 * /customers/{id}/followups:
 *   post:
 *     tags: [Customers]
 *     summary: Add a follow-up note
 *     responses:
 *       201:
 *         description: Follow-up added
 */
router.post('/:id/followups', requireAuth, requireRole('ADMIN', 'SALES'), validate(createFollowUpSchema), (req, res) => customerController.addFollowUp(req, res));

export default router;
