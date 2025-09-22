import { VoteRepository } from '@/repositories/voteRepository';
import { CardRepository } from '@/repositories/cardRepository';
import { Vote } from '@prisma/client';
import { AppError, ValidationError, NotFoundError } from '@/types';
import { logger } from '@/utils/logger';
import { getSocketManager } from '@/utils/socketManager';

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
      const socketManager = getSocketManager();
      if (socketManager) {
        socketManager.broadcastCardVoted(cardId, userId);
      }

      return vote;
    } catch (error) {
      logger.error('Add vote error:', error);
      throw error;
    }
  }

  async removeVote(cardId: string, userId: string): Promise<Vote> {
    try {
      console.log('🗑️ BACKEND - removeVote iniciado');
      console.log('🗑️ CardId:', cardId);
      console.log('🗑️ UserId:', userId);
      
      // Verify card exists
      console.log('🔍 Verificando se card existe...');
      const card = await this.cardRepository.findById(cardId);
      console.log('🔍 Card encontrado:', !!card);
      if (!card) {
        console.log('❌ Card não encontrado');
        throw new NotFoundError('Card');
      }

      // Check if vote exists
      console.log('🔍 Verificando se voto existe...');
      const existingVote = await this.voteRepository.findByCardAndUser(cardId, userId);
      console.log('🔍 Voto existente:', !!existingVote);
      if (existingVote) {
        console.log('🔍 Voto encontrado:', existingVote.id);
      }
      if (!existingVote) {
        console.log('❌ Voto não encontrado - usuário não votou neste card');
        throw new ValidationError('Você não votou neste card');
      }

      // Remove vote
      console.log('🗑️ Removendo voto do banco...');
      const vote = await this.voteRepository.delete(cardId, userId);
      console.log('🗑️ Voto removido com sucesso:', vote.id);

      logger.info(`Vote removed: ${vote.id} for card: ${cardId} by user: ${userId}`);

      // Broadcast real-time event
      console.log('📡 Enviando broadcast via Socket.IO...');
      const socketManager = getSocketManager();
      if (socketManager) {
        socketManager.broadcastCardVoteRemoved(cardId, userId);
        console.log('📡 Broadcast enviado com sucesso');
      } else {
        console.log('⚠️ SocketManager não disponível');
      }

      console.log('✅ removeVote concluído com sucesso');
      return vote;
    } catch (error) {
      console.error('❌ ERRO em removeVote:', error);
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
      console.log('🔍 BACKEND - hasUserVoted iniciado');
      console.log('🔍 CardId:', cardId);
      console.log('🔍 UserId:', userId);
      
      const vote = await this.voteRepository.findByCardAndUser(cardId, userId);
      console.log('🔍 Voto encontrado:', !!vote);
      if (vote) {
        console.log('🔍 Voto ID:', vote.id);
      }
      
      const result = !!vote;
      console.log('🔍 hasUserVoted result:', result);
      return result;
    } catch (error) {
      console.error('❌ ERRO em hasUserVoted:', error);
      logger.error('Check user vote error:', error);
      throw error;
    }
  }
}
