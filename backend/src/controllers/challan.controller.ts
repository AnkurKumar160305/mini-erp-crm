import { Request, Response } from 'express';
import { challanService } from '../services/challan.service';
import { pdfService } from '../services/pdf.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, sendPaginated, parsePagination, buildPagination } from '../utils/response';

export class ChallanController {
  async list(req: Request, res: Response) {
    try {
      const { page, limit, skip } = parsePagination(req.query as any);
      const { search, status, customerId, sortBy, sortOrder } = req.query as any;

      const { challans, total } = await challanService.list({
        page, limit, skip, search, status, customerId, sortBy, sortOrder,
      });

      sendPaginated(res, challans, buildPagination(page, limit, total));
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch challans', error.statusCode || 500);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const challan = await challanService.getById(req.params.id);
      sendSuccess(res, challan);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch challan', error.statusCode || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Not authenticated', 401);
      const challan = await challanService.create(req.body, req.user.id);
      sendSuccess(res, challan, 'Challan saved as draft', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create challan', error.statusCode || 500);
    }
  }

  async confirm(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Not authenticated', 401);
      const challan = await challanService.confirm(req.params.id, req.user.id);
      sendSuccess(res, challan, 'Challan confirmed successfully');
    } catch (error: any) {
      // Handle insufficient stock with details
      if (error.insufficientItems) {
        return res.status(400).json({
          success: false,
          message: error.message,
          insufficientItems: error.insufficientItems,
        });
      }
      sendError(res, error.message || 'Failed to confirm challan', error.statusCode || 500);
    }
  }

  async cancel(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Not authenticated', 401);
      const challan = await challanService.cancel(req.params.id, req.user.id);
      sendSuccess(res, challan, 'Challan cancelled successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to cancel challan', error.statusCode || 500);
    }
  }

  async downloadPdf(req: Request, res: Response) {
    try {
      const challan = await challanService.getById(req.params.id);
      const pdfBuffer = await pdfService.generateChallanPdf(req.params.id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${challan.challanNumber}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to generate PDF', error.statusCode || 500);
    }
  }
}

export const challanController = new ChallanController();
