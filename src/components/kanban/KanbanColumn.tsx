import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { useTheme } from '@/hooks/useTheme';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';
import { Plus, MoreHorizontal } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { KanbanCard } from './KanbanCard';
import type { Column, Card as KanbanCardType } from '@/types/kanban';

interface KanbanColumnProps {
  column: Column;
  cards: KanbanCardType[];
  onAddCard?: (columnId: string) => void;
  onEditColumn?: (column: Column) => void;
  onDeleteColumn?: (column: Column) => void;
  onCardClick?: (card: KanbanCardType) => void;
  onCardEdit?: (card: KanbanCardType) => void;
  onCardDelete?: (card: KanbanCardType) => void;
  onCardVote?: (card: KanbanCardType) => void;
}

export function KanbanColumn({
  column,
  cards,
  onAddCard,
  onEditColumn,
  onDeleteColumn,
  onCardClick,
  onCardEdit,
  onCardDelete,
  onCardVote,
}: KanbanColumnProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: column.id,
  });

  const sortedCards = [...cards].sort((a, b) => a.position - b.position);

  const handleAddCard = () => {
    onAddCard?.(column.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 sm:w-96 flex-shrink-0"
    >
             <div className={`
               flex flex-col h-[calc(100vh-220px)] bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl
               ${isOver ? 'ring-2 ring-primary/30 bg-primary/5 border-primary/40 shadow-primary/20' : 'hover:border-border/50'}
             `}>
        {/* Column Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/20 bg-gradient-to-r from-background/80 to-background/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary/60 shadow-sm" />
              <h3 className="font-bold text-foreground text-lg tracking-tight truncate">
                {column.name}
              </h3>
            </div>
            <Badge variant="secondary" className="ml-auto text-xs px-2.5 py-1 bg-primary/15 text-primary font-bold border-primary/20 shadow-sm">
              {cards.length}
            </Badge>
          </div>

          <div className="flex items-center gap-1 ml-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddCard}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-secondary/50 transition-all duration-200 rounded-lg">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-border/50 shadow-xl">
                <DropdownMenuItem onClick={() => onEditColumn?.(column)} className="hover:bg-primary/10 transition-colors duration-200">
                  {t('column.editColumn')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteColumn?.(column)}
                  className="text-destructive hover:bg-destructive/10 transition-colors duration-200"
                >
                  {t('column.deleteColumn')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cards Container */}
        <div
          ref={setNodeRef}
          className="flex-1 overflow-hidden"
        >
          <div className="h-full overflow-y-auto overflow-x-hidden p-4 space-y-3 custom-scrollbar">
            <SortableContext 
              items={sortedCards.map(card => card.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 min-h-[60px]">
                <AnimatePresence mode="popLayout">
                  {sortedCards.map((card) => (
                    <KanbanCard
                      key={card.id}
                      card={card}
                      onClick={onCardClick}
                      onEdit={onCardEdit}
                      onDelete={onCardDelete}
                      onVote={onCardVote}
                    />
                  ))}
                </AnimatePresence>
                
                {/* Empty state */}
                {cards.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center px-6"
                  >
                    <div className="rounded-2xl p-8 mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-lg">
                      <Plus className="h-12 w-12 text-primary/60" />
                    </div>
                    <h4 className="text-lg font-bold text-foreground mb-2">
                      {t('kanban.noCards')}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      Comece criando sua primeira ideia
                    </p>
                    <Button
                      onClick={handleAddCard}
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('kanban.newIdea')}
                    </Button>
                  </motion.div>
                )}
              </div>
            </SortableContext>
          </div>
        </div>
      </div>
    </motion.div>
  );
}