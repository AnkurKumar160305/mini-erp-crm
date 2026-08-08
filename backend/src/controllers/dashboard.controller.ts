import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess, sendError } from '../utils/response';

export class DashboardController {
  async getStats(req: Request, res: Response) {
    try {
      const stats = await dashboardService.getStats();
      sendSuccess(res, stats);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch stats', error.statusCode || 500);
    }
  }

  async getCharts(req: Request, res: Response) {
    try {
      const charts = await dashboardService.getCharts();
      sendSuccess(res, charts);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch charts', error.statusCode || 500);
    }
  }
}

export const dashboardController = new DashboardController();
