import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { forwardRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { 
  Heart, 
  MessageCircle, 
  User, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Card as KanbanCard } from '@/types/kanban';
import { useKanbanStore, useCurrentUser } from '@/store/kanban';

interface KanbanCardProps {
  card: KanbanCard;
  isDragging?: boolean;
  onEdit?: (card: KanbanCard) => void;
  onDelete?: (card: KanbanCard) => void;
  onVote?: (card: KanbanCard) => void;
  onClick?: (card: KanbanCard) => void;
}

export const KanbanCard = forwardRef<HTMLDivElement, KanbanCardProps>(({ 
  card, 
  isDragging = false, 
  onEdit, 
  onDelete, 
  onVote,
  onClick 
}, ref) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const currentUser = useCurrentUser();
  const getUserVoteForCard = useKanbanStore((state) => state.getUserVoteForCard);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const creator = card.creator;
  const userHasVoted = currentUser ? getUserVoteForCard(card.id, currentUser.id) : false;
  const canEdit = currentUser?.id === card.createdBy;
  const locale = i18n.language === 'pt-BR' ? ptBR : enUS;

  const handleCardClick = (e: React.MouseEvent) => {
    // Só ignora o clique se for diretamente em um botão
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button[data-no-card-click="true"]')) {
      return;
    }
    onClick?.(card);
  };

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVote?.(card);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(card);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(card);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      ref={(node) => {
        setNodeRef(node);
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      }}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        mass: 0.8
      }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      className={`
        group touch-none kanban-card-wrapper
        ${isDragging || sortableIsDragging ? 'opacity-50 rotate-1 shadow-2xl sortable-chosen' : ''}
      `}
    >
      <Card 
        onClick={handleCardClick}
        className="p-5 hover:shadow-xl transition-all duration-300 border border-border/30 hover:border-border/60 bg-background/80 backdrop-blur-sm hover:bg-background/95 group cursor-pointer rounded-xl shadow-sm hover:shadow-lg"
      >
        {/* Header with actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-7 w-7 shadow-sm">
              <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                {creator?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate font-medium">
              {creator?.name || 'Usuário'}
            </span>
          </div>
          
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  data-no-card-click="true"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-secondary/50 z-10 relative"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border/50 shadow-lg">
                <DropdownMenuItem onClick={handleEditClick} className="hover:bg-secondary/50 transition-colors duration-200">
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteClick}
                  className="text-destructive hover:bg-destructive/10 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground line-clamp-2 text-base leading-tight tracking-tight card-title">
            {card.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed card-description">
            {card.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            {/* Vote button */}
            <motion.button
              onClick={handleVoteClick}
              data-no-card-click="true"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md transition-all duration-200 font-medium border shadow-sm z-10 relative
                ${userHasVoted 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary/20'
                  : 'bg-secondary/30 text-secondary-foreground hover:bg-secondary/40 border-border/30'
                }
              `}
            >
              <Heart 
                className={`h-2.5 w-2.5 ${userHasVoted ? 'fill-current' : ''}`} 
              />
              <span className="font-medium text-xs">{card.votes.length}</span>
            </motion.button>

            {/* Comments count */}
            <div className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md border bg-secondary/30 text-secondary-foreground border-border/30 shadow-sm">
              <MessageCircle className="h-2.5 w-2.5" />
              <span className="font-medium text-xs">{card.comments.length}</span>
            </div>
          </div>

          {/* Created time */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-2.5 w-2.5" />
            <span className="font-medium text-xs">
              {formatDistanceToNow(card.createdAt, { 
                addSuffix: true, 
                locale 
              })}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

KanbanCard.displayName = 'KanbanCard';