import { UserRepository } from '@/repositories/userRepository';
import { hashPassword, comparePassword } from '@/utils/bcrypt';
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt';
import { RegisterRequest, LoginRequest, AuthResponse } from '@/types';
import { AppError, ValidationError, UnauthorizedError } from '@/types';
import { logger } from '@/utils/logger';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ValidationError('Usuário com este email já existe');
      }

      // Hash password
      const passwordHash = await hashPassword(data.password);

      // Create user
      const user = await this.userRepository.create({
        name: data.name,
        email: data.email,
        passwordHash,
        locale: data.locale || 'pt-BR',
      });

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      logger.info(`User registered: ${user.email}`);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          locale: user.locale,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) {
        throw new UnauthorizedError('Credenciais inválidas');
      }

      // Verify password
      const isValidPassword = await comparePassword(data.password, user.passwordHash);
      if (!isValidPassword) {
        throw new UnauthorizedError('Credenciais inválidas');
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      logger.info(`User logged in: ${user.email}`);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          locale: user.locale,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const { verifyRefreshToken } = await import('@/utils/jwt');
      const decoded = verifyRefreshToken(refreshToken);

      // Find user
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError('Usuário não encontrado');
      }

      // Generate new access token
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      return { accessToken };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new UnauthorizedError('Token de refresh inválido');
    }
  }

  async getCurrentUser(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UnauthorizedError('Usuário não encontrado');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        locale: user.locale,
        createdAt: user.createdAt,
      };
    } catch (error) {
      logger.error('Get current user error:', error);
      throw error;
    }
  }
}
