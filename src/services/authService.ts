import { apiService } from './api';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/kanban';

class AuthService {
  private refreshToken: string | null = null;
  private user: User | null = null;

  constructor() {
    this.refreshToken = localStorage.getItem('refreshToken');
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data from storage:', error);
        localStorage.removeItem('user');
      }
    }
  }

  private saveAuthData(authData: AuthResponse) {
    apiService.setToken(authData.accessToken);
    this.refreshToken = authData.refreshToken;
    this.user = authData.user;

    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }

  private clearAuthData() {
    apiService.setToken(null);
    this.refreshToken = null;
    this.user = null;

    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async login(credentials: LoginRequest): Promise<User> {
    try {
      const authData = await apiService.login(credentials);
      this.saveAuthData(authData);
      return authData.user;
    } catch (error) {
      this.clearAuthData();
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<User> {
    try {
      const authData = await apiService.register(userData);
      this.saveAuthData(authData);
      return authData.user;
    } catch (error) {
      this.clearAuthData();
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await apiService.refreshToken(this.refreshToken);
      apiService.setToken(response.accessToken);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearAuthData();
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.user) {
      return null;
    }

    try {
      const user = await apiService.getCurrentUser();
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      // If token is invalid, try to refresh
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.getCurrentUser();
      }
      this.clearAuthData();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.user && !!apiService['token'];
  }

  getUser(): User | null {
    return this.user;
  }

  getAccessToken(): string | null {
    return apiService['token'];
  }

  // Auto-refresh token before expiration
  startTokenRefresh(): void {
    // Refresh token every 14 minutes (tokens expire in 15 minutes)
    setInterval(async () => {
      if (this.isAuthenticated()) {
        await this.refreshAccessToken();
      }
    }, 14 * 60 * 1000);
  }
}

export const authService = new AuthService();

// Start auto-refresh if user is authenticated
if (authService.isAuthenticated()) {
  authService.startTokenRefresh();
}
