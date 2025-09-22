import { Request, Response } from 'express';
import { PollService } from '../services/pollService';
import { AppError } from '../types';

export class PollController {
  private pollService: PollService;

  constructor() {
    this.pollService = new PollService();
  }
  createPoll = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const poll = await this.pollService.createPoll(req.body, userId);
      res.status(201).json({ success: true, data: poll });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false, 
          error: error.message 
        });
      } else {
        console.error('Error creating poll:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Internal server error' 
        });
      }
    }
  }

  getPollById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const poll = await this.pollService.getPollById(id, userId);
      res.json({ success: true, data: poll });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false, 
          error: error.message 
        });
      } else {
        console.error('Error getting poll:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Internal server error' 
        });
      }
    }
  }

  getPollsByCardId = async (req: Request, res: Response) => {
    try {
      const { cardId } = req.params;
      const userId = req.user?.id;

      const polls = await this.pollService.getPollsByCardId(cardId, userId);
      res.json({ success: true, data: polls });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false, 
          error: error.message 
        });
      } else {
        console.error('Error getting polls by card:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Internal server error' 
        });
      }
    }
  }

  updatePoll = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const poll = await this.pollService.updatePoll(id, req.body, userId);
      res.json({ success: true, data: poll });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false, 
          error: error.message 
        });
      } else {
        console.error('Error updating poll:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Internal server error' 
        });
      }
    }
  }

  deletePoll = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      await this.pollService.deletePoll(id, userId);
      res.json({ success: true, message: 'Poll deleted successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false, 
          error: error.message 
        });
      } else {
        console.error('Error deleting poll:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Internal server error' 
        });
      }
    }
  }

  votePoll = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { optionIds } = req.body;
      const poll = await this.pollService.votePoll(id, optionIds, userId);
      res.json({ success: true, data: poll });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false, 
          error: error.message 
        });
      } else {
        console.error('Error voting on poll:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Internal server error' 
        });
      }
    }
  }

  removeVote = async (req: Request, res: Response) => {
    try {
      const { id, optionId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const poll = await this.pollService.removeVote(id, optionId, userId);
      res.json({ success: true, data: poll });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false, 
          error: error.message 
        });
      } else {
        console.error('Error removing vote:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Internal server error' 
        });
      }
    }
  }

  getUserVotes = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const votes = await this.pollService.getUserVotes(id, userId);
      res.json({ success: true, data: votes });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false, 
          error: error.message 
        });
      } else {
        console.error('Error getting user votes:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Internal server error' 
        });
      }
    }
  }
}
