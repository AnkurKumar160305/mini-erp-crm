import { Response } from 'express';
import { ApiResponse, PaginationResult } from '../types';

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationResult,
  message?: string
): void {
  const response: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    pagination,
  };
  res.status(200).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: any[]
): void {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };
  res.status(statusCode).json(response);
}

export function parsePagination(query: { page?: string; limit?: string }) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(query.limit || '10', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPagination(page: number, limit: number, total: number): PaginationResult {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
