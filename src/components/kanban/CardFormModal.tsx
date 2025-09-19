import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import type { Card, Column } from '@/types/kanban';
import { useKanbanStore, useCurrentUser } from '@/store/kanban';
import { simulateApiDelay } from '@/lib/mock-data';

const cardFormSchema = z.object({
  title: z.string().min(1, 'titleRequired').max(100, 'Título muito longo'),
  description: z.string().min(1, 'descriptionRequired').max(1000, 'Descrição muito longa'),
  columnId: z.string().min(1, 'Coluna é obrigatória'),
});

type CardFormData = z.infer<typeof cardFormSchema>;

interface CardFormModalProps {
  card?: Card | null;
  columnId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CardFormModal({ 
  card, 
  columnId, 
  isOpen, 
  onClose 
}: CardFormModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentUser = useCurrentUser();
  const { board, addCard, updateCard } = useKanbanStore();
  
  const isEditing = !!card;
  
  const form = useForm<CardFormData>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      title: '',
      description: '',
      columnId: '',
    },
  });

  // Reset form when modal opens/closes or card changes
  useEffect(() => {
    if (isOpen) {
      if (card) {
        // Editing existing card
        form.reset({
          title: card.title,
          description: card.description,
          columnId: card.columnId,
        });
      } else {
        // Creating new card
        form.reset({
          title: '',
          description: '',
          columnId: columnId || (board.columns[0]?.id || ''),
        });
      }
    } else {
      form.reset();
    }
  }, [isOpen, card, columnId, board.columns, form]);

  const onSubmit = async (data: CardFormData) => {
    if (!currentUser) return;

    setIsSubmitting(true);
    
    try {
      await simulateApiDelay(500);
      
      if (isEditing && card) {
        // Update existing card
        updateCard(card.id, {
          title: data.title,
          description: data.description,
          updatedAt: new Date(),
        });
        
        toast.success(t('card.updateSuccess'));
      } else {
        // Create new card
        const targetColumn = board.columns.find(col => col.id === data.columnId);
        const cardsInColumn = board.cards.filter(c => c.columnId === data.columnId);
        const newPosition = cardsInColumn.length;
        
        const newCard: Card = {
          id: `card-${Date.now()}`,
          title: data.title,
          description: data.description,
          columnId: data.columnId,
          createdBy: currentUser.id,
          position: newPosition,
          votes: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        addCard(newCard);
        toast.success(t('card.createSuccess'));
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting card:', error);
      toast.error(t('error.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedColumns = [...board.columns].sort((a, b) => a.position - b.position);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border/50 shadow-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
            {isEditing ? t('card.editCard') : t('kanban.newIdea')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('card.title')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o título da sua ideia..."
                      {...field}
                      className="bg-background/50 border-border/50 focus:bg-background focus:border-border transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('card.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva sua ideia detalhadamente..."
                      className="min-h-[120px] resize-none bg-background/50 border-border/50 focus:bg-background focus:border-border transition-all duration-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Column Selection */}
            {!isEditing && (
              <FormField
                control={form.control}
                name="columnId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coluna</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/50 focus:bg-background focus:border-border transition-all duration-200">
                          <SelectValue placeholder="Selecione uma coluna" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border/50">
                        {sortedColumns.map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-primary" />
                              <span>{column.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 border-border/50 hover:bg-secondary/50 transition-all duration-200"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-t-transparent rounded-full mr-2 border-primary-foreground"
                  />
                ) : null}
                {isSubmitting 
                  ? t('common.loading')
                  : isEditing 
                    ? t('common.update')
                    : t('common.create')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}