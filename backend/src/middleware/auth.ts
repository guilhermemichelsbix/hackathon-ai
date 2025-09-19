import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import { prisma } from '@/utils/database';
import { AuthenticatedRequest, UnauthorizedError } from '@/types';
import { logger } from '@/utils/logger';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new UnauthorizedError('Token de acesso não fornecido');
    }

    const decoded = verifyAccessToken(token);
    
    // Fetch user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        locale: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }

    res.status(401).json({
      success: false,
      error: 'Token inválido',
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        locale: true,
        createdAt: true,
      },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // For optional auth, we continue even if token is invalid
    next();
  }
};
