import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/authService';
import { AuthenticatedRequest } from '@/types';
import { ApiResponse } from '@/types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Usuário registrado com sucesso',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login realizado com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token é obrigatório',
        });
      }

      const result = await this.authService.refreshToken(refreshToken);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Token renovado com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const response: ApiResponse = {
        success: true,
        data: req.user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // In a real implementation, you might want to blacklist the token
      // For now, we'll just return success since JWT is stateless
      
      const response: ApiResponse = {
        success: true,
        message: 'Logout realizado com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
