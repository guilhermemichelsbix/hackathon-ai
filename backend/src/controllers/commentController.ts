import { Request, Response, NextFunction } from 'express';
import { CommentService } from '@/services/commentService';
import { AuthenticatedRequest } from '@/types';
import { ApiResponse } from '@/types';

export class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  createComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const comment = await this.commentService.createComment(req.params.id, req.body, req.user.id);
      
      const response: ApiResponse = {
        success: true,
        data: comment,
        message: 'Comentário adicionado com sucesso',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getCommentsByCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comments = await this.commentService.getCommentsByCard(req.params.id);
      
      const response: ApiResponse = {
        success: true,
        data: comments,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const comment = await this.commentService.updateComment(req.params.id, req.body, req.user.id);
      
      const response: ApiResponse = {
        success: true,
        data: comment,
        message: 'Comentário atualizado com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const result = await this.commentService.deleteComment(req.params.id, req.user.id);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Comentário excluído com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getCommentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comment = await this.commentService.getCommentById(req.params.id);
      
      const response: ApiResponse = {
        success: true,
        data: comment,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getCommentCountByCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.commentService.getCommentCountByCard(req.params.id);
      
      const response: ApiResponse = {
        success: true,
        data: { count },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
