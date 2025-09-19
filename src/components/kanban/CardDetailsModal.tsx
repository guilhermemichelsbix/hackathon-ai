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

interface CardDetailsModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (card: Card) => void;
  onVote?: (card: Card) => void;
}

export function CardDetailsModal({ 
  card, 
  isOpen, 
  onClose, 
  onEdit,
  onVote 
}: CardDetailsModalProps) {
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
      <SheetContent side="right" className="w-full sm:max-w-xl bg-card border-border/50 shadow-2xl overflow-y-auto">
        <SheetHeader className="space-y-4 pr-8">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <SheetTitle className="text-2xl font-bold leading-tight text-foreground tracking-tight text-left">
                {card.title}
              </SheetTitle>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 shadow-sm">
                  <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                    {creator?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium">
                    {creator?.name}
                  </span>
                  <span className="text-xs text-muted-foreground/60">•</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(card.createdAt, { addSuffix: true, locale })}
                  </span>
                </div>
              </div>
            </div>
            
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="mt-1 border-border/50 hover:bg-secondary/50 transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                {t('common.edit')}
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-8 px-6 pb-6">
          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Descrição</h4>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {card.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleVote}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 font-medium border shadow-sm
                ${userHasVoted 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary/20'
                  : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary border-border/50'
                }
              `}
            >
              <Heart className={`h-4 w-4 ${userHasVoted ? 'fill-current' : ''}`} />
              <span className="font-semibold">{card.votes.length}</span>
              <span className="text-sm">
                {userHasVoted ? t('card.unvote') : t('card.vote')}
              </span>
            </motion.button>

            <div className="flex items-center gap-3 px-4 py-3 rounded-full border bg-secondary/50 text-secondary-foreground border-border/50 shadow-sm">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-semibold">{card.comments.length} {t('card.comments')}</span>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Comments Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              {t('card.comments')}
            </h3>

            {/* Add new comment */}
            {currentUser && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className={`text-xs ${
                      theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                    }`}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder={t('comment.commentPlaceholder')}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className={`min-h-[80px] resize-none ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                          : 'bg-white border-gray-300 text-black placeholder:text-gray-500'
                      }`}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        size="sm"
                        className={`${
                          theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                        }`}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {t('comment.addComment')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments list */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {sortedComments.length > 0 ? (
                  sortedComments.map((comment) => {
                    const commentUser = getUserById(comment.createdBy);
                    const canEditComment = currentUser?.id === comment.createdBy;
                    const isEditing = editingComment === comment.id;

                    return (
                      <motion.div
                        key={comment.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex gap-3"
                      >
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className={`text-xs ${
                            theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                          }`}>
                            {commentUser?.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-primary">
                                {commentUser?.name}
                              </span>
                              <span className="text-xs text-muted">
                                {formatDistanceToNow(comment.createdAt, { 
                                  addSuffix: true, 
                                  locale 
                                })}
                              </span>
                              {comment.updatedAt > comment.createdAt && (
                                <Badge variant="secondary" className={`text-xs ${
                                  theme === 'dark' 
                                    ? 'bg-gray-800 text-white border-gray-600' 
                                    : 'bg-gray-100 text-black border-gray-300'
                                }`}>
                                  {t('card.updatedAt')}
                                </Badge>
                              )}
                            </div>
                            
                            {canEditComment && !isEditing && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => handleEditComment(comment)}
                                  >
                                    {t('comment.editComment')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    {t('comment.deleteComment')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          
                          {isEditing ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                className={`min-h-[60px] resize-none ${
                                  theme === 'dark'
                                    ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                                    : 'bg-white border-gray-300 text-black placeholder:text-gray-500'
                                }`}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSaveEditComment(comment.id)}
                                  size="sm"
                                  className={`${
                                    theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                                  }`}
                                >
                                  {t('common.save')}
                                </Button>
                                <Button
                                  onClick={handleCancelEditComment}
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  {t('common.cancel')}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-secondary leading-relaxed">
                              {comment.body}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <MessageCircle className={`h-12 w-12 mx-auto mb-3 ${
                      theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm mb-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {t('comment.noComments')}
                    </p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {t('comment.beFirst')}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}