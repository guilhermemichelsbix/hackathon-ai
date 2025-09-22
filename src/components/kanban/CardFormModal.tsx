import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import { Plus, Edit3 } from 'lucide-react';

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
import { kanbanService } from '@/services/kanbanService';

const cardFormSchema = z.object({
  title: z.string().min(1, 'card.titleRequired').max(100, 'card.titleTooLong'),
  description: z.string().min(1, 'card.descriptionRequired').max(1000, 'card.descriptionTooLong'),
  columnId: z.string().min(1, 'column.selectColumn'),
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
  const { board, loadBoard } = useKanbanStore();
  
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
      if (isEditing && card) {
        // Update existing card
        await kanbanService.updateCard(card.id, {
          title: data.title,
          description: data.description,
        });
        
        toast.success(t('card.updateSuccess'));
      } else {
        // Create new card
        await kanbanService.createCard({
          title: data.title,
          description: data.description,
          columnId: data.columnId,
        });
        
        toast.success(t('card.createSuccess'));
      }
      
      // Reload board to get updated data
      await loadBoard();
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
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              {isEditing ? (
                <Edit3 className="h-5 w-5 text-primary" />
              ) : (
                <Plus className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
                {isEditing ? t('card.editCard') : t('kanban.newIdea')}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isEditing ? t('card.editSubtitle') : t('card.createSubtitle')}
              </p>
            </div>
          </div>
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
                      placeholder={t('card.titlePlaceholder')}
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
                      placeholder={t('card.descriptionPlaceholder')}
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
                    <FormLabel>{t('column.columnName')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/50 focus:bg-background focus:border-border transition-all duration-200">
                          <SelectValue placeholder={t('column.selectColumn')} />
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
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-t-transparent rounded-full mr-2 border-primary-foreground"
                    />
                    {t('common.loading')}
                  </div>
                ) : (
                  isEditing ? t('common.update') : t('common.create')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}