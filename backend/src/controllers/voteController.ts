import { Request, Response, NextFunction } from 'express';
import { VoteService } from '@/services/voteService';
import { AuthenticatedRequest } from '@/types';
import { ApiResponse } from '@/types';

export class VoteController {
  private voteService: VoteService;

  constructor() {
    this.voteService = new VoteService();
  }

  addVote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const vote = await this.voteService.addVote(req.params.id, req.user.id);
      
      const response: ApiResponse = {
        success: true,
        data: vote,
        message: 'Voto adicionado com sucesso',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  removeVote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const vote = await this.voteService.removeVote(req.params.id, req.user.id);
      
      const response: ApiResponse = {
        success: true,
        data: vote,
        message: 'Voto removido com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getVotesByCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const votes = await this.voteService.getVotesByCard(req.params.id);
      
      const response: ApiResponse = {
        success: true,
        data: votes,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getVoteCountByCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.voteService.getVoteCountByCard(req.params.id);
      
      const response: ApiResponse = {
        success: true,
        data: { count },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  hasUserVoted = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const hasVoted = await this.voteService.hasUserVoted(req.params.id, req.user.id);
      
      const response: ApiResponse = {
        success: true,
        data: { hasVoted },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
