import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { authenticateSocket } from '../middleware/socketAuth';

export class SocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(server: HTTPServer) {
    console.log('🚀 Initializing SocketManager...');
    
    this.io = new SocketIOServer(server, {
      cors: {
        origin: ["http://localhost:8080", "http://localhost:8081", "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingInterval: 10000,
      pingTimeout: 5000
    });

    console.log('✅ SocketIOServer created');
    this.setupMiddleware();
    this.setupEventHandlers();
    console.log('✅ SocketManager initialized successfully');
  }

  private setupMiddleware() {
    // Middleware de autenticação simplificado
    this.io.use(async (socket, next) => {
      try {
        console.log('🔍 Socket tentando conectar...');
        console.log('🔍 Auth:', socket.handshake.auth);
        
        const token = socket.handshake.auth?.token;
        
        if (!token) {
          console.error('❌ Token não fornecido');
          return next(new Error('Token não fornecido'));
        }

        console.log('🔍 Token recebido:', token.substring(0, 20) + '...');
        
        // Autenticação simplificada - apenas permitir conexão por agora
        const user = await authenticateSocket(token);
        if (!user) {
          console.error('❌ Token inválido ou usuário não encontrado');
          return next(new Error('Token inválido'));
        }

        console.log('✅ Usuário autenticado:', user.name);
        socket.data.user = user;
        next();
      } catch (error) {
        console.error('❌ Erro na autenticação do socket:', error);
        next(new Error('Erro na autenticação'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.data.user;
      const userId = user.id;
      const userName = user.name;

      console.log(`🔌 Usuário conectado: ${userName} (${userId}) - Socket: ${socket.id}`);
      
      // Mapear socket para usuário
      this.connectedUsers.set(socket.id, userId);

      // Notificar outros usuários sobre a conexão
      socket.broadcast.emit('user:connected', {
        userId,
        userName,
        timestamp: new Date().toISOString()
      });

      // Evento de heartbeat para manter conexão viva
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });

      // Evento de desconexão
      socket.on('disconnect', (reason) => {
        console.log(`🔌 Usuário desconectado: ${userName} (${userId}) - Motivo: ${reason}`);
        
        // Remover mapeamento
        this.connectedUsers.delete(socket.id);

        // Notificar outros usuários sobre a desconexão
        socket.broadcast.emit('user:disconnected', {
          userId,
          userName,
          timestamp: new Date().toISOString()
        });
      });

      // Evento para entrar em uma sala específica (board)
      socket.on('join:board', (boardId: string) => {
        socket.join(`board:${boardId}`);
        console.log(`📋 ${userName} entrou no board: ${boardId}`);
        
        socket.emit('board:joined', {
          boardId,
          message: `Você entrou no board ${boardId}`,
          timestamp: new Date().toISOString()
        });
      });

      // Evento para sair de uma sala
      socket.on('leave:board', (boardId: string) => {
        socket.leave(`board:${boardId}`);
        console.log(`📋 ${userName} saiu do board: ${boardId}`);
      });
    });
  }

  // Métodos para broadcast de eventos
  public broadcastCardCreated(card: any) {
    this.io.emit('card:created', {
      type: 'card.created',
      payload: card,
      timestamp: new Date().toISOString()
    });
    console.log('📝 Card created broadcasted');
  }

  public broadcastCardUpdated(card: any) {
    this.io.emit('card:updated', {
      type: 'card.updated',
      payload: card,
      timestamp: new Date().toISOString()
    });
    console.log('📝 Card updated broadcasted');
  }

  public broadcastCardDeleted(cardId: string) {
    this.io.emit('card:deleted', {
      type: 'card.deleted',
      payload: { cardId },
      timestamp: new Date().toISOString()
    });
    console.log('🗑️ Card deleted broadcasted');
  }

  public broadcastCardMoved(cardId: string, fromColumnId: string, toColumnId: string, position: number) {
    this.io.emit('card:moved', {
      type: 'card.moved',
      payload: {
        cardId,
        fromColumnId,
        toColumnId,
        position
      },
      timestamp: new Date().toISOString()
    });
    console.log('🔄 Card moved broadcasted');
  }

  public broadcastCardVoted(cardId: string, userId: string) {
    this.io.emit('card:voted', {
      type: 'card.voted',
      payload: {
        cardId,
        userId
      },
      timestamp: new Date().toISOString()
    });
    console.log('👍 Card voted broadcasted');
  }

  public broadcastCommentCreated(comment: any) {
    this.io.emit('comment:created', {
      type: 'comment.created',
      payload: comment,
      timestamp: new Date().toISOString()
    });
    console.log('💬 Comment created broadcasted');
  }

  public broadcastCommentUpdated(comment: any) {
    this.io.emit('comment:updated', {
      type: 'comment.updated',
      payload: comment,
      timestamp: new Date().toISOString()
    });
    console.log('💬 Comment updated broadcasted');
  }

  public broadcastCommentDeleted(commentId: string) {
    this.io.emit('comment:deleted', {
      type: 'comment.deleted',
      payload: { commentId },
      timestamp: new Date().toISOString()
    });
    console.log('🗑️ Comment deleted broadcasted');
  }

  public broadcastPollCreated(poll: any) {
    this.io.emit('poll:created', {
      type: 'poll.created',
      payload: poll,
      timestamp: new Date().toISOString()
    });
    console.log('📊 Poll created broadcasted');
  }

  public broadcastPollUpdated(poll: any) {
    this.io.emit('poll:updated', {
      type: 'poll.updated',
      payload: poll,
      timestamp: new Date().toISOString()
    });
    console.log('📊 Poll updated broadcasted');
  }

  public broadcastPollDeleted(pollId: string, cardId: string) {
    this.io.emit('poll:deleted', {
      type: 'poll.deleted',
      payload: { pollId, cardId },
      timestamp: new Date().toISOString()
    });
    console.log('🗑️ Poll deleted broadcasted');
  }

  public broadcastPollVoted(pollId: string, optionId: string, userId: string) {
    this.io.emit('poll:voted', {
      type: 'poll.voted',
      payload: { pollId, optionId, userId },
      timestamp: new Date().toISOString()
    });
    console.log('🗳️ Poll voted broadcasted');
  }

  public broadcastPollVoteRemoved(pollId: string, optionId: string, userId: string) {
    this.io.emit('poll:vote:removed', {
      type: 'poll.vote.removed',
      payload: { pollId, optionId, userId },
      timestamp: new Date().toISOString()
    });
    console.log('🗳️ Poll vote removed broadcasted');
  }

  // Column events
  public broadcastColumnCreated(column: any) {
    this.io.emit('column:created', {
      type: 'column.created',
      payload: column,
      timestamp: new Date().toISOString()
    });
    console.log('📋 Column created broadcasted');
  }

  public broadcastColumnUpdated(column: any) {
    this.io.emit('column:updated', {
      type: 'column.updated',
      payload: column,
      timestamp: new Date().toISOString()
    });
    console.log('📋 Column updated broadcasted');
  }

  public broadcastColumnDeleted(columnId: string) {
    this.io.emit('column:deleted', {
      type: 'column.deleted',
      payload: { columnId },
      timestamp: new Date().toISOString()
    });
    console.log('🗑️ Column deleted broadcasted');
  }

  public broadcastColumnsReordered(columns: any[]) {
    this.io.emit('columns:reordered', {
      type: 'columns.reordered',
      payload: { columns },
      timestamp: new Date().toISOString()
    });
    console.log('🔄 Columns reordered broadcasted');
  }

  // Vote events (for cards)
  public broadcastCardVoteRemoved(cardId: string, userId: string) {
    const eventData = {
      type: 'card.vote.removed',
      payload: { cardId, userId },
      timestamp: new Date().toISOString()
    };
    console.log('👎 Broadcasting card vote removed:', eventData);
    this.io.emit('card:vote:removed', eventData);
    console.log('👎 Card vote removed broadcasted successfully');
  }

  // Métodos para broadcast em salas específicas
  public broadcastToBoard(boardId: string, event: string, data: any) {
    this.io.to(`board:${boardId}`).emit(event, data);
  }

  // Estatísticas
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getConnectedUsers(): Array<{ socketId: string; userId: string }> {
    return Array.from(this.connectedUsers.entries()).map(([socketId, userId]) => ({
      socketId,
      userId
    }));
  }
}

// Instância singleton
let socketManager: SocketManager | null = null;

export const initializeSocketManager = (server: HTTPServer): SocketManager => {
  if (!socketManager) {
    socketManager = new SocketManager(server);
  }
  return socketManager;
};

export const getSocketManager = (): SocketManager | null => {
  return socketManager;
};
