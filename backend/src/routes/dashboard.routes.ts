import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get('/stats', requireAuth, (req, res) => dashboardController.getStats(req, res));

/**
 * @swagger
 * /dashboard/charts:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get chart data
 *     responses:
 *       200:
 *         description: Chart data for dashboard
 */
router.get('/charts', requireAuth, (req, res) => dashboardController.getCharts(req, res));

export default router;
