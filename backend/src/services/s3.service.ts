import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { env } from '../config/env';

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export class S3Service {
  private bucket = env.AWS_S3_BUCKET;

  /**
   * Upload a product image to S3
   * Returns the S3 key and public URL
   */
  async uploadProductImage(file: Express.Multer.File): Promise<{ imageKey: string; imageUrl: string }> {
    const ext = path.extname(file.originalname).toLowerCase();
    const key = `products/${uuidv4()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    const imageUrl = `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

    return { imageKey: key, imageUrl };
  }

  /**
   * Delete a product image from S3
   */
  async deleteProductImage(imageKey: string): Promise<void> {
    if (!imageKey) return;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: imageKey,
      });

      await s3Client.send(command);
    } catch (error) {
      console.error('Error deleting S3 object:', error);
      // Don't throw — deletion failure shouldn't break the flow
    }
  }

  /**
   * Check if S3 is configured
   */
  isConfigured(): boolean {
    return !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET);
  }
}

export const s3Service = new S3Service();
