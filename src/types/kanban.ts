// Kanban de Ideias - Core Types
export interface User {
  id: string;
  name: string;
  email: string;
  locale: 'pt-BR' | 'en';
  createdAt: Date;
}

export interface Column {
  id: string;
  name: string;
  position: number;
  color?: string;
  description?: string;
  createdAt: Date;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  columnId: string;
  createdBy: string;
  position: number;
  votes: Vote[];
  comments: Comment[];
  polls: Poll[];
  createdAt: Date;
  updatedAt: Date;
  creator?: User; // Populated user info
}

export interface Vote {
  id: string;
  cardId: string;
  userId: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  cardId: string;
  body: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  creator?: User; // Populated user info
}

export interface Poll {
  id: string;
  question: string;
  cardId: string;
  createdBy: string;
  allowMultiple: boolean;
  isSecret: boolean;
  isActive: boolean;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  options: PollOption[];
  votes: PollVote[];
  totalVotes?: number;
}

export interface PollOption {
  id: string;
  text: string;
  pollId: string;
  position: number;
  createdAt: Date;
  votes: PollVote[];
  voteCount?: number;
  percentage?: number;
}

export interface PollVote {
  id: string;
  pollId: string;
  optionId: string;
  userId: string;
  createdAt: Date;
  user?: User; // Populated for non-secret polls
}

export interface Board {
  columns: Column[];
  cards: Card[];
}

// UI State Types
export interface DraggedCard {
  card: Card;
  sourceColumnId: string;
  sourcePosition: number;
}

export interface KanbanState {
  board: Board;
  isLoading: boolean;
  searchQuery: string;
  selectedColumnId: string | null;
  selectedCard: Card | null;
  draggedCard: DraggedCard | null;
  user: User | null;
  visibleColumns: string[]; // Array of column IDs that are visible
  columnOrder: string[]; // Array of column IDs in the desired order
}

// API Types
export interface CreateCardRequest {
  title: string;
  description: string;
  columnId: string;
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
}

export interface MoveCardRequest {
  toColumnId: string;
  position: number;
}

export interface CreateCommentRequest {
  body: string;
}

export interface UpdateCommentRequest {
  body: string;
}

export interface CreatePollRequest {
  question: string;
  cardId: string;
  allowMultiple: boolean;
  isSecret: boolean;
  endsAt?: Date;
  options: string[];
}

export interface UpdatePollRequest {
  question?: string;
  allowMultiple?: boolean;
  isSecret?: boolean;
  isActive?: boolean;
  endsAt?: Date | null;
}

export interface VotePollRequest {
  optionIds: string[];
}

// Event Types for Real-time updates
export type KanbanEvent = 
  | { type: 'card.created'; payload: Card }
  | { type: 'card.updated'; payload: Card }
  | { type: 'card.moved'; payload: { cardId: string; fromColumnId: string; toColumnId: string; position: number } }
  | { type: 'card.deleted'; payload: { cardId: string } }
  | { type: 'vote.added'; payload: Vote }
  | { type: 'vote.removed'; payload: { cardId: string; userId: string } }
  | { type: 'comment.added'; payload: Comment }
  | { type: 'comment.updated'; payload: Comment }
  | { type: 'comment.deleted'; payload: { commentId: string; cardId: string } }
  | { type: 'poll.created'; payload: Poll }
  | { type: 'poll.updated'; payload: Poll }
  | { type: 'poll.deleted'; payload: { pollId: string; cardId: string } }
  | { type: 'poll.voted'; payload: { pollId: string; cardId: string; votes: PollVote[] } };

// Filter and Search Types
export interface BoardFilters {
  searchQuery?: string;
  columnId?: string;
  createdBy?: string;
}

export interface SortOptions {
  field: 'createdAt' | 'updatedAt' | 'votes' | 'title';
  direction: 'asc' | 'desc';
}