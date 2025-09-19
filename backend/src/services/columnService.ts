import { ColumnRepository } from '@/repositories/columnRepository';
import { CardRepository } from '@/repositories/cardRepository';
import { CreateColumnRequest, UpdateColumnRequest, ReorderColumnsRequest } from '@/types';
import { AppError, ValidationError, NotFoundError } from '@/types';
import { logger } from '@/utils/logger';

export class ColumnService {
  private columnRepository: ColumnRepository;
  private cardRepository: CardRepository;

  constructor() {
    this.columnRepository = new ColumnRepository();
    this.cardRepository = new CardRepository();
  }

  async createColumn(data: CreateColumnRequest) {
    try {
      // Get next position if not provided
      const position = data.position ?? await this.columnRepository.getNextPosition();

      // Create column
      const column = await this.columnRepository.create({
        name: data.name,
        position,
      });

      logger.info(`Column created: ${column.id}`);

      return column;
    } catch (error) {
      logger.error('Create column error:', error);
      throw error;
    }
  }

  async getColumns() {
    try {
      return await this.columnRepository.findAll();
    } catch (error) {
      logger.error('Get columns error:', error);
      throw error;
    }
  }

  async getColumnById(id: string) {
    try {
      const column = await this.columnRepository.findById(id);
      if (!column) {
        throw new NotFoundError('Coluna');
      }

      return column;
    } catch (error) {
      logger.error('Get column error:', error);
      throw error;
    }
  }

  async updateColumn(id: string, data: UpdateColumnRequest) {
    try {
      // Verify column exists
      const existingColumn = await this.columnRepository.findById(id);
      if (!existingColumn) {
        throw new NotFoundError('Coluna');
      }

      // Update column
      const column = await this.columnRepository.update(id, {
        name: data.name,
        position: data.position,
      });

      logger.info(`Column updated: ${column.id}`);

      return column;
    } catch (error) {
      logger.error('Update column error:', error);
      throw error;
    }
  }

  async deleteColumn(id: string) {
    try {
      // Verify column exists
      const existingColumn = await this.columnRepository.findById(id);
      if (!existingColumn) {
        throw new NotFoundError('Coluna');
      }

      // Check if column has cards
      const cardsInColumn = await this.cardRepository.findByColumn(id);
      if (cardsInColumn.length > 0) {
        throw new ValidationError('Não é possível excluir uma coluna que contém cards');
      }

      // Delete column
      await this.columnRepository.delete(id);

      logger.info(`Column deleted: ${id}`);

      return { success: true };
    } catch (error) {
      logger.error('Delete column error:', error);
      throw error;
    }
  }

  async reorderColumns(data: ReorderColumnsRequest) {
    try {
      // Verify all columns exist
      const existingColumns = await this.columnRepository.findAll();
      const existingColumnIds = existingColumns.map(col => col.id);
      const providedColumnIds = data.columns.map(col => col.id);

      const invalidIds = providedColumnIds.filter(id => !existingColumnIds.includes(id));
      if (invalidIds.length > 0) {
        throw new ValidationError(`Colunas não encontradas: ${invalidIds.join(', ')}`);
      }

      // Check if all existing columns are provided
      if (existingColumnIds.length !== providedColumnIds.length) {
        throw new ValidationError('Todas as colunas devem ser fornecidas para reordenação');
      }

      // Reorder columns
      const columns = await this.columnRepository.reorder(data.columns);

      logger.info('Columns reordered');

      return columns;
    } catch (error) {
      logger.error('Reorder columns error:', error);
      throw error;
    }
  }
}
