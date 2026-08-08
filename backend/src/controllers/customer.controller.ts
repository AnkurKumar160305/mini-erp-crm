import { Request, Response } from 'express';
import { customerService } from '../services/customer.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, sendPaginated, parsePagination, buildPagination } from '../utils/response';

export class CustomerController {
  async list(req: Request, res: Response) {
    try {
      const { page, limit, skip } = parsePagination(req.query as any);
      const { search, status, customerType, sortBy, sortOrder } = req.query as any;

      const { customers, total } = await customerService.list({
        page, limit, skip, search, status, customerType, sortBy, sortOrder,
      });

      sendPaginated(res, customers, buildPagination(page, limit, total));
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch customers', error.statusCode || 500);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const customer = await customerService.getById(req.params.id);
      sendSuccess(res, customer);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch customer', error.statusCode || 500);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const customer = await customerService.create(req.body);
      sendSuccess(res, customer, 'Customer created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create customer', error.statusCode || 500);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const customer = await customerService.update(req.params.id, req.body);
      sendSuccess(res, customer, 'Customer updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update customer', error.statusCode || 500);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await customerService.delete(req.params.id);
      sendSuccess(res, null, 'Customer deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete customer', error.statusCode || 500);
    }
  }

  async getFollowUps(req: Request, res: Response) {
    try {
      const followUps = await customerService.getFollowUps(req.params.id);
      sendSuccess(res, followUps);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch follow-ups', error.statusCode || 500);
    }
  }

  async addFollowUp(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Not authenticated', 401);
      const followUp = await customerService.addFollowUp(req.params.id, req.body, req.user.id);
      sendSuccess(res, followUp, 'Follow-up added successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to add follow-up', error.statusCode || 500);
    }
  }
}

export const customerController = new CustomerController();
