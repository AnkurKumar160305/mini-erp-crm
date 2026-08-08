import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      sendError(res, error.message || 'Login failed', error.statusCode || 500);
    }
  }

  async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }
      const user = await authService.getMe(req.user.id);
      sendSuccess(res, user);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get user', error.statusCode || 500);
    }
  }
}

export const authController = new AuthController();
