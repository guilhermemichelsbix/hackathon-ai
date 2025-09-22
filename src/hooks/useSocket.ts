import { useEffect, useState, useCallback } from 'react';
import { socketService } from '@/services/socketService';
import { useKanbanStore } from '@/store/kanban';

// Flag para garantir que os listeners sejam registrados apenas uma vez
let listenersRegistered = false;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socketService.isSocketConnected());
  const [socketId, setSocketId] = useState<string | undefined>(socketService.getSocketId());
  
  const {
    addCard,
    updateCard,
    removeCard,
    moveCard,
    addComment,
    updateComment,
    removeComment,
    addVote,
    removeVote,
    addColumn,
    updateColumn,
    removeColumn,
    reorderColumns,
    addPoll,
    updatePollData,
    removePoll,
  } = useKanbanStore();

  const handleConnectionChange = useCallback((data: { connected: boolean }) => {
    setIsConnected(data.connected);
    if (data.connected) {
      setSocketId(socketService.getSocketId());
    } else {
      setSocketId(undefined);
    }
  }, []);

  const handleCardCreated = useCallback((event: any) => {
    console.log('📝 Processando card criado:', event.payload);
    if (event.payload && event.payload.id) {
      addCard(event.payload);
    } else {
      console.error('❌ Payload inválido para addCard:', event.payload);
    }
  }, [addCard]);

  const handleCardUpdated = useCallback((event: any) => {
    console.log('📝 Processando card atualizado:', event.payload);
    if (event.payload && event.payload.id) {
      updateCard(event.payload.id, event.payload);
    } else {
      console.error('❌ Payload inválido para updateCard:', event.payload);
    }
  }, [updateCard]);

  const handleCardDeleted = useCallback((event: any) => {
    console.log('🗑️ Processando card deletado:', event.payload);
    if (event.payload && event.payload.cardId) {
      removeCard(event.payload.cardId);
    } else {
      console.error('❌ Payload inválido para removeCard:', event.payload);
    }
  }, [removeCard]);

  const handleCardMoved = useCallback((event: any) => {
    console.log('🔄 Processando card movido:', event.payload);
    if (event.payload.cardId && event.payload.toColumnId !== undefined && event.payload.position !== undefined) {
      moveCard(event.payload.cardId, event.payload.toColumnId, event.payload.position);
    } else {
      console.error('❌ Payload inválido para moveCard:', event.payload);
    }
  }, [moveCard]);

  const handleCardVoted = useCallback((event: any) => {
    console.log('👍 Processando voto no card:', event.payload);
    if (event.payload && event.payload.cardId && event.payload.userId) {
      addVote(event.payload);
    } else {
      console.error('❌ Payload inválido para addVote:', event.payload);
    }
  }, [addVote]);

  const handleCommentCreated = useCallback((event: any) => {
    console.log('💬 SOCKET - Evento comment:created recebido!');
    console.log('💬 SOCKET - Event completo:', event);
    console.log('💬 SOCKET - Payload do evento:', event.payload);
    console.log('💬 SOCKET - Tipo do evento:', event.type);
    
    if (event.payload && event.payload.id) {
      console.log('💬 SOCKET - Adicionando comentário localmente...');
      console.log('💬 SOCKET - Comment ID:', event.payload.id);
      console.log('💬 SOCKET - Card ID:', event.payload.cardId);
      
      addComment(event.payload);
      
      console.log('💬 SOCKET - Comentário adicionado com sucesso no estado local!');
    } else {
      console.error('❌ SOCKET - Payload inválido para addComment:', event.payload);
      console.error('❌ SOCKET - ID presente:', !!event.payload?.id);
    }
  }, [addComment]);

  const handleCommentUpdated = useCallback((event: any) => {
    console.log('💬 Processando comentário atualizado:', event.payload);
    if (event.payload && event.payload.id) {
      updateComment(event.payload.id, event.payload);
    } else {
      console.error('❌ Payload inválido para updateComment:', event.payload);
    }
  }, [updateComment]);

  const handleCommentDeleted = useCallback((event: any) => {
    console.log('🗑️ Processando comentário deletado:', event.payload);
    if (event.payload && event.payload.commentId) {
      removeComment(event.payload.commentId);
    } else {
      console.error('❌ Payload inválido para removeComment:', event.payload);
    }
  }, [removeComment]);

  const handleCardVoteRemoved = useCallback((event: any) => {
    console.log('👎 SOCKET - Evento card:vote:removed recebido!');
    console.log('👎 SOCKET - Event completo:', event);
    console.log('👎 SOCKET - Payload do evento:', event.payload);
    console.log('👎 SOCKET - Tipo do evento:', event.type);
    
    if (event.payload && event.payload.cardId && event.payload.userId) {
      console.log('👎 SOCKET - Removendo voto localmente...');
      console.log('👎 SOCKET - cardId:', event.payload.cardId);
      console.log('👎 SOCKET - userId:', event.payload.userId);
      
      removeVote(event.payload.cardId, event.payload.userId);
      
      console.log('👎 SOCKET - Voto removido com sucesso no estado local!');
    } else {
      console.error('❌ SOCKET - Payload inválido para removeVote:', event.payload);
      console.error('❌ SOCKET - cardId presente:', !!event.payload?.cardId);
      console.error('❌ SOCKET - userId presente:', !!event.payload?.userId);
    }
  }, [removeVote]);

  // Column event handlers
  const handleColumnCreated = useCallback((event: any) => {
    console.log('📋 Processando coluna criada:', event.payload);
    if (event.payload && event.payload.id) {
      addColumn(event.payload);
    } else {
      console.error('❌ Payload inválido para addColumn:', event.payload);
    }
  }, [addColumn]);

  const handleColumnUpdated = useCallback((event: any) => {
    console.log('📋 Processando coluna atualizada:', event.payload);
    if (event.payload && event.payload.id) {
      updateColumn(event.payload.id, event.payload);
    } else {
      console.error('❌ Payload inválido para updateColumn:', event.payload);
    }
  }, [updateColumn]);

  const handleColumnDeleted = useCallback((event: any) => {
    console.log('🗑️ Processando coluna deletada:', event.payload);
    if (event.payload && event.payload.columnId) {
      removeColumn(event.payload.columnId);
    } else {
      console.error('❌ Payload inválido para removeColumn:', event.payload);
    }
  }, [removeColumn]);

  const handleColumnsReordered = useCallback((event: any) => {
    console.log('🔄 Processando colunas reordenadas:', event.payload);
    if (event.payload && event.payload.columns) {
      reorderColumns(event.payload.columns);
    } else {
      console.error('❌ Payload inválido para reorderColumns:', event.payload);
    }
  }, [reorderColumns]);

  // Poll event handlers
  const handlePollCreated = useCallback((event: any) => {
    console.log('📊 Processando enquete criada:', event.payload);
    if (event.payload && event.payload.id) {
      addPoll(event.payload);
    } else {
      console.error('❌ Payload inválido para addPoll:', event.payload);
    }
  }, [addPoll]);

  const handlePollUpdated = useCallback((event: any) => {
    console.log('📊 Processando enquete atualizada:', event.payload);
    if (event.payload && event.payload.id) {
      updatePollData(event.payload.id, event.payload);
    } else {
      console.error('❌ Payload inválido para updatePollData:', event.payload);
    }
  }, [updatePollData]);

  const handlePollDeleted = useCallback((event: any) => {
    console.log('🗑️ Processando enquete deletada:', event.payload);
    if (event.payload && event.payload.pollId) {
      removePoll(event.payload.pollId);
    } else {
      console.error('❌ Payload inválido para removePoll:', event.payload);
    }
  }, [removePoll]);

  const handlePollVoted = useCallback(async (event: any) => {
    console.log('🗳️ Processando voto na enquete:', event.payload);
    if (event.payload && event.payload.pollId) {
      try {
        // Buscar a poll atualizada do backend
        const { kanbanService } = await import('@/services/kanbanService');
        const updatedPoll = await kanbanService.getPollById(event.payload.pollId);
        console.log('🗳️ Poll atualizada recebida:', updatedPoll);
        
        // Atualizar a poll no store
        addPoll(updatedPoll);
      } catch (error) {
        console.error('❌ Erro ao buscar poll atualizada:', error);
      }
    } else {
      console.error('❌ Payload inválido para handlePollVoted:', event.payload);
    }
  }, [addPoll]);

  const handlePollVoteRemoved = useCallback(async (event: any) => {
    console.log('🗳️ Processando voto removido da enquete:', event.payload);
    if (event.payload && event.payload.pollId) {
      try {
        // Buscar a poll atualizada do backend
        const { kanbanService } = await import('@/services/kanbanService');
        const updatedPoll = await kanbanService.getPollById(event.payload.pollId);
        console.log('🗳️ Poll atualizada após remoção de voto:', updatedPoll);
        
        // Atualizar a poll no store
        addPoll(updatedPoll);
      } catch (error) {
        console.error('❌ Erro ao buscar poll atualizada:', error);
      }
    } else {
      console.error('❌ Payload inválido para handlePollVoteRemoved:', event.payload);
    }
  }, [addPoll]);

  useEffect(() => {
    // Conectar se necessário
    const token = localStorage.getItem('accessToken');
    if (token) {
      console.log('🔌 useSocket: Inicializando Socket.IO...');
      socketService.connectIfNeeded();
    } else {
      console.log('⚠️ useSocket: Token não encontrado');
    }
    
    // Registrar listeners apenas uma vez
    if (!listenersRegistered) {
      console.log('🔌 useSocket: Registrando listeners pela primeira vez...');
      socketService.on('connection', handleConnectionChange);
      socketService.on('card:created', handleCardCreated);
      socketService.on('card:updated', handleCardUpdated);
      socketService.on('card:deleted', handleCardDeleted);
      socketService.on('card:moved', handleCardMoved);
      socketService.on('card:voted', handleCardVoted);
      console.log('🔌 SOCKET - Registrando listener para card:vote:removed');
      socketService.on('card:vote:removed', handleCardVoteRemoved);
      socketService.on('comment:created', handleCommentCreated);
      socketService.on('comment:updated', handleCommentUpdated);
      socketService.on('comment:deleted', handleCommentDeleted);
      socketService.on('column:created', handleColumnCreated);
      socketService.on('column:updated', handleColumnUpdated);
      socketService.on('column:deleted', handleColumnDeleted);
      socketService.on('columns:reordered', handleColumnsReordered);
      socketService.on('poll:created', handlePollCreated);
      socketService.on('poll:updated', handlePollUpdated);
      socketService.on('poll:deleted', handlePollDeleted);
      socketService.on('poll:voted', handlePollVoted);
      socketService.on('poll:vote:removed', handlePollVoteRemoved);
      
      listenersRegistered = true;
      console.log('🔌 useSocket: Listeners registrados com sucesso!');
    } else {
      console.log('🔌 useSocket: Listeners já registrados, pulando...');
    }

    // Verificar status inicial
    setIsConnected(socketService.isSocketConnected());
    setSocketId(socketService.getSocketId());

    // Cleanup - não remove listeners se foram registrados globalmente
    return () => {
      // Os listeners são registrados globalmente e não devem ser removidos aqui
      // para evitar problemas quando múltiplos componentes usam useSocket
      console.log('🔌 useSocket: Cleanup executado (listeners mantidos globalmente)');
    };
  }, [
    handleConnectionChange,
    handleCardCreated,
    handleCardUpdated,
    handleCardDeleted,
    handleCardMoved,
    handleCardVoted,
    handleCardVoteRemoved,
    handleCommentCreated,
    handleCommentUpdated,
    handleCommentDeleted,
    handleColumnCreated,
    handleColumnUpdated,
    handleColumnDeleted,
    handleColumnsReordered,
    handlePollCreated,
    handlePollUpdated,
    handlePollDeleted,
    handlePollVoted,
    handlePollVoteRemoved,
  ]);

  const joinBoard = useCallback((boardId: string) => {
    socketService.joinBoard(boardId);
  }, []);

  const leaveBoard = useCallback((boardId: string) => {
    socketService.leaveBoard(boardId);
  }, []);

  const reconnect = useCallback(() => {
    socketService.reconnect();
  }, []);

  return {
    isConnected,
    socketId,
    joinBoard,
    leaveBoard,
    reconnect,
  };
};
