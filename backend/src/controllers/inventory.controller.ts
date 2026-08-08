import { Request, Response } from 'express';
import { inventoryService } from '../services/inventory.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, sendPaginated, parsePagination, buildPagination } from '../utils/response';

export class InventoryController {
  async getInventory(req: Request, res: Response) {
    try {
      const { page, limit, skip } = parsePagination(req.query as any);
      const { search, category } = req.query as any;

      const { products, total } = await inventoryService.getInventory({
        page, limit, skip, search, category,
      });

      sendPaginated(res, products, buildPagination(page, limit, total));
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch inventory', error.statusCode || 500);
    }
  }

  async getLowStock(req: Request, res: Response) {
    try {
      const products = await inventoryService.getLowStock();
      sendSuccess(res, products);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch low stock', error.statusCode || 500);
    }
  }

  async getMovements(req: Request, res: Response) {
    try {
      const { page, limit, skip } = parsePagination(req.query as any);
      const { productId, movementType, startDate, endDate } = req.query as any;

      const { movements, total } = await inventoryService.getMovements({
        page, limit, skip, productId, movementType, startDate, endDate,
      });

      sendPaginated(res, movements, buildPagination(page, limit, total));
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch movements', error.statusCode || 500);
    }
  }

  async createMovement(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Not authenticated', 401);

      const movement = await inventoryService.createMovement(req.body, req.user.id);
      sendSuccess(res, movement, 'Stock movement recorded successfully', 201);
    } catch (error: any) {
      // Special handling for insufficient stock
      if (error.statusCode === 400 && error.availableStock !== undefined) {
        return res.status(400).json({
          success: false,
          message: error.message,
          availableStock: error.availableStock,
          requestedQuantity: error.requestedQuantity,
        });
      }
      sendError(res, error.message || 'Failed to create movement', error.statusCode || 500);
    }
  }
}

export const inventoryController = new InventoryController();
