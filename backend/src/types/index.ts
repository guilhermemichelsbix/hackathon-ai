import { Request } from 'express';
import { User } from '@prisma/client';

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  locale?: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
}

// Card types
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

// Column types
export interface CreateColumnRequest {
  name: string;
  position?: number;
}

export interface UpdateColumnRequest {
  name?: string;
  position?: number;
}

export interface ReorderColumnsRequest {
  columns: Array<{
    id: string;
    position: number;
  }>;
}

// Comment types
export interface CreateCommentRequest {
  body: string;
}

export interface UpdateCommentRequest {
  body: string;
}

// Query filters
export interface CardFilters {
  query?: string;
  creator?: string;
  columnId?: string;
  limit?: number;
  offset?: number;
}

// Real-time event types
export type KanbanEventType = 
  | 'card.created'
  | 'card.updated'
  | 'card.moved'
  | 'card.deleted'
  | 'vote.added'
  | 'vote.removed'
  | 'comment.added'
  | 'comment.updated'
  | 'comment.deleted';

export interface KanbanEvent {
  type: KanbanEventType;
  payload: any;
  timestamp: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// JWT payload
export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Error types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}
