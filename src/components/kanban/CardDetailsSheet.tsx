import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTheme } from '@/hooks/useTheme';
import {
  Heart,
  MessageCircle,
  User,
  Calendar,
  Edit,
  Send,
  MoreVertical,
  X,
  Trash2,
} from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Card, Comment } from '@/types/kanban';
import { useKanbanStore, useCurrentUser } from '@/store/kanban';
import { getUserById } from '@/lib/mock-data';

interface CardDetailsSheetProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (card: Card) => void;
  onVote?: (card: Card) => void;
}

export function CardDetailsSheet({ 
  card, 
  isOpen, 
  onClose, 
  onEdit,
  onVote 
}: CardDetailsSheetProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  
  const currentUser = useCurrentUser();
  const { getUserVoteForCard, addComment, updateComment, removeComment } = useKanbanStore();

  if (!card) return null;

  const creator = getUserById(card.createdBy);
  const userHasVoted = currentUser ? getUserVoteForCard(card.id, currentUser.id) : false;
  const canEdit = currentUser?.id === card.createdBy;
  const locale = i18n.language === 'pt-BR' ? ptBR : enUS;

  const handleVote = () => {
    onVote?.(card);
  };

  const handleEdit = () => {
    onEdit?.(card);
    onClose();
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      cardId: card.id,
      body: newComment.trim(),
      createdBy: currentUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: currentUser,
    };

    addComment(comment);
    setNewComment('');
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditCommentText(comment.body);
  };

  const handleSaveEditComment = (commentId: string) => {
    if (!editCommentText.trim()) return;
    
    updateComment(commentId, {
      body: editCommentText.trim(),
      updatedAt: new Date(),
    });
    
    setEditingComment(null);
    setEditCommentText('');
  };

  const handleCancelEditComment = () => {
    setEditingComment(null);
    setEditCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm(t('comment.confirmDeleteComment'))) return;
    removeComment(commentId);
  };

  const sortedComments = [...card.comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[90%] md:w-[500px] lg:w-[550px] bg-background border-border/30 shadow-lg p-0 overflow-hidden flex flex-col">
        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30 p-4 pb-3 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-3">
              <SheetTitle className="text-xl font-bold leading-tight text-foreground tracking-tight text-left pr-6">
                {card.title}
              </SheetTitle>
              
              {/* Meta Information */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 shadow-sm ring-1 ring-border/20">
                    <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                      {creator?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      {creator?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(card.createdAt, { addSuffix: true, locale })}
                    </span>
                  </div>
                </div>
                
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="ml-auto border-border/30 hover:bg-secondary/30 transition-all duration-200 h-7 px-2 text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    {t('common.edit')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ contain: 'layout style' }}>
          <div className="p-4 space-y-6">
            {/* Description Card */}
            <div className="bg-secondary/10 border border-border/20 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                Descrição
              </h4>
              <p className="text-foreground leading-relaxed text-sm">
                {card.description}
              </p>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-3 p-3 bg-secondary/5 border border-border/20 rounded-lg">
              <motion.button
                onClick={handleVote}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium border shadow-sm
                  ${userHasVoted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary/20'
                    : 'bg-background text-foreground hover:bg-secondary/30 border-border/30'
                  }
                `}
              >
                <Heart className={`h-3 w-3 ${userHasVoted ? 'fill-current' : ''}`} />
                <span className="font-semibold">{card.votes.length}</span>
                <span className="text-xs">
                  {userHasVoted ? t('card.unvote') : t('card.vote')}
                </span>
              </motion.button>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/20 text-muted-foreground border border-border/20 text-xs">
                <MessageCircle className="h-3 w-3" />
                <span className="font-medium">{card.comments.length}</span>
                <span className="text-xs">{t('card.comments')}</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-border/30 bg-secondary/5">
            <div className="p-4 space-y-4 sheet-comments-container">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  {t('card.comments')}
                </h3>
                <div className="h-4 w-px bg-border/30"></div>
                <span className="text-xs font-medium text-muted-foreground">
                  {card.comments.length} {card.comments.length === 1 ? 'comentário' : 'comentários'}
                </span>
              </div>

              {/* Add new comment */}
              {currentUser && (
                <div className="bg-background border border-border/20 rounded-lg p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 shadow-sm ring-1 ring-border/20">
                      <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">
                        {currentUser.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Adicionar comentário
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      placeholder={t('comment.commentPlaceholder')}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none bg-background border-border/30 text-foreground placeholder:text-muted-foreground rounded-md transition-all duration-200 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 text-sm"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {newComment.length}/500 caracteres
                      </span>
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-50 h-7 px-2 text-xs"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        {t('comment.addComment')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments list */}
              <div className="space-y-4">
                {sortedComments.length > 0 ? (
                    sortedComments.map((comment) => {
                      const commentUser = getUserById(comment.createdBy);
                      const canEditComment = currentUser?.id === comment.createdBy;
                      const isEditing = editingComment === comment.id;

                      return (
                        <div
                          key={comment.id}
                          className="group bg-background border border-border/20 rounded-lg p-3 hover:border-border/30 transition-all duration-200"
                        >
                          <div className="flex gap-3">
                            <Avatar className="h-6 w-6 shadow-sm ring-1 ring-border/20 flex-shrink-0">
                              <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                                {commentUser?.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-foreground">
                                    {commentUser?.name}
                                  </span>
                                  <div className="h-1 w-1 rounded-full bg-muted-foreground/50"></div>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(comment.createdAt, { 
                                      addSuffix: true, 
                                      locale 
                                    })}
                                  </span>
                                  {comment.updatedAt > comment.createdAt && (
                                    <Badge variant="secondary" className="text-xs bg-secondary/50 text-secondary-foreground border-border/50">
                                      {t('card.updatedAt')}
                                    </Badge>
                                  )}
                                </div>
                            
                                {canEditComment && !isEditing && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-secondary/30 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-popover border-border/50 shadow-lg">
                                      <DropdownMenuItem 
                                        onClick={() => handleEditComment(comment)}
                                        className="hover:bg-secondary/50 transition-colors duration-200"
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        {t('comment.editComment')}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-destructive hover:bg-destructive/10 transition-colors duration-200"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {t('comment.deleteComment')}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                              
                              {isEditing ? (
                                <div className="space-y-3 bg-secondary/20 border border-border/30 rounded-lg p-3">
                                  <Textarea
                                    value={editCommentText}
                                    onChange={(e) => setEditCommentText(e.target.value)}
                                    className="min-h-[80px] resize-none bg-background border-border/50 text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                                  />
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">
                                      {editCommentText.length}/500 caracteres
                                    </span>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleSaveEditComment(comment.id)}
                                        size="sm"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                      >
                                        {t('common.save')}
                                      </Button>
                                      <Button
                                        onClick={handleCancelEditComment}
                                        variant="ghost"
                                        size="sm"
                                        className="hover:bg-secondary/50"
                                      >
                                        {t('common.cancel')}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-secondary/10 border border-border/20 rounded-md p-3">
                                  <p className="text-sm text-foreground leading-relaxed">
                                    {comment.body}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      className="text-center py-12 bg-secondary/10 border border-border/20 rounded-xl"
                    >
                      <div className="bg-secondary/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <MessageCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-base font-medium mb-2 text-foreground">
                        {t('comment.noComments')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('comment.beFirst')}
                      </p>
                    </div>
                  )}  
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}