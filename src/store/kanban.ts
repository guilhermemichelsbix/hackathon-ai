import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Card, Column, User, Board, KanbanState, Comment, Vote, KanbanEvent, Poll } from '@/types/kanban';
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
  setSelectedCreators: (userIds: string[]) => void;
  
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
  
  // Column visibility and ordering
  toggleColumnVisibility: (columnId: string) => void;
  setColumnVisibility: (columnId: string, visible: boolean) => void;
  moveColumnLeft: (columnId: string) => Promise<void>;
  moveColumnRight: (columnId: string) => Promise<void>;
  resetColumnVisibility: () => void;
  
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
  
  // Poll actions
  createPoll: (poll: Omit<Poll, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Poll>;
  updatePoll: (pollId: string, updates: Partial<Poll>) => Promise<Poll>;
  deletePoll: (pollId: string) => Promise<void>;
  votePoll: (pollId: string, optionIds: string[], userId: string) => Promise<void>;
  
  // Real-time poll actions (synchronous)
  addPoll: (poll: Poll) => void;
  updatePollData: (pollId: string, updates: Partial<Poll>) => void;
  removePoll: (pollId: string) => void;

  // Real-time events
  handleRealtimeEvent: (event: KanbanEvent) => void;
  
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
  selectedCreators: [],
  selectedCard: null,
  draggedCard: null,
  user: null,
  visibleColumns: [], // Will be populated when board loads
  columnOrder: [], // Will be populated when board loads
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
            
            // Initialize column order from backend
            state.columnOrder = board.columns.sort((a, b) => a.position - b.position).map(col => col.id);
            
            // Load visible columns from localStorage or default to all
            const savedVisibleColumns = localStorage.getItem('kanban-visible-columns');
            if (savedVisibleColumns) {
              try {
                const parsed = JSON.parse(savedVisibleColumns);
                // Only include columns that still exist
                state.visibleColumns = parsed.filter((id: string) => 
                  board.columns.some(col => col.id === id)
                );
                // If no valid columns, show all
                if (state.visibleColumns.length === 0) {
                  state.visibleColumns = board.columns.map(col => col.id);
                }
              } catch {
                state.visibleColumns = board.columns.map(col => col.id);
              }
            } else {
              state.visibleColumns = board.columns.map(col => col.id);
            }
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

      setSelectedCreators: (userIds) =>
        set((state) => {
          // store just the ids
          state.selectedCreators = userIds;
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
      
      createColumn: async (data) => {
        try {
          const column = await kanbanService.createColumn(data);
          set((state) => {
            state.board.columns.push(column);
            state.columnOrder.push(column.id);
            state.visibleColumns.push(column.id);
          });
          toast.success('Coluna criada com sucesso!');
          return column;
        } catch (error) {
          console.error('Error creating column:', error);
          toast.error('Erro ao criar coluna');
          throw error;
        }
      },
      
      updateColumn: (columnId, updates) =>
        set((state) => {
          const columnIndex = state.board.columns.findIndex((c) => c.id === columnId);
          if (columnIndex !== -1) {
            Object.assign(state.board.columns[columnIndex], updates);
          }
        }),
      
      updateColumnData: async (columnId, data) => {
        try {
          const column = await kanbanService.updateColumn(columnId, data);
          set((state) => {
            const columnIndex = state.board.columns.findIndex((c) => c.id === columnId);
            if (columnIndex !== -1) {
              state.board.columns[columnIndex] = column;
            }
          });
          toast.success('Coluna atualizada com sucesso!');
          return column;
        } catch (error) {
          console.error('Error updating column:', error);
          toast.error('Erro ao atualizar coluna');
          throw error;
        }
      },
      
      removeColumn: (columnId) =>
        set((state) => {
          state.board.columns = state.board.columns.filter((c) => c.id !== columnId);
          // Remove cards from deleted column
          state.board.cards = state.board.cards.filter((c) => c.columnId !== columnId);
          // Remove from order and visibility
          state.columnOrder = state.columnOrder.filter(id => id !== columnId);
          state.visibleColumns = state.visibleColumns.filter(id => id !== columnId);
        }),
      
      deleteColumn: async (columnId) => {
        try {
          await kanbanService.deleteColumn(columnId);
          set((state) => {
            state.board.columns = state.board.columns.filter((c) => c.id !== columnId);
            state.board.cards = state.board.cards.filter((c) => c.columnId !== columnId);
            state.columnOrder = state.columnOrder.filter(id => id !== columnId);
            state.visibleColumns = state.visibleColumns.filter(id => id !== columnId);
          });
          toast.success('Coluna excluída com sucesso!');
        } catch (error) {
          console.error('Error deleting column:', error);
          toast.error('Erro ao excluir coluna');
          throw error;
        }
      },
      
      reorderColumns: (columns) =>
        set((state) => {
          // Update columns array
          state.board.columns = columns;
          // Update column order based on new positions
          state.columnOrder = columns
            .sort((a, b) => a.position - b.position)
            .map(col => col.id);
          console.log('✅ Columns reordered in real-time:', state.columnOrder);
        }),
      
      reorderColumnsData: async (columns) => {
        try {
          const reorderedColumns = await kanbanService.reorderColumns(columns);
          set((state) => {
            // Update local state with reordered columns
            columns.forEach(({ id, position }) => {
              const columnIndex = state.board.columns.findIndex(c => c.id === id);
              if (columnIndex !== -1) {
                state.board.columns[columnIndex].position = position;
              }
            });
            // Sort columns by position
            state.board.columns.sort((a, b) => a.position - b.position);
            // Update column order
            state.columnOrder = state.board.columns.map(col => col.id);
          });
          toast.success('Ordem das colunas atualizada!');
          return reorderedColumns;
        } catch (error) {
          console.error('Error reordering columns:', error);
          toast.error('Erro ao reordenar colunas');
          throw error;
        }
      },
      
      // Column visibility and ordering
      toggleColumnVisibility: (columnId) =>
        set((state) => {
          const isVisible = state.visibleColumns.includes(columnId);
          if (isVisible) {
            state.visibleColumns = state.visibleColumns.filter(id => id !== columnId);
          } else {
            state.visibleColumns.push(columnId);
          }
          
          // Save to localStorage
          localStorage.setItem('kanban-visible-columns', JSON.stringify(state.visibleColumns));
        }),
      
      setColumnVisibility: (columnId, visible) =>
        set((state) => {
          if (visible) {
            if (!state.visibleColumns.includes(columnId)) {
              state.visibleColumns.push(columnId);
            }
          } else {
            state.visibleColumns = state.visibleColumns.filter(id => id !== columnId);
          }
          
          // Save to localStorage
          localStorage.setItem('kanban-visible-columns', JSON.stringify(state.visibleColumns));
        }),
      
      moveColumnLeft: async (columnId) => {
        const state = get();
        const currentIndex = state.columnOrder.indexOf(columnId);
        if (currentIndex > 0) {
          // Swap with previous column
          const newOrder = [...state.columnOrder];
          [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
          
          // Save to backend - Socket.IO will handle state update
          try {
            const columnsToUpdate = newOrder.map((id, index) => ({ id, position: index }));
            await kanbanService.reorderColumns(columnsToUpdate);
            console.log('✅ Column moved left via API - Socket.IO will update state');
            toast.success('Ordem das colunas atualizada!');
          } catch (error) {
            console.error('Error moving column left:', error);
            toast.error('Erro ao mover coluna');
          }
        }
      },
      
      moveColumnRight: async (columnId) => {
        const state = get();
        const currentIndex = state.columnOrder.indexOf(columnId);
        if (currentIndex < state.columnOrder.length - 1) {
          // Swap with next column
          const newOrder = [...state.columnOrder];
          [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
          
          // Save to backend - Socket.IO will handle state update
          try {
            const columnsToUpdate = newOrder.map((id, index) => ({ id, position: index }));
            await kanbanService.reorderColumns(columnsToUpdate);
            console.log('✅ Column moved right via API - Socket.IO will update state');
            toast.success('Ordem das colunas atualizada!');
          } catch (error) {
            console.error('Error moving column right:', error);
            toast.error('Erro ao mover coluna');
          }
        }
      },
      
      resetColumnVisibility: () =>
        set((state) => {
          state.visibleColumns = state.board.columns.map(col => col.id);
          // Save to localStorage
          localStorage.setItem('kanban-visible-columns', JSON.stringify(state.visibleColumns));
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
            // Check if comment already exists to avoid duplicates
            const existingCommentIndex = state.board.cards[cardIndex].comments.findIndex(c => c.id === comment.id);
            if (existingCommentIndex === -1) {
              state.board.cards[cardIndex].comments.push(comment);
              console.log('✅ Comment added in real-time:', comment.id);
            } else {
              console.log('⚠️ Comment already exists, updating instead:', comment.id);
              state.board.cards[cardIndex].comments[existingCommentIndex] = comment;
            }
          }
        }),
      
      createComment: async (cardId, data) => {
        try {
          // Apenas chama a API - Socket.IO vai atualizar o estado
          const comment = await kanbanService.createComment(cardId, data);
          console.log('✅ Comentário criado via API - Socket.IO vai atualizar o estado');
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
          // Apenas chama a API - Socket.IO vai atualizar o estado
          const comment = await kanbanService.updateComment(commentId, data);
          console.log('✅ Comentário atualizado via API - Socket.IO vai atualizar o estado');
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
          // Apenas chama a API - Socket.IO vai atualizar o estado
          await kanbanService.deleteComment(commentId);
          console.log('✅ Comentário deletado via API - Socket.IO vai atualizar o estado');
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

      // Poll actions
      createPoll: async (pollData) => {
        try {
          const poll = await kanbanService.createPoll(pollData);
          set((state) => {
            const cardIndex = state.board.cards.findIndex((c) => c.id === poll.cardId);
            if (cardIndex !== -1) {
              // Check if poll already exists to avoid duplicates
              const existingPollIndex = state.board.cards[cardIndex].polls.findIndex(p => p.id === poll.id);
              if (existingPollIndex === -1) {
                state.board.cards[cardIndex].polls.push(poll);
                console.log('✅ Poll created and added to card:', poll.id);
              } else {
                console.log('⚠️ Poll already exists during creation, updating instead:', poll.id);
                state.board.cards[cardIndex].polls[existingPollIndex] = poll;
              }
            } else {
              console.error('❌ Card not found for poll:', poll.cardId);
            }
          });
          return poll;
        } catch (error) {
          console.error('Error creating poll:', error);
          throw error;
        }
      },

      updatePoll: async (pollId, updates) => {
        try {
          const poll = await kanbanService.updatePoll(pollId, updates);
          set((state) => {
            for (const card of state.board.cards) {
              if (card.polls && Array.isArray(card.polls)) {
                const pollIndex = card.polls.findIndex((p) => p.id === pollId);
                if (pollIndex !== -1) {
                  card.polls[pollIndex] = poll;
                  console.log('✅ Poll updated:', pollId);
                  break;
                }
              }
            }
          });
          return poll;
        } catch (error) {
          console.error('Error updating poll:', error);
          throw error;
        }
      },

      deletePoll: async (pollId) => {
        try {
          await kanbanService.deletePoll(pollId);
          set((state) => {
            for (const card of state.board.cards) {
              if (card.polls && Array.isArray(card.polls)) {
                const initialLength = card.polls.length;
                card.polls = card.polls.filter((p) => p.id !== pollId);
                if (initialLength !== card.polls.length) {
                  console.log('✅ Poll deleted:', pollId);
                  break;
                }
              }
            }
          });
        } catch (error) {
          console.error('Error deleting poll:', error);
          throw error;
        }
      },

      votePoll: async (pollId, optionIds, userId) => {
        try {
          // Apenas fazer a chamada da API - Socket.IO vai atualizar o estado
          await kanbanService.votePoll(pollId, { optionIds });
          console.log('✅ Vote submitted to poll:', pollId, 'for user:', userId);
          // Não atualizar o estado local aqui - deixar o Socket.IO fazer isso
        } catch (error) {
          console.error('Error voting on poll:', error);
          throw error;
        }
      },

      // Real-time poll actions (synchronous)
      addPoll: (poll) =>
        set((state) => {
          const cardIndex = state.board.cards.findIndex((c) => c.id === poll.cardId);
          if (cardIndex !== -1) {
            // Ensure polls array exists
            if (!state.board.cards[cardIndex].polls) {
              state.board.cards[cardIndex].polls = [];
            }
            
            // Check if poll already exists to avoid duplicates
            const existingPollIndex = state.board.cards[cardIndex].polls.findIndex(p => p.id === poll.id);
            if (existingPollIndex === -1) {
              state.board.cards[cardIndex].polls.push(poll);
              console.log('✅ Poll added to card in real-time:', poll.id);
            } else {
              console.log('⚠️ Poll already exists, updating instead:', poll.id);
              state.board.cards[cardIndex].polls[existingPollIndex] = poll;
            }
          } else {
            console.error('❌ Card not found for poll:', poll.cardId);
          }
        }),

      updatePollData: (pollId, updates) =>
        set((state) => {
          for (const card of state.board.cards) {
            if (card.polls && Array.isArray(card.polls)) {
              const pollIndex = card.polls.findIndex((p) => p.id === pollId);
              if (pollIndex !== -1) {
                Object.assign(card.polls[pollIndex], updates);
                console.log('✅ Poll updated in real-time:', pollId);
                break;
              }
            }
          }
        }),

      removePoll: (pollId) =>
        set((state) => {
          for (const card of state.board.cards) {
            if (card.polls && Array.isArray(card.polls)) {
              const initialLength = card.polls.length;
              card.polls = card.polls.filter((p) => p.id !== pollId);
              if (initialLength !== card.polls.length) {
                console.log('✅ Poll removed in real-time:', pollId);
                break;
              }
            }
          }
        }),
      
      
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
        
        // Filter by visible columns first (if there are any visible restrictions)
        if (state.visibleColumns && state.visibleColumns.length > 0) {
          cards = cards.filter((card) => state.visibleColumns.includes(card.columnId));
        }
        
        // Filter by search query
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          cards = cards.filter(
            (card) =>
              card.title.toLowerCase().includes(query) ||
              card.description.toLowerCase().includes(query) ||
              card.creator?.name?.toLowerCase().includes(query)
          );
        }
        
        // Filter by column
        if (state.selectedColumnId) {
          cards = cards.filter((card) => card.columnId === state.selectedColumnId);
        }

        // Filter by selected creators (multi)
        if ((state as any).selectedCreators && (state as any).selectedCreators.length > 0) {
          const setIds = new Set((state as any).selectedCreators as string[]);
          cards = cards.filter(card => setIds.has(card.createdBy));
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