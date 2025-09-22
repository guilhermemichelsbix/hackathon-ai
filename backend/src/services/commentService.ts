import { CommentRepository } from '@/repositories/commentRepository';
import { CardRepository } from '@/repositories/cardRepository';
import { CreateCommentRequest, UpdateCommentRequest } from '@/types';
import { AppError, ValidationError, NotFoundError, ForbiddenError } from '@/types';
import { logger } from '@/utils/logger';
import { getSocketManager } from '@/utils/socketManager';

export class CommentService {
  private commentRepository: CommentRepository;
  private cardRepository: CardRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
    this.cardRepository = new CardRepository();
  }

  async createComment(cardId: string, data: CreateCommentRequest, userId: string) {
    try {
      // Verify card exists
      const card = await this.cardRepository.findById(cardId);
      if (!card) {
        throw new NotFoundError('Card');
      }

      // Create comment
      const comment = await this.commentRepository.create({
        body: data.body,
        cardId,
        createdBy: userId,
      });

      logger.info(`Comment created: ${comment.id} for card: ${cardId} by user: ${userId}`);

      // Broadcast real-time event
      const socketManager = getSocketManager();
      if (socketManager) {
        socketManager.broadcastCommentCreated(comment);
      }

      return comment;
    } catch (error) {
      logger.error('Create comment error:', error);
      throw error;
    }
  }

  async getCommentsByCard(cardId: string) {
    try {
      // Verify card exists
      const card = await this.cardRepository.findById(cardId);
      if (!card) {
        throw new NotFoundError('Card');
      }

      return await this.commentRepository.findByCard(cardId);
    } catch (error) {
      logger.error('Get comments by card error:', error);
      throw error;
    }
  }

  async updateComment(id: string, data: UpdateCommentRequest, userId: string) {
    try {
      // Get existing comment
      const existingComment = await this.commentRepository.findById(id);
      if (!existingComment) {
        throw new NotFoundError('Comentário');
      }

      // Check if user is the creator
      if (existingComment.createdBy !== userId) {
        throw new ForbiddenError('Você só pode editar seus próprios comentários');
      }

      // Update comment
      const comment = await this.commentRepository.update(id, {
        body: data.body,
      });

      logger.info(`Comment updated: ${comment.id} by user: ${userId}`);

      // Broadcast real-time event
      const socketManager = getSocketManager();
      if (socketManager) {
        socketManager.broadcastCommentUpdated(comment);
      }

      return comment;
    } catch (error) {
      logger.error('Update comment error:', error);
      throw error;
    }
  }

  async deleteComment(id: string, userId: string) {
    try {
      // Get existing comment
      const existingComment = await this.commentRepository.findById(id);
      if (!existingComment) {
        throw new NotFoundError('Comentário');
      }

      // Check if user is the creator
      if (existingComment.createdBy !== userId) {
        throw new ForbiddenError('Você só pode excluir seus próprios comentários');
      }

      // Delete comment
      await this.commentRepository.delete(id);

      logger.info(`Comment deleted: ${id} by user: ${userId}`);

      // Broadcast real-time event
      const socketManager = getSocketManager();
      if (socketManager) {
        socketManager.broadcastCommentDeleted(id);
      }

      return { success: true };
    } catch (error) {
      logger.error('Delete comment error:', error);
      throw error;
    }
  }

  async getCommentById(id: string) {
    try {
      const comment = await this.commentRepository.findById(id);
      if (!comment) {
        throw new NotFoundError('Comentário');
      }

      return comment;
    } catch (error) {
      logger.error('Get comment error:', error);
      throw error;
    }
  }

  async getUserComments(userId: string) {
    try {
      return await this.commentRepository.findByUser(userId);
    } catch (error) {
      logger.error('Get user comments error:', error);
      throw error;
    }
  }

  async getCommentCountByCard(cardId: string): Promise<number> {
    try {
      // Verify card exists
      const card = await this.cardRepository.findById(cardId);
      if (!card) {
        throw new NotFoundError('Card');
      }

      return await this.commentRepository.countByCard(cardId);
    } catch (error) {
      logger.error('Get comment count by card error:', error);
      throw error;
    }
  }
}
