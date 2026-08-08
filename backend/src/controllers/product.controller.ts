import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { s3Service } from '../services/s3.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, sendPaginated, parsePagination, buildPagination } from '../utils/response';

export class ProductController {
  async list(req: Request, res: Response) {
    try {
      const { page, limit, skip } = parsePagination(req.query as any);
      const { search, category, lowStock, sortBy, sortOrder } = req.query as any;

      const { products, total } = await productService.list({
        page, limit, skip, search, category,
        lowStock: lowStock === 'true',
        sortBy, sortOrder,
      });

      sendPaginated(res, products, buildPagination(page, limit, total));
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch products', error.statusCode || 500);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const product = await productService.getById(req.params.id);
      sendSuccess(res, product);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch product', error.statusCode || 500);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const product = await productService.create(req.body);
      sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create product', error.statusCode || 500);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const product = await productService.update(req.params.id, req.body);
      sendSuccess(res, product, 'Product updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update product', error.statusCode || 500);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await productService.delete(req.params.id);
      sendSuccess(res, null, 'Product deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete product', error.statusCode || 500);
    }
  }

  async uploadImage(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, 'No image file provided', 400);
      }

      if (!s3Service.isConfigured()) {
        return sendError(res, 'AWS S3 is not configured. Please set AWS credentials in environment variables.', 503);
      }

      const productId = req.params.id;

      // Get existing product to check for old image
      const existingProduct = await productService.getById(productId);

      // Delete old image from S3 if exists
      if (existingProduct.imageKey) {
        await s3Service.deleteProductImage(existingProduct.imageKey);
      }

      // Upload new image
      const { imageKey, imageUrl } = await s3Service.uploadProductImage(req.file);

      // Update product
      const product = await productService.updateImage(productId, imageUrl, imageKey);

      sendSuccess(res, product, 'Product image uploaded successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Failed to upload image', error.statusCode || 500);
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await productService.getCategories();
      sendSuccess(res, categories);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch categories', error.statusCode || 500);
    }
  }
}

export const productController = new ProductController();
