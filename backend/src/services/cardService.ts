import { CardRepository } from '@/repositories/cardRepository';
import { ColumnRepository } from '@/repositories/columnRepository';
import { CreateCardRequest, UpdateCardRequest, MoveCardRequest, CardFilters } from '@/types';
import { AppError, ValidationError, NotFoundError, ForbiddenError } from '@/types';
import { logger } from '@/utils/logger';
import { getSocketManager } from '@/utils/socketManager';

export class CardService {
  private cardRepository: CardRepository;
  private columnRepository: ColumnRepository;

  constructor() {
    this.cardRepository = new CardRepository();
    this.columnRepository = new ColumnRepository();
  }

  async createCard(data: CreateCardRequest, userId: string) {
    try {
      // Verify column exists
      const column = await this.columnRepository.findById(data.columnId);
      if (!column) {
        throw new NotFoundError('Coluna');
      }

      // Get next position in column
      const cardsInColumn = await this.cardRepository.findByColumn(data.columnId);
      const position = cardsInColumn.length;

      // Create card
      const card = await this.cardRepository.create({
        title: data.title,
        description: data.description,
        columnId: data.columnId,
        createdBy: userId,
        position,
      });

      logger.info(`Card created: ${card.id} by user: ${userId}`);

      // Broadcast real-time event
      const socketManager = getSocketManager();
      if (socketManager) {
        socketManager.broadcastCardCreated(card);
      }

      return card;
    } catch (error) {
      logger.error('Create card error:', error);
      throw error;
    }
  }

  async getCards(filters: CardFilters = {}) {
    try {
      const [cards, total] = await Promise.all([
        this.cardRepository.findMany(filters),
        this.cardRepository.count(filters),
      ]);

      return {
        cards,
        total,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      };
    } catch (error) {
      logger.error('Get cards error:', error);
      throw error;
    }
  }

  async getCardById(id: string) {
    try {
      const card = await this.cardRepository.findById(id);
      if (!card) {
        throw new NotFoundError('Card');
      }

      return card;
    } catch (error) {
      logger.error('Get card error:', error);
      throw error;
    }
  }

  async updateCard(id: string, data: UpdateCardRequest, userId: string) {
    try {
      // Get existing card
      const existingCard = await this.cardRepository.findById(id);
      if (!existingCard) {
        throw new NotFoundError('Card');
      }

      // Check if user is the creator
      if (existingCard.createdBy !== userId) {
        throw new ForbiddenError('Você só pode editar seus próprios cards');
      }

      // Update card
      const card = await this.cardRepository.update(id, {
        title: data.title,
        description: data.description,
      });

      logger.info(`Card updated: ${card.id} by user: ${userId}`);

      // Broadcast real-time event
      const socketManager = getSocketManager();
      if (socketManager) {
        socketManager.broadcastCardUpdated(card);
      }

      return card;
    } catch (error) {
      logger.error('Update card error:', error);
      throw error;
    }
  }

  async deleteCard(id: string, userId: string) {
    try {
      // Get existing card
      const existingCard = await this.cardRepository.findById(id);
      if (!existingCard) {
        throw new NotFoundError('Card');
      }

      // Check if user is the creator (optional - could allow any authenticated user)
      if (existingCard.createdBy !== userId) {
        throw new ForbiddenError('Você só pode excluir seus próprios cards');
      }

      // Delete card
      await this.cardRepository.delete(id);

      logger.info(`Card deleted: ${id} by user: ${userId}`);

      // Broadcast real-time event
      const socketManager = getSocketManager();
      if (socketManager) {
        socketManager.broadcastCardDeleted(id);
      }

      return { success: true };
    } catch (error) {
      logger.error('Delete card error:', error);
      throw error;
    }
  }

  async moveCard(id: string, data: MoveCardRequest, userId: string) {
    try {
      // Get existing card
      const existingCard = await this.cardRepository.findById(id);
      if (!existingCard) {
        throw new NotFoundError('Card');
      }

      // Verify target column exists
      const targetColumn = await this.columnRepository.findById(data.toColumnId);
      if (!targetColumn) {
        throw new NotFoundError('Coluna de destino');
      }

      // Move card
      const card = await this.cardRepository.moveCard(id, data.toColumnId, data.position);

      logger.info(`Card moved: ${id} to column: ${data.toColumnId} by user: ${userId}`);

      // Broadcast real-time event
      const socketManager = getSocketManager();
      if (socketManager) {
        socketManager.broadcastCardMoved(
          id,
          existingCard.columnId,
          data.toColumnId,
          data.position
        );
      }

      return card;
    } catch (error) {
      logger.error('Move card error:', error);
      throw error;
    }
  }

  async getCardsByColumn(columnId: string) {
    try {
      // Verify column exists
      const column = await this.columnRepository.findById(columnId);
      if (!column) {
        throw new NotFoundError('Coluna');
      }

      return column.cards;
    } catch (error) {
      logger.error('Get cards by column error:', error);
      throw error;
    }
  }
}
