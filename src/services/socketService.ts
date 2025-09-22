import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

const SOCKET_URL = 'http://localhost:3001';

export interface SocketEvent {
  type: string;
  payload: any;
  timestamp: string;
}

export class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    // Conectar imediatamente se houver token
    this.connectIfNeeded();
  }

  private connect(): void {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.warn('⚠️ Token não encontrado, Socket.IO não será conectado');
      return;
    }

    console.log('🔌 Conectando ao Socket.IO...');

    // Desconectar socket existente se houver
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 5,
      forceNew: true
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) {
      console.log('❌ No socket to setup event handlers');
      return;
    }


    this.socket.on('connect', () => {
      console.log('✅ Socket.IO conectado:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Notificar listeners sobre conexão
      this.emit('connection', { connected: true });
      
      // Entrar no board padrão
      this.socket?.emit('join:board', 'default');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO desconectado:', reason);
      this.isConnected = false;
      
      // Notificar listeners sobre desconexão
      this.emit('connection', { connected: false });
      
      if (reason === 'io server disconnect') {
        // Servidor forçou desconexão, reconectar manualmente
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão Socket.IO:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Máximo de tentativas de reconexão atingido');
        toast.error('Conexão em tempo real perdida');
      } else {
        console.log(`🔄 Tentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      }
      
      this.emit('connection', { connected: false, error: error.message });
    });

    // Eventos de usuários
    this.socket.on('user:connected', (data) => {
      console.log('👤 Usuário conectado:', data);
      this.emit('user:connected', data);
    });

    this.socket.on('user:disconnected', (data) => {
      console.log('👤 Usuário desconectado:', data);
      this.emit('user:disconnected', data);
    });

    // Eventos do board
    this.socket.on('board:joined', (data) => {
      console.log('📋 Board joined:', data);
      this.emit('board:joined', data);
    });

    // Eventos de cards
    this.socket.on('card:created', (event: SocketEvent) => {
      console.log('📝 Card criado via Socket.IO:', event);
      this.emit('card:created', event);
      toast.success('Novo card criado!');
    });

    this.socket.on('card:updated', (event: SocketEvent) => {
      console.log('📝 Card atualizado via Socket.IO:', event);
      this.emit('card:updated', event);
    });

    this.socket.on('card:deleted', (event: SocketEvent) => {
      console.log('🗑️ Card deletado via Socket.IO:', event);
      this.emit('card:deleted', event);
      toast.success('Card removido!');
    });

    this.socket.on('card:moved', (event: SocketEvent) => {
      console.log('🔄 Card movido via Socket.IO:', event);
      this.emit('card:moved', event);
    });

    this.socket.on('card:voted', (event: SocketEvent) => {
      console.log('👍 Card votado via Socket.IO:', event);
      this.emit('card:voted', event);
    });

    this.socket.on('card:vote:removed', (event: SocketEvent) => {
      console.log('👎 Card vote removido via Socket.IO:', event);
      this.emit('card:vote:removed', event);
    });

    // Eventos de comentários
    this.socket.on('comment:created', (event: SocketEvent) => {
      console.log('💬 SOCKET SERVICE - Evento comment:created recebido!');
      console.log('💬 SOCKET SERVICE - Event:', event);
      console.log('💬 SOCKET SERVICE - Comment ID:', event.payload?.id);
      console.log('💬 SOCKET SERVICE - Emitindo para listeners...');
      this.emit('comment:created', event);
      toast.success('Novo comentário!');
    });

    this.socket.on('comment:updated', (event: SocketEvent) => {
      console.log('💬 Comentário atualizado via Socket.IO:', event);
      this.emit('comment:updated', event);
    });

    this.socket.on('comment:deleted', (event: SocketEvent) => {
      console.log('🗑️ Comentário deletado via Socket.IO:', event);
      this.emit('comment:deleted', event);
    });

    // Eventos de colunas
    this.socket.on('column:created', (event: SocketEvent) => {
      console.log('📋 Coluna criada via Socket.IO:', event);
      this.emit('column:created', event);
      toast.success('Nova coluna criada!');
    });

    this.socket.on('column:updated', (event: SocketEvent) => {
      console.log('📋 Coluna atualizada via Socket.IO:', event);
      this.emit('column:updated', event);
    });

    this.socket.on('column:deleted', (event: SocketEvent) => {
      console.log('🗑️ Coluna deletada via Socket.IO:', event);
      this.emit('column:deleted', event);
    });

    this.socket.on('columns:reordered', (event: SocketEvent) => {
      console.log('🔄 Colunas reordenadas via Socket.IO:', event);
      this.emit('columns:reordered', event);
    });

    // Eventos de enquetes
    this.socket.on('poll:created', (event: SocketEvent) => {
      console.log('📊 Enquete criada via Socket.IO:', event);
      this.emit('poll:created', event);
      toast.success('Nova enquete criada!');
    });

    this.socket.on('poll:updated', (event: SocketEvent) => {
      console.log('📊 Enquete atualizada via Socket.IO:', event);
      this.emit('poll:updated', event);
    });

    this.socket.on('poll:deleted', (event: SocketEvent) => {
      console.log('🗑️ Enquete deletada via Socket.IO:', event);
      this.emit('poll:deleted', event);
    });

    this.socket.on('poll:voted', (event: SocketEvent) => {
      console.log('🗳️ Voto na enquete via Socket.IO:', event);
      this.emit('poll:voted', event);
    });

    this.socket.on('poll:vote:removed', (event: SocketEvent) => {
      console.log('🗳️ Voto removido da enquete via Socket.IO:', event);
      this.emit('poll:vote:removed', event);
    });

    // Heartbeat
    this.socket.on('pong', (data) => {
      console.log('🏓 Pong recebido:', data);
    });
  }

  private handleReconnection(): void {
    setTimeout(() => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log('🔄 Tentando reconectar manualmente...');
        this.socket?.connect();
      }
    }, this.reconnectDelay);
  }

  // Métodos públicos
  public connectIfNeeded(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('⚠️ No token found, cannot connect');
      return;
    }
    
    if (!this.socket || !this.isConnected) {
      console.log('🔌 Connecting Socket.IO...');
      this.connect();
    } else {
      console.log('✅ Socket.IO already connected');
    }
  }

  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  public getSocketId(): string | undefined {
    return this.socket?.id;
  }

  public joinBoard(boardId: string): void {
    if (this.socket) {
      this.socket.emit('join:board', boardId);
      console.log(`📋 Entrando no board: ${boardId}`);
    }
  }

  public leaveBoard(boardId: string): void {
    if (this.socket) {
      this.socket.emit('leave:board', boardId);
      console.log(`📋 Saindo do board: ${boardId}`);
    }
  }

  public sendPing(): void {
    if (this.socket) {
      this.socket.emit('ping');
    }
  }

  // Sistema de eventos customizado
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback?: Function): void {
    if (!this.eventListeners.has(event)) return;
    
    if (callback) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  private emit(event: string, data: any): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro no listener do evento ${event}:`, error);
        }
      });
    }
  }

  public disconnect(): void {
    if (this.socket) {
      console.log('🔌 Desconectando Socket.IO...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  public reconnect(): void {
    console.log('🔄 Reconectando Socket.IO...');
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => {
      this.connect();
    }, 1000);
  }
}

// Instância singleton
export const socketService = new SocketService();
