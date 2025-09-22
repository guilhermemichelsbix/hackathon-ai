import { apiService } from './api';
import type { 
  Card, 
  Column, 
  Comment, 
  Vote,
  Poll,
  CreateCardRequest,
  UpdateCardRequest,
  MoveCardRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  CreatePollRequest,
  UpdatePollRequest,
  VotePollRequest,
  CardFilters,
  KanbanEvent
} from '@/types/kanban';

class KanbanService {
  private eventSource: EventSource | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  // Column methods
  async getColumns(): Promise<Column[]> {
    return apiService.getColumns();
  }

  async createColumn(data: { name: string; position?: number }): Promise<Column> {
    return apiService.createColumn(data);
  }

  async updateColumn(id: string, data: { name?: string; position?: number }): Promise<Column> {
    return apiService.updateColumn(id, data);
  }

  async deleteColumn(id: string): Promise<void> {
    return apiService.deleteColumn(id);
  }

  async reorderColumns(columns: Array<{ id: string; position: number }>): Promise<Column[]> {
    return apiService.reorderColumns(columns);
  }

  // Card methods
  async getCards(filters?: CardFilters): Promise<Card[]> {
    return apiService.getCards(filters);
  }

  async createCard(data: CreateCardRequest): Promise<Card> {
    return apiService.createCard(data);
  }

  async getCard(id: string): Promise<Card> {
    return apiService.getCard(id);
  }

  async updateCard(id: string, data: UpdateCardRequest): Promise<Card> {
    return apiService.updateCard(id, data);
  }

  async deleteCard(id: string): Promise<void> {
    return apiService.deleteCard(id);
  }

  async moveCard(id: string, data: MoveCardRequest): Promise<Card> {
    return apiService.moveCard(id, data);
  }

  async getCardsByColumn(columnId: string): Promise<Card[]> {
    return apiService.getCardsByColumn(columnId);
  }

  // Vote methods
  async addVote(cardId: string): Promise<Vote> {
    return apiService.addVote(cardId);
  }

  async removeVote(cardId: string): Promise<Vote> {
    return apiService.removeVote(cardId);
  }

  async getVotesByCard(cardId: string): Promise<Vote[]> {
    return apiService.getVotesByCard(cardId);
  }

  async hasUserVoted(cardId: string): Promise<boolean> {
    return apiService.hasUserVoted(cardId);
  }

  // Comment methods
  async createComment(cardId: string, data: CreateCommentRequest): Promise<Comment> {
    return apiService.createComment(cardId, data);
  }

  async getCommentsByCard(cardId: string): Promise<Comment[]> {
    return apiService.getCommentsByCard(cardId);
  }

  async updateComment(id: string, data: UpdateCommentRequest): Promise<Comment> {
    return apiService.updateComment(id, data);
  }

  async deleteComment(id: string): Promise<void> {
    return apiService.deleteComment(id);
  }

  // Poll methods
  async createPoll(data: CreatePollRequest): Promise<Poll> {
    return apiService.createPoll(data);
  }

  async getPollById(id: string): Promise<Poll> {
    return apiService.getPollById(id);
  }

  async getPollsByCardId(cardId: string): Promise<Poll[]> {
    return apiService.getPollsByCardId(cardId);
  }

  async updatePoll(id: string, data: UpdatePollRequest): Promise<Poll> {
    return apiService.updatePoll(id, data);
  }

  async deletePoll(id: string): Promise<void> {
    return apiService.deletePoll(id);
  }

  async votePoll(id: string, data: VotePollRequest): Promise<Poll> {
    return apiService.votePoll(id, data);
  }

  async removePollVote(pollId: string, optionId: string): Promise<Poll> {
    return apiService.removePollVote(pollId, optionId);
  }

  async getUserVotes(pollId: string): Promise<any[]> {
    return apiService.getUserVotes(pollId);
  }


  // Utility methods
  async getBoard(): Promise<{ columns: Column[]; cards: Card[] }> {
    const columns = await this.getColumns();
    
    // Extract all cards from columns
    const cards: Card[] = [];
    columns.forEach(column => {
      cards.push(...column.cards);
    });

    return { columns, cards };
  }

  async searchCards(query: string): Promise<Card[]> {
    return this.getCards({ query });
  }

  async getCardsByCreator(creatorId: string): Promise<Card[]> {
    return this.getCards({ creator: creatorId });
  }

  async getCardsByColumnId(columnId: string): Promise<Card[]> {
    return this.getCards({ columnId });
  }
}

export const kanbanService = new KanbanService();
