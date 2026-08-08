import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { uploadImage } from '../middleware/upload.middleware';

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products with search, filter, pagination
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: lowStock
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Paginated product list
 */
router.get('/', requireAuth, (req, res) => productController.list(req, res));

/**
 * @swagger
 * /products/categories:
 *   get:
 *     tags: [Products]
 *     summary: Get all product categories
 *     responses:
 *       200:
 *         description: Category list
 */
router.get('/categories', requireAuth, (req, res) => productController.getCategories(req, res));

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/:id', requireAuth, (req, res) => productController.getById(req, res));

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/', requireAuth, requireRole('ADMIN'), validate(createProductSchema), (req, res) => productController.create(req, res));

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     tags: [Products]
 *     summary: Update a product
 *     responses:
 *       200:
 *         description: Product updated
 */
router.patch('/:id', requireAuth, requireRole('ADMIN'), validate(updateProductSchema), (req, res) => productController.update(req, res));

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete('/:id', requireAuth, requireRole('ADMIN'), (req, res) => productController.delete(req, res));

/**
 * @swagger
 * /products/{id}/image:
 *   post:
 *     tags: [Products]
 *     summary: Upload product image to S3
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *     responses:
 *       200:
 *         description: Image uploaded
 */
router.post('/:id/image', requireAuth, requireRole('ADMIN'), uploadImage, (req, res) => productController.uploadImage(req, res));

export default router;
