import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Card, Column, User, Board, KanbanState, Comment, Vote, KanbanEvent } from '@/types/kanban';
import { kanbanService } from '@/services/kanbanService';
import { toast } from 'sonner';

interface KanbanActions {
  // Board actions
  setBoard: (board: Board) => void;
  loadBoard: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  
  // Search and filter actions
  setSearchQuery: (query: string) => void;
  setSelectedColumnId: (columnId: string | null) => void;
  
  // Card actions
  addCard: (card: Card) => void;
  createCard: (data: { title: string; description: string; columnId: string }) => Promise<Card>;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  updateCardData: (cardId: string, data: { title?: string; description?: string }) => Promise<Card>;
  removeCard: (cardId: string) => void;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, toColumnId: string, position: number) => void;
  moveCardData: (cardId: string, toColumnId: string, position: number) => Promise<Card>;
  setSelectedCard: (card: Card | null) => void;
  
  // Column actions
  addColumn: (column: Column) => void;
  createColumn: (data: { name: string; position?: number }) => Promise<Column>;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  updateColumnData: (columnId: string, data: { name?: string; position?: number }) => Promise<Column>;
  removeColumn: (columnId: string) => void;
  deleteColumn: (columnId: string) => Promise<void>;
  reorderColumns: (columns: Column[]) => void;
  reorderColumnsData: (columns: Array<{ id: string; position: number }>) => Promise<Column[]>;
  
  // Vote actions
  addVote: (vote: Vote) => void;
  toggleVote: (cardId: string) => Promise<void>;
  removeVote: (cardId: string, userId: string) => void;
  
  // Comment actions
  addComment: (comment: Comment) => void;
  createComment: (cardId: string, data: { body: string }) => Promise<Comment>;
  updateComment: (commentId: string, updates: Partial<Comment>) => void;
  updateCommentData: (commentId: string, data: { body: string }) => Promise<Comment>;
  removeComment: (commentId: string) => void;
  deleteComment: (commentId: string) => Promise<void>;
  
  // User actions
  setUser: (user: User | null) => void;
  
  // Drag and drop
  setDraggedCard: (card: Card | null, sourceColumnId?: string, sourcePosition?: number) => void;
  
  // Real-time events
  handleRealtimeEvent: (event: KanbanEvent) => void;
  connectToRealtime: () => void;
  disconnectFromRealtime: () => void;
  
  // Selectors
  getCardsByColumn: (columnId: string) => Card[];
  getFilteredCards: () => Card[];
  getUserVoteForCard: (cardId: string, userId: string) => Vote | undefined;
}

// Initial state
const initialState: KanbanState = {
  board: {
    columns: [],
    cards: [],
  },
  isLoading: false,
  searchQuery: '',
  selectedColumnId: null,
  selectedCard: null,
  draggedCard: null,
  user: null,
};

export const useKanbanStore = create<KanbanState & KanbanActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,
      
      // Board actions
      setBoard: (board) =>
        set((state) => {
          state.board = board;
        }),
      
      loadBoard: async () => {
        set((state) => {
          state.isLoading = true;
        });
        
        try {
          const board = await kanbanService.getBoard();
          set((state) => {
            state.board = board;
          });
        } catch (error) {
          console.error('Error loading board:', error);
          toast.error('Erro ao carregar o board');
        } finally {
          set((state) => {
            state.isLoading = false;
          });
        }
      },
      
      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),
      
      // Search and filter actions
      setSearchQuery: (query) =>
        set((state) => {
          state.searchQuery = query;
        }),
      
      setSelectedColumnId: (columnId) =>
        set((state) => {
          state.selectedColumnId = columnId;
        }),
      
      // Card actions
      addCard: (card) =>
        set((state) => {
          state.board.cards.push(card);
        }),
      
      createCard: async (data) => {
        try {
          const card = await kanbanService.createCard(data);
          set((state) => {
            state.board.cards.push(card);
          });
          toast.success('Card criado com sucesso!');
          return card;
        } catch (error) {
          console.error('Error creating card:', error);
          toast.error('Erro ao criar card');
          throw error;
        }
      },
      
      updateCard: (cardId, updates) =>
        set((state) => {
          const cardIndex = state.board.cards.findIndex((c) => c.id === cardId);
          if (cardIndex !== -1) {
            Object.assign(state.board.cards[cardIndex], updates);
          }
        }),
      
      updateCardData: async (cardId, data) => {
        try {
          const card = await kanbanService.updateCard(cardId, data);
          set((state) => {
            const cardIndex = state.board.cards.findIndex((c) => c.id === cardId);
            if (cardIndex !== -1) {
              state.board.cards[cardIndex] = card;
            }
          });
          toast.success('Card atualizado com sucesso!');
          return card;
        } catch (error) {
          console.error('Error updating card:', error);
          toast.error('Erro ao atualizar card');
          throw error;
        }
      },
      
      removeCard: (cardId) =>
        set((state) => {
          state.board.cards = state.board.cards.filter((c) => c.id !== cardId);
          if (state.selectedCard?.id === cardId) {
            state.selectedCard = null;
          }
        }),
      
      deleteCard: async (cardId) => {
        try {
          await kanbanService.deleteCard(cardId);
          set((state) => {
            state.board.cards = state.board.cards.filter((c) => c.id !== cardId);
            if (state.selectedCard?.id === cardId) {
              state.selectedCard = null;
            }
          });
          toast.success('Card excluído com sucesso!');
        } catch (error) {
          console.error('Error deleting card:', error);
          toast.error('Erro ao excluir card');
          throw error;
        }
      },
      
      moveCard: (cardId, toColumnId, position) =>
        set((state) => {
          const cardIndex = state.board.cards.findIndex((c) => c.id === cardId);
          if (cardIndex !== -1) {
            state.board.cards[cardIndex].columnId = toColumnId;
            state.board.cards[cardIndex].position = position;
            state.board.cards[cardIndex].updatedAt = new Date();
          }
        }),
      
      moveCardData: async (cardId, toColumnId, position) => {
        try {
          const card = await kanbanService.moveCard(cardId, { toColumnId, position });
          set((state) => {
            const cardIndex = state.board.cards.findIndex((c) => c.id === cardId);
            if (cardIndex !== -1) {
              state.board.cards[cardIndex] = card;
            }
          });
          return card;
        } catch (error) {
          console.error('Error moving card:', error);
          toast.error('Erro ao mover card');
          throw error;
        }
      },
      
      setSelectedCard: (card) =>
        set((state) => {
          state.selectedCard = card;
        }),
      
      // Column actions
      addColumn: (column) =>
        set((state) => {
          state.board.columns.push(column);
        }),
      
      updateColumn: (columnId, updates) =>
        set((state) => {
          const columnIndex = state.board.columns.findIndex((c) => c.id === columnId);
          if (columnIndex !== -1) {
            Object.assign(state.board.columns[columnIndex], updates);
          }
        }),
      
      removeColumn: (columnId) =>
        set((state) => {
          state.board.columns = state.board.columns.filter((c) => c.id !== columnId);
          // Remove cards from deleted column
          state.board.cards = state.board.cards.filter((c) => c.columnId !== columnId);
        }),
      
      reorderColumns: (columns) =>
        set((state) => {
          state.board.columns = columns;
        }),
      
      // Vote actions
      addVote: (vote) =>
        set((state) => {
          const cardIndex = state.board.cards.findIndex((c) => c.id === vote.cardId);
          if (cardIndex !== -1) {
            const existingVoteIndex = state.board.cards[cardIndex].votes.findIndex(
              (v) => v.userId === vote.userId
            );
            if (existingVoteIndex === -1) {
              state.board.cards[cardIndex].votes.push(vote);
            }
          }
        }),
      
      toggleVote: async (cardId) => {
        try {
          const state = get();
          const card = state.board.cards.find(c => c.id === cardId);
          const user = state.user;
          
          if (!card || !user) return;
          
          const hasVoted = card.votes.some(v => v.userId === user.id);
          
          if (hasVoted) {
            await kanbanService.removeVote(cardId);
            set((state) => {
              const cardIndex = state.board.cards.findIndex((c) => c.id === cardId);
              if (cardIndex !== -1) {
                state.board.cards[cardIndex].votes = state.board.cards[cardIndex].votes.filter(
                  (v) => v.userId !== user.id
                );
              }
            });
            toast.success('Voto removido!');
          } else {
            const vote = await kanbanService.addVote(cardId);
            set((state) => {
              const cardIndex = state.board.cards.findIndex((c) => c.id === cardId);
              if (cardIndex !== -1) {
                state.board.cards[cardIndex].votes.push(vote);
              }
            });
            toast.success('Voto registrado!');
          }
        } catch (error) {
          console.error('Error toggling vote:', error);
          toast.error('Erro ao votar');
        }
      },
      
      removeVote: (cardId, userId) =>
        set((state) => {
          const cardIndex = state.board.cards.findIndex((c) => c.id === cardId);
          if (cardIndex !== -1) {
            state.board.cards[cardIndex].votes = state.board.cards[cardIndex].votes.filter(
              (v) => v.userId !== userId
            );
          }
        }),
      
      // Comment actions
      addComment: (comment) =>
        set((state) => {
          const cardIndex = state.board.cards.findIndex((c) => c.id === comment.cardId);
          if (cardIndex !== -1) {
            state.board.cards[cardIndex].comments.push(comment);
          }
        }),
      
      createComment: async (cardId, data) => {
        try {
          const comment = await kanbanService.createComment(cardId, data);
          set((state) => {
            const cardIndex = state.board.cards.findIndex((c) => c.id === cardId);
            if (cardIndex !== -1) {
              state.board.cards[cardIndex].comments.push(comment);
            }
          });
          toast.success('Comentário adicionado!');
          return comment;
        } catch (error) {
          console.error('Error creating comment:', error);
          toast.error('Erro ao adicionar comentário');
          throw error;
        }
      },
      
      updateComment: (commentId, updates) =>
        set((state) => {
          for (const card of state.board.cards) {
            const commentIndex = card.comments.findIndex((c) => c.id === commentId);
            if (commentIndex !== -1) {
              Object.assign(card.comments[commentIndex], updates);
              break;
            }
          }
        }),
      
      updateCommentData: async (commentId, data) => {
        try {
          const comment = await kanbanService.updateComment(commentId, data);
          set((state) => {
            for (const card of state.board.cards) {
              const commentIndex = card.comments.findIndex((c) => c.id === commentId);
              if (commentIndex !== -1) {
                card.comments[commentIndex] = comment;
                break;
              }
            }
          });
          toast.success('Comentário atualizado!');
          return comment;
        } catch (error) {
          console.error('Error updating comment:', error);
          toast.error('Erro ao atualizar comentário');
          throw error;
        }
      },
      
      removeComment: (commentId) =>
        set((state) => {
          for (const card of state.board.cards) {
            card.comments = card.comments.filter((c) => c.id !== commentId);
          }
        }),
      
      deleteComment: async (commentId) => {
        try {
          await kanbanService.deleteComment(commentId);
          set((state) => {
            for (const card of state.board.cards) {
              card.comments = card.comments.filter((c) => c.id !== commentId);
            }
          });
          toast.success('Comentário excluído!');
        } catch (error) {
          console.error('Error deleting comment:', error);
          toast.error('Erro ao excluir comentário');
          throw error;
        }
      },
      
      // User actions
      setUser: (user) =>
        set((state) => {
          state.user = user;
        }),
      
      // Drag and drop
      setDraggedCard: (card, sourceColumnId, sourcePosition) =>
        set((state) => {
          if (card && sourceColumnId !== undefined && sourcePosition !== undefined) {
            state.draggedCard = {
              card,
              sourceColumnId,
              sourcePosition,
            };
          } else {
            state.draggedCard = null;
          }
        }),
      
      // Real-time events
      handleRealtimeEvent: (event) => {
        switch (event.type) {
          case 'card.created':
            set((state) => {
              state.board.cards.push(event.payload);
            });
            break;
          case 'card.updated':
            set((state) => {
              const cardIndex = state.board.cards.findIndex((c) => c.id === event.payload.id);
              if (cardIndex !== -1) {
                state.board.cards[cardIndex] = event.payload;
              }
            });
            break;
          case 'card.moved':
            set((state) => {
              const cardIndex = state.board.cards.findIndex((c) => c.id === event.payload.cardId);
              if (cardIndex !== -1) {
                state.board.cards[cardIndex].columnId = event.payload.toColumnId;
                state.board.cards[cardIndex].position = event.payload.position;
              }
            });
            break;
          case 'card.deleted':
            set((state) => {
              state.board.cards = state.board.cards.filter((c) => c.id !== event.payload.cardId);
              if (state.selectedCard?.id === event.payload.cardId) {
                state.selectedCard = null;
              }
            });
            break;
          case 'vote.added':
            set((state) => {
              const cardIndex = state.board.cards.findIndex((c) => c.id === event.payload.cardId);
              if (cardIndex !== -1) {
                const existingVoteIndex = state.board.cards[cardIndex].votes.findIndex(
                  (v) => v.userId === event.payload.userId
                );
                if (existingVoteIndex === -1) {
                  state.board.cards[cardIndex].votes.push(event.payload);
                }
              }
            });
            break;
          case 'vote.removed':
            set((state) => {
              const cardIndex = state.board.cards.findIndex((c) => c.id === event.payload.cardId);
              if (cardIndex !== -1) {
                state.board.cards[cardIndex].votes = state.board.cards[cardIndex].votes.filter(
                  (v) => v.userId !== event.payload.userId
                );
              }
            });
            break;
          case 'comment.added':
            set((state) => {
              const cardIndex = state.board.cards.findIndex((c) => c.id === event.payload.cardId);
              if (cardIndex !== -1) {
                state.board.cards[cardIndex].comments.push(event.payload);
              }
            });
            break;
          case 'comment.updated':
            set((state) => {
              for (const card of state.board.cards) {
                const commentIndex = card.comments.findIndex((c) => c.id === event.payload.id);
                if (commentIndex !== -1) {
                  card.comments[commentIndex] = event.payload;
                  break;
                }
              }
            });
            break;
          case 'comment.deleted':
            set((state) => {
              for (const card of state.board.cards) {
                card.comments = card.comments.filter((c) => c.id !== event.payload.commentId);
              }
            });
            break;
        }
      },
      
      connectToRealtime: () => {
        kanbanService.connectToEvents();
        kanbanService.addEventListener('card.created', get().handleRealtimeEvent);
        kanbanService.addEventListener('card.updated', get().handleRealtimeEvent);
        kanbanService.addEventListener('card.moved', get().handleRealtimeEvent);
        kanbanService.addEventListener('card.deleted', get().handleRealtimeEvent);
        kanbanService.addEventListener('vote.added', get().handleRealtimeEvent);
        kanbanService.addEventListener('vote.removed', get().handleRealtimeEvent);
        kanbanService.addEventListener('comment.added', get().handleRealtimeEvent);
        kanbanService.addEventListener('comment.updated', get().handleRealtimeEvent);
        kanbanService.addEventListener('comment.deleted', get().handleRealtimeEvent);
      },
      
      disconnectFromRealtime: () => {
        kanbanService.disconnectFromEvents();
      },
      
      // Selectors
      getCardsByColumn: (columnId) => {
        const state = get();
        return [...state.board.cards]
          .filter((card) => card.columnId === columnId)
          .sort((a, b) => a.position - b.position);
      },
      
      getFilteredCards: () => {
        const state = get();
        let cards = state.board.cards;
        
        // Filter by search query
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          cards = cards.filter(
            (card) =>
              card.title.toLowerCase().includes(query) ||
              card.description.toLowerCase().includes(query)
          );
        }
        
        // Filter by column
        if (state.selectedColumnId) {
          cards = cards.filter((card) => card.columnId === state.selectedColumnId);
        }
        
        return [...cards].sort((a, b) => a.position - b.position);
      },
      
      getUserVoteForCard: (cardId, userId) => {
        const state = get();
        const card = state.board.cards.find((c) => c.id === cardId);
        return card?.votes.find((v) => v.userId === userId);
      },
    }))
  )
);

// Useful selectors as separate hooks
export const useBoard = () => useKanbanStore((state) => state.board);
export const useCards = () => useKanbanStore((state) => state.board.cards);
export const useColumns = () => useKanbanStore((state) => state.board.columns);
export const useSearchQuery = () => useKanbanStore((state) => state.searchQuery);
export const useSelectedCard = () => useKanbanStore((state) => state.selectedCard);
export const useCurrentUser = () => useKanbanStore((state) => state.user);
export const useIsLoading = () => useKanbanStore((state) => state.isLoading);