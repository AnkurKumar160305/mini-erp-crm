import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { createStockMovementSchema } from '../validators/inventory.validator';

const router = Router();

/**
 * @swagger
 * /inventory:
 *   get:
 *     tags: [Inventory]
 *     summary: Get inventory list
 *     responses:
 *       200:
 *         description: Inventory with stock levels
 */
router.get('/', requireAuth, requireRole('ADMIN', 'SALES', 'WAREHOUSE'), (req, res) => inventoryController.getInventory(req, res));

/**
 * @swagger
 * /inventory/low-stock:
 *   get:
 *     tags: [Inventory]
 *     summary: Get products with low stock
 *     responses:
 *       200:
 *         description: Low stock products
 */
router.get('/low-stock', requireAuth, requireRole('ADMIN', 'WAREHOUSE'), (req, res) => inventoryController.getLowStock(req, res));

/**
 * @swagger
 * /inventory/movements:
 *   get:
 *     tags: [Inventory]
 *     summary: Get stock movement history
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema: { type: string }
 *       - in: query
 *         name: movementType
 *         schema: { type: string, enum: [IN, OUT] }
 *     responses:
 *       200:
 *         description: Stock movements
 */
router.get('/movements', requireAuth, requireRole('ADMIN', 'WAREHOUSE'), (req, res) => inventoryController.getMovements(req, res));

/**
 * @swagger
 * /inventory/movements:
 *   post:
 *     tags: [Inventory]
 *     summary: Create a stock movement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity, movementType]
 *     responses:
 *       201:
 *         description: Stock movement created
 *       400:
 *         description: Insufficient stock
 */
router.post('/movements', requireAuth, requireRole('ADMIN', 'WAREHOUSE'), validate(createStockMovementSchema), (req, res) => inventoryController.createMovement(req, res));

export default router;
