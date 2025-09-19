import { AuthService } from '@/services/authService';
import { UserRepository } from '@/repositories/userRepository';
import { hashPassword } from '@/utils/bcrypt';

// Mock do UserRepository
jest.mock('@/repositories/userRepository');
const MockedUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new MockedUserRepository();
    authService = new AuthService();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        locale: 'pt-BR' as const,
      };

      const mockUser = {
        id: 'user-1',
        name: userData.name,
        email: userData.email,
        passwordHash: 'hashed-password',
        locale: userData.locale,
        createdAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        passwordHash: expect.any(String),
        locale: userData.locale,
      });
      expect(result.user.email).toBe(userData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        locale: 'pt-BR' as const,
      };

      const existingUser = {
        id: 'user-1',
        name: 'Existing User',
        email: userData.email,
        passwordHash: 'hashed-password',
        locale: 'pt-BR' as const,
        createdAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Usuário com este email já existe');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await hashPassword('password123');
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: loginData.email,
        passwordHash: hashedPassword,
        locale: 'pt-BR' as const,
        createdAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(result.user.email).toBe(loginData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with invalid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await hashPassword('password123');
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: loginData.email,
        passwordHash: hashedPassword,
        locale: 'pt-BR' as const,
        createdAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw error if user does not exist', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Credenciais inválidas');
    });
  });
});
