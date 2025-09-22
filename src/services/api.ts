import type { 
  User, 
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
  AuthResponse,
  LoginRequest,
  RegisterRequest
} from '@/types/kanban';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0);
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<{ success: boolean; data: AuthResponse }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<{ success: boolean; data: AuthResponse }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>('/auth/me');
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await this.request<{ success: boolean; data: { accessToken: string } }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    return response.data;
  }

  // Column endpoints
  async getColumns(): Promise<Column[]> {
    const response = await this.request<{ success: boolean; data: Column[] }>('/columns');
    return response.data;
  }

  async createColumn(data: { name: string; position?: number }): Promise<Column> {
    const response = await this.request<{ success: boolean; data: Column }>('/columns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateColumn(id: string, data: { name?: string; position?: number }): Promise<Column> {
    const response = await this.request<{ success: boolean; data: Column }>(`/columns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteColumn(id: string): Promise<void> {
    await this.request(`/columns/${id}`, { method: 'DELETE' });
  }

  async reorderColumns(columns: Array<{ id: string; position: number }>): Promise<Column[]> {
    const response = await this.request<{ success: boolean; data: Column[] }>('/columns/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ columns }),
    });
    return response.data;
  }

  // Card endpoints
  async getCards(filters?: CardFilters): Promise<Card[]> {
    const params = new URLSearchParams();
    if (filters?.query) params.append('query', filters.query);
    if (filters?.creator) params.append('creator', filters.creator);
    if (filters?.columnId) params.append('columnId', filters.columnId);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await this.request<{ success: boolean; data: Card[] }>(`/cards?${params}`);
    return response.data;
  }

  async createCard(data: CreateCardRequest): Promise<Card> {
    const response = await this.request<{ success: boolean; data: Card }>('/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getCard(id: string): Promise<Card> {
    const response = await this.request<{ success: boolean; data: Card }>(`/cards/${id}`);
    return response.data;
  }

  async updateCard(id: string, data: UpdateCardRequest): Promise<Card> {
    const response = await this.request<{ success: boolean; data: Card }>(`/cards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteCard(id: string): Promise<void> {
    await this.request(`/cards/${id}`, { method: 'DELETE' });
  }

  async moveCard(id: string, data: MoveCardRequest): Promise<Card> {
    const response = await this.request<{ success: boolean; data: Card }>(`/cards/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getCardsByColumn(columnId: string): Promise<Card[]> {
    const response = await this.request<{ success: boolean; data: Card[] }>(`/cards/column/${columnId}`);
    return response.data;
  }

  // Vote endpoints
  async addVote(cardId: string): Promise<Vote> {
    const response = await this.request<{ success: boolean; data: Vote }>(`/cards/${cardId}/votes`, {
      method: 'POST',
    });
    return response.data;
  }

  async removeVote(cardId: string): Promise<Vote> {
    const response = await this.request<{ success: boolean; data: Vote }>(`/cards/${cardId}/votes`, {
      method: 'DELETE',
    });
    return response.data;
  }

  async getVotesByCard(cardId: string): Promise<Vote[]> {
    const response = await this.request<{ success: boolean; data: Vote[] }>(`/cards/${cardId}/votes`);
    return response.data;
  }

  async hasUserVoted(cardId: string): Promise<boolean> {
    const response = await this.request<{ success: boolean; data: { hasVoted: boolean } }>(`/cards/${cardId}/votes/me`);
    return response.data.hasVoted;
  }

  // Comment endpoints
  async createComment(cardId: string, data: CreateCommentRequest): Promise<Comment> {
    const response = await this.request<{ success: boolean; data: Comment }>(`/cards/${cardId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getCommentsByCard(cardId: string): Promise<Comment[]> {
    const response = await this.request<{ success: boolean; data: Comment[] }>(`/cards/${cardId}/comments`);
    return response.data;
  }

  async updateComment(id: string, data: UpdateCommentRequest): Promise<Comment> {
    const response = await this.request<{ success: boolean; data: Comment }>(`/comments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteComment(id: string): Promise<void> {
    await this.request(`/comments/${id}`, { method: 'DELETE' });
  }

  // Poll endpoints
  async createPoll(data: CreatePollRequest): Promise<Poll> {
    const response = await this.request<{ success: boolean; data: Poll }>('/polls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getPollById(id: string): Promise<Poll> {
    const response = await this.request<{ success: boolean; data: Poll }>(`/polls/${id}`);
    return response.data;
  }

  async getPollsByCardId(cardId: string): Promise<Poll[]> {
    const response = await this.request<{ success: boolean; data: Poll[] }>(`/polls/card/${cardId}`);
    return response.data;
  }

  async updatePoll(id: string, data: UpdatePollRequest): Promise<Poll> {
    const response = await this.request<{ success: boolean; data: Poll }>(`/polls/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deletePoll(id: string): Promise<void> {
    await this.request(`/polls/${id}`, { method: 'DELETE' });
  }

  async votePoll(id: string, data: VotePollRequest): Promise<Poll> {
    const response = await this.request<{ success: boolean; data: Poll }>(`/polls/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async removePollVote(pollId: string, optionId: string): Promise<Poll> {
    const response = await this.request<{ success: boolean; data: Poll }>(`/polls/${pollId}/vote/${optionId}`, {
      method: 'DELETE',
    });
    return response.data;
  }

  async getUserVotes(pollId: string): Promise<any[]> {
    const response = await this.request<{ success: boolean; data: any[] }>(`/polls/${pollId}/votes`);
    return response.data;
  }

}

export const apiService = new ApiService();
export { ApiError };
