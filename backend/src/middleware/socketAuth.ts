import jwt from 'jsonwebtoken';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export const authenticateSocket = async (token: string): Promise<AuthenticatedUser | null> => {
  try {
    logger.info('🔍 Authenticating socket with token:', token.substring(0, 20) + '...');
    
    // Verificar o token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || !decoded.userId) {
      logger.error('❌ Invalid token structure');
      return null;
    }

    logger.info('🔍 Token decoded, userId:', decoded.userId);

    // Buscar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      logger.error('❌ User not found for userId:', decoded.userId);
      return null;
    }

    logger.info('✅ User authenticated:', user.name);
    return user;
  } catch (error) {
    logger.error('❌ Erro na autenticação do socket:', error);
    return null;
  }
};
