import { authService } from '../services/auth.service';
import prisma from '../config/database';
import bcrypt from 'bcrypt';

jest.mock('../config/database', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

describe('AuthService', () => {
  describe('login', () => {
    it('should return token and user if credentials are valid', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'Test User',
        role: 'SALES',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw an error for invalid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login('wrong@example.com', 'password123')).rejects.toThrow('Invalid credentials');
    });

    it('should throw an error for invalid password', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });
});
