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
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import type { Column } from '@/types/kanban';
import { useKanbanStore } from '@/store/kanban';

const columnFormSchema = z.object({
  name: z.string().min(1, 'Nome da coluna é obrigatório').max(50, 'Nome muito longo'),
});

type ColumnFormData = z.infer<typeof columnFormSchema>;

interface ColumnFormModalProps {
  column?: Column | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ColumnFormModal({ 
  column, 
  isOpen, 
  onClose 
}: ColumnFormModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createColumn, updateColumnData } = useKanbanStore();
  
  const isEditing = !!column;
  
  const form = useForm<ColumnFormData>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      name: '',
    },
  });

  // Reset form when modal opens/closes or column changes
  useEffect(() => {
    if (isOpen) {
      if (column) {
        // Editing existing column
        form.reset({
          name: column.name,
        });
      } else {
        // Creating new column
        form.reset({
          name: '',
        });
      }
    } else {
      form.reset();
    }
  }, [isOpen, column, form]);

  const onSubmit = async (data: ColumnFormData) => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      
      try {
        if (isEditing && column) {
          // Update existing column
          await updateColumnData(column.id, { name: data.name });
          toast.success(t('column.updateSuccess'));
        } else {
          // Create new column
          await createColumn({ name: data.name });
          toast.success(t('column.createSuccess'));
        }
        
        onClose();
      } catch (error) {
        console.error('Error saving column:', error);
        toast.error(t('column.saveError'));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border/50 shadow-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
            {isEditing ? t('column.editColumn') : t('column.addColumn')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('column.columnName')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('column.columnNamePlaceholder')}
                      {...field}
                      className="bg-background/50 border-border/50 focus:bg-background focus:border-border transition-all duration-200"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="border-border/50 hover:bg-secondary/50 transition-all duration-200"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    {t('common.save')}
                  </div>
                ) : (
                  t('common.save')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
