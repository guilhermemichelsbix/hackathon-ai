import { Request, Response, NextFunction } from 'express';
import { CardService } from '@/services/cardService';
import { AuthenticatedRequest } from '@/types';
import { ApiResponse, PaginatedResponse } from '@/types';

export class CardController {
  private cardService: CardService;

  constructor() {
    this.cardService = new CardService();
  }

  createCard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const card = await this.cardService.createCard(req.body, req.user.id);
      
      const response: ApiResponse = {
        success: true,
        data: card,
        message: 'Card criado com sucesso',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.cardService.getCards(req.query);
      
      const response: PaginatedResponse = {
        success: true,
        data: result.cards,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.cards.length < result.total,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getCardById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const card = await this.cardService.getCardById(req.params.id);
      
      const response: ApiResponse = {
        success: true,
        data: card,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateCard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const card = await this.cardService.updateCard(req.params.id, req.body, req.user.id);
      
      const response: ApiResponse = {
        success: true,
        data: card,
        message: 'Card atualizado com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteCard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const result = await this.cardService.deleteCard(req.params.id, req.user.id);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Card excluído com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  moveCard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const card = await this.cardService.moveCard(req.params.id, req.body, req.user.id);
      
      const response: ApiResponse = {
        success: true,
        data: card,
        message: 'Card movido com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getCardsByColumn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cards = await this.cardService.getCardsByColumn(req.params.columnId);
      
      const response: ApiResponse = {
        success: true,
        data: cards,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
