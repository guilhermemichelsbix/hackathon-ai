import { VoteRepository } from '@/repositories/voteRepository';
import { CardRepository } from '@/repositories/cardRepository';
import { Vote } from '@prisma/client';
import { AppError, ValidationError, NotFoundError } from '@/types';
import { logger } from '@/utils/logger';
import { sseManager } from '@/utils/sseManager';

export class VoteService {
  private voteRepository: VoteRepository;
  private cardRepository: CardRepository;

  constructor() {
    this.voteRepository = new VoteRepository();
    this.cardRepository = new CardRepository();
  }

  async addVote(cardId: string, userId: string): Promise<Vote> {
    try {
      // Verify card exists
      const card = await this.cardRepository.findById(cardId);
      if (!card) {
        throw new NotFoundError('Card');
      }

      // Check if user already voted
      const existingVote = await this.voteRepository.findByCardAndUser(cardId, userId);
      if (existingVote) {
        throw new ValidationError('Você já votou neste card');
      }

      // Create vote
      const vote = await this.voteRepository.create({
        cardId,
        userId,
      });

      logger.info(`Vote added: ${vote.id} for card: ${cardId} by user: ${userId}`);

      // Broadcast real-time event
      sseManager.broadcastVoteAdded(vote);

      return vote;
    } catch (error) {
      logger.error('Add vote error:', error);
      throw error;
    }
  }

  async removeVote(cardId: string, userId: string): Promise<Vote> {
    try {
      // Verify card exists
      const card = await this.cardRepository.findById(cardId);
      if (!card) {
        throw new NotFoundError('Card');
      }

      // Check if vote exists
      const existingVote = await this.voteRepository.findByCardAndUser(cardId, userId);
      if (!existingVote) {
        throw new ValidationError('Você não votou neste card');
      }

      // Remove vote
      const vote = await this.voteRepository.delete(cardId, userId);

      logger.info(`Vote removed: ${vote.id} for card: ${cardId} by user: ${userId}`);

      // Broadcast real-time event
      sseManager.broadcastVoteRemoved({ cardId, userId });

      return vote;
    } catch (error) {
      logger.error('Remove vote error:', error);
      throw error;
    }
  }

  async getVotesByCard(cardId: string): Promise<Vote[]> {
    try {
      // Verify card exists
      const card = await this.cardRepository.findById(cardId);
      if (!card) {
        throw new NotFoundError('Card');
      }

      return await this.voteRepository.findByCard(cardId);
    } catch (error) {
      logger.error('Get votes by card error:', error);
      throw error;
    }
  }

  async getVoteCountByCard(cardId: string): Promise<number> {
    try {
      // Verify card exists
      const card = await this.cardRepository.findById(cardId);
      if (!card) {
        throw new NotFoundError('Card');
      }

      return await this.voteRepository.countByCard(cardId);
    } catch (error) {
      logger.error('Get vote count by card error:', error);
      throw error;
    }
  }

  async getUserVotes(userId: string): Promise<Vote[]> {
    try {
      return await this.voteRepository.findByUser(userId);
    } catch (error) {
      logger.error('Get user votes error:', error);
      throw error;
    }
  }

  async hasUserVoted(cardId: string, userId: string): Promise<boolean> {
    try {
      const vote = await this.voteRepository.findByCardAndUser(cardId, userId);
      return !!vote;
    } catch (error) {
      logger.error('Check user vote error:', error);
      throw error;
    }
  }
}
