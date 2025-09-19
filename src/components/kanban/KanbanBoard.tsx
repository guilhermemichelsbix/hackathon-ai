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
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { CardDetailsSheet } from './CardDetailsSheet';
import { CardFormModal } from './CardFormModal';
import { useKanbanStore } from '@/store/kanban';
import { simulateApiDelay } from '@/lib/mock-data';
import type { Card, Column } from '@/types/kanban';

export function KanbanBoard() {
  const { t } = useTranslation();
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedColumnForNew, setSelectedColumnForNew] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    board,
    isLoading,
    searchQuery,
    selectedColumnId,
    getCardsByColumn,
    getFilteredCards,
    moveCard,
    addVote,
    removeVote,
    getUserVoteForCard,
    setLoading,
    user: currentUser,
  } = useKanbanStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter cards based on search and column filter
  const getVisibleCardsForColumn = useCallback((columnId: string) => {
    if (searchQuery || selectedColumnId) {
      const filteredCards = getFilteredCards();
      return filteredCards.filter(card => card.columnId === columnId);
    }
    return getCardsByColumn(columnId);
  }, [searchQuery, selectedColumnId, getCardsByColumn, getFilteredCards]);

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

    // Determine if we're dropping on a column or another card
    let targetColumnId: string;
    let newPosition: number;

    const targetColumn = board.columns.find(c => c.id === overId);
    const targetCard = board.cards.find(c => c.id === overId);

    if (targetColumn) {
      // Dropped on a column
      targetColumnId = targetColumn.id;
      const cardsInColumn = getCardsByColumn(targetColumnId);
      newPosition = cardsInColumn.length;
    } else if (targetCard) {
      // Dropped on another card
      targetColumnId = targetCard.columnId;
      newPosition = targetCard.position;
    } else {
      return;
    }

    // Don't move if it's the same position
    if (draggedCard.columnId === targetColumnId && draggedCard.position === newPosition) {
      return;
    }

    try {
      setLoading(true);
      
      // Optimistic update
      moveCard(cardId, targetColumnId, newPosition);
      
      // Simulate API call
      await simulateApiDelay(300);
      
      toast.success(t('card.updateSuccess'));
    } catch (error) {
      console.error('Error moving card:', error);
      toast.error(t('error.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const handleCardEdit = (card: Card) => {
    setEditingCard(card);
  };

  const handleCardDelete = async (card: Card) => {
    if (!confirm(t('card.confirmDelete'))) return;

    try {
      setLoading(true);
      await simulateApiDelay(300);
      // TODO: Implement delete card API call
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

    const hasVoted = getUserVoteForCard(card.id, currentUser.id);
    
    try {
      if (hasVoted) {
        removeVote(card.id, currentUser.id);
        toast.success(t('card.unvoteSuccess'));
      } else {
        addVote({
          id: `vote-${Date.now()}`,
          cardId: card.id,
          userId: currentUser.id,
          createdAt: new Date(),
        });
        toast.success(t('card.voteSuccess'));
      }
      
      // Simulate API call
      await simulateApiDelay(200);
    } catch (error) {
      console.error('Error voting on card:', error);
      toast.error(t('error.generic'));
    }
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
              {[...board.columns]
                .sort((a, b) => a.position - b.position)
                .map((column) => {
                  const cards = getVisibleCardsForColumn(column.id);
                  
                  return (
                           <motion.div
                             key={column.id}
                             layout
                           >
                      <KanbanColumn
                        column={column}
                        cards={cards}
                        onAddCard={handleAddCard}
                        onCardClick={handleCardClick}
                        onCardEdit={handleCardEdit}
                        onCardDelete={handleCardDelete}
                        onCardVote={handleCardVote}
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
    </>
  );
}