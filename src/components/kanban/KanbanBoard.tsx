import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/confirm-dialog';

import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { CardDetailsSheet } from './CardDetailsSheet';
import { CardFormModal } from './CardFormModal';
import { ColumnFormModal } from './ColumnFormModal';
import { useKanbanStore } from '@/store/kanban';
import { kanbanService } from '@/services/kanbanService';
import type { Card, Column } from '@/types/kanban';

export function KanbanBoard() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedColumnForNew, setSelectedColumnForNew] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    board,
    isLoading,
    searchQuery,
    selectedColumnId,
    // include selectedCreators to trigger filtered view even when no column/search
    selectedCreators,
    visibleColumns,
    columnOrder,
    getCardsByColumn,
    getFilteredCards,
    moveCard,
    moveCardData,
    addVote,
    removeVote,
    getUserVoteForCard,
    setLoading,
    user: currentUser,
    moveColumnLeft,
    moveColumnRight,
    toggleColumnVisibility,
  } = useKanbanStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get visible and ordered columns
  const getVisibleColumns = useCallback(() => {
    return columnOrder
      .filter(columnId => visibleColumns.includes(columnId))
      .map(columnId => board.columns.find(col => col.id === columnId))
      .filter(Boolean) as Column[];
  }, [columnOrder, visibleColumns, board.columns]);

  // Filter cards based on search and column filter
  const getVisibleCardsForColumn = useCallback((columnId: string) => {
    // Consider any active filter: search, column, or selected creators
    const hasCreatorFilter = Array.isArray(selectedCreators) && selectedCreators.length > 0;
    if (searchQuery || selectedColumnId || hasCreatorFilter) {
      const filteredCards = getFilteredCards();
      return filteredCards.filter(card => card.columnId === columnId);
    }
    return getCardsByColumn(columnId);
  }, [searchQuery, selectedColumnId, selectedCreators, getCardsByColumn, getFilteredCards]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board.cards.find(c => c.id === active.id);
    if (card) {
      setDraggedCard(card);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedCard(null);

    if (!over || !currentUser) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    // Find the card being dragged
    const draggedCard = board.cards.find(c => c.id === cardId);
    if (!draggedCard) return;

    // Determine target column and position
    let targetColumnId: string;
    let newPosition: number;

    const targetColumn = board.columns.find(c => c.id === overId);
    const targetCard = board.cards.find(c => c.id === overId);

    if (targetColumn) {
      // Dropped directly on a column - add to the end
      targetColumnId = targetColumn.id;
      const cardsInColumn = getCardsByColumn(targetColumnId);
      newPosition = cardsInColumn.length;
    } else if (targetCard) {
      // Dropped on another card
      targetColumnId = targetCard.columnId;
      
      if (draggedCard.columnId === targetColumnId) {
        // Moving within the same column - use arrayMove logic
        const cardsInColumn = getCardsByColumn(targetColumnId)
          .sort((a, b) => a.position - b.position);
        
        const oldIndex = cardsInColumn.findIndex(c => c.id === cardId);
        const newIndex = cardsInColumn.findIndex(c => c.id === targetCard.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          newPosition = newIndex;
        } else {
          return; // Invalid indices
        }
      } else {
        // Moving to different column - insert after target card
        newPosition = targetCard.position + 1;
      }
    } else {
      return;
    }

    // Don't move if it's the same position
    if (draggedCard.columnId === targetColumnId && draggedCard.position === newPosition) {
      return;
    }

    try {
      // Optimistic update first (smooth animation)
      moveCard(cardId, targetColumnId, newPosition);
      
      // Then call API in background (don't block UI)
      moveCardData(cardId, targetColumnId, newPosition).catch((error) => {
        console.error('Error moving card:', error);
        toast.error(t('card.moveError'));
        // Could implement rollback here if needed
      });
      
      toast.success(t('card.updateSuccess'));
    } catch (error) {
      console.error('Error moving card:', error);
      toast.error(t('card.moveError'));
    }
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const handleCardEdit = (card: Card) => {
    setEditingCard(card);
  };

  const handleEditColumn = (column: Column) => {
    setEditingColumn(column);
    setIsColumnFormOpen(true);
  };

  const handleCloseColumnForm = () => {
    setEditingColumn(null);
    setIsColumnFormOpen(false);
  };

  const handleCardDelete = async (card: Card) => {
    const confirmed = await confirm({
      title: t('confirm.deleteCardTitle'),
      description: t('confirm.deleteCardDescription'),
      confirmText: t('confirm.confirm'),
      cancelText: t('confirm.cancel'),
      variant: 'destructive'
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      await useKanbanStore.getState().deleteCard(card.id);
      toast.success(t('card.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error(t('error.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleCardVote = async (card: Card) => {
    if (!currentUser) return;

    console.log('🎯 INÍCIO - handleCardVote');
    console.log('🎯 Card ID:', card.id);
    console.log('🎯 User ID:', currentUser.id);
    console.log('🎯 Card votes:', card.votes);
    
    // Always check with the backend to ensure we have the latest state
    try {
      console.log('🔍 Verificando hasUserVoted para card:', card.id);
      const hasVoted = await apiService.hasUserVoted(card.id);
      console.log('🔍 hasUserVoted result:', hasVoted);
      
      if (hasVoted) {
        // Remove vote via API - Socket.IO will handle the state update
        console.log('🗑️ REMOVENDO VOTO - Iniciando chamada API');
        console.log('🗑️ URL será: DELETE /api/cards/' + card.id + '/votes');
        const result = await apiService.removeVote(card.id);
        console.log('🗑️ RESULTADO removeVote:', result);
        console.log('🗑️ Voto removido via API com sucesso');
        toast.success(t('card.unvoteSuccess'));
      } else {
        // Add vote via API - Socket.IO will handle the state update
        console.log('➕ ADICIONANDO VOTO - Iniciando chamada API');
        console.log('➕ URL será: POST /api/cards/' + card.id + '/votes');
        const newVote = await apiService.addVote(card.id);
        console.log('➕ RESULTADO addVote:', newVote);
        console.log('➕ Voto adicionado via API com sucesso');
        toast.success(t('card.voteSuccess'));
      }
    } catch (error) {
      console.error('❌ ERRO COMPLETO em handleCardVote:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      toast.error(t('error.generic'));
    }
    
    console.log('🎯 FIM - handleCardVote');
  };

  const handleAddCard = (columnId: string) => {
    setSelectedColumnForNew(columnId);
    setIsFormOpen(true);
  };

  const handleCloseCardDetails = () => {
    setSelectedCard(null);
  };

  const handleCloseCardForm = () => {
    setIsFormOpen(false);
    setEditingCard(null);
    setSelectedColumnForNew(null);
  };

  // Scroll navigation functions
  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({
        left: -320, // Width of one column + gap
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({
        left: 320, // Width of one column + gap
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollability();
      const handleScroll = () => checkScrollability();
      const handleResize = () => checkScrollability();
      
      container.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [board.columns]);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={`relative h-full ${draggedCard ? 'dnd-context-active' : ''}`}>
          {/* Left scroll button */}
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 h-10 w-10 p-0 bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-secondary/50"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Right scroll button */}
          {canScrollRight && (
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollRight}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 h-10 w-10 p-0 bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-secondary/50"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}

                 <div
                   ref={scrollContainerRef}
                   className="h-full overflow-x-auto pt-6 custom-scrollbar scroll-indicator"
                 >
                   <div className="flex gap-6 h-full min-w-max px-6 pb-6">
            <AnimatePresence mode="popLayout">
              {getVisibleColumns().map((column) => {
                const cards = getVisibleCardsForColumn(column.id);
                
                return (
                  <motion.div
                    key={column.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 30,
                      duration: 0.3
                    }}
                    className={`
                      transition-all duration-500 ease-out
                      ${getVisibleColumns().length === 1 ? 'w-full max-w-4xl mx-auto' : 'w-80 sm:w-96 flex-shrink-0'}
                    `}
                  >
                    <KanbanColumn
                      column={column}
                      cards={cards}
                      onAddCard={handleAddCard}
                      onEditColumn={handleEditColumn}
                      onCardClick={handleCardClick}
                      onCardEdit={handleCardEdit}
                      onCardDelete={handleCardDelete}
                      onCardVote={handleCardVote}
                      onMoveColumnLeft={moveColumnLeft}
                      onMoveColumnRight={moveColumnRight}
                      onHideColumn={toggleColumnVisibility}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            </div>
          </div>
        </div>

        <DragOverlay>
          {draggedCard && (
            <div className="rotate-3 opacity-90">
              <KanbanCard card={draggedCard} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      <CardDetailsSheet
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={handleCloseCardDetails}
        onEdit={handleCardEdit}
        onVote={handleCardVote}
      />

      <CardFormModal
        card={editingCard}
        columnId={selectedColumnForNew}
        isOpen={isFormOpen || !!editingCard}
        onClose={handleCloseCardForm}
      />

      <ColumnFormModal
        column={editingColumn}
        isOpen={isColumnFormOpen || !!editingColumn}
        onClose={handleCloseColumnForm}
      />
    </>
  );
}