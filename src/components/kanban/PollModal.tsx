import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import {
  X,
  Plus,
  Trash2,
  BarChart3,
  Users,
  Eye,
  EyeOff,
  CheckSquare,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import type { Poll, PollOption, CreatePollData } from '@/types/kanban';

interface PollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (poll: CreatePollData) => void;
  poll?: Poll | null;
}

interface PollOptionInput {
  id: string;
  text: string;
}

export function PollModal({ isOpen, onClose, onSubmit, poll }: PollModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  console.log('🔍 PollModal render - poll prop:', poll);
  
  const [question, setQuestion] = useState(poll?.question || '');
  const [options, setOptions] = useState<PollOptionInput[]>(
    poll?.options?.map(opt => ({ id: opt.id, text: opt.text })) || [
      { id: '1', text: '' },
      { id: '2', text: '' },
    ]
  );
  const [multipleChoice, setMultipleChoice] = useState(poll?.allowMultiple || false);
  const [secretVote, setSecretVote] = useState(poll?.isSecret || false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when poll prop changes
  useEffect(() => {
    console.log('🔍 PollModal useEffect - poll changed:', poll);
    if (poll) {
      console.log('🔍 Setting poll data:', {
        question: poll.question,
        options: poll.options,
        allowMultiple: poll.allowMultiple,
        isSecret: poll.isSecret
      });
      setQuestion(poll.question || '');
      setOptions(
        poll.options?.map(opt => ({ id: opt.id, text: opt.text })) || [
          { id: '1', text: '' },
          { id: '2', text: '' },
        ]
      );
      setMultipleChoice(poll.allowMultiple || false);
      setSecretVote(poll.isSecret || false);
    } else {
      console.log('🔍 Resetting form for new poll');
      // Reset form for new poll
      setQuestion('');
      setOptions([
        { id: '1', text: '' },
        { id: '2', text: '' },
      ]);
      setMultipleChoice(false);
      setSecretVote(false);
    }
    setErrors({});
  }, [poll]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!question.trim()) {
      newErrors.question = t('poll.questionRequired');
    }

    const validOptions = options.filter(opt => opt.text.trim());
    if (validOptions.length < 2) {
      newErrors.options = t('poll.optionsRequired');
    }
    if (validOptions.length > 10) {
      newErrors.options = t('poll.maximumOptions');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const validOptions = options
      .filter(opt => opt.text.trim())
      .map((opt, index) => ({
        id: opt.id,
        text: opt.text.trim(),
        position: index,
      }));

    onSubmit({
      question: question.trim(),
      options: validOptions,
      allowMultiple: multipleChoice,
      isSecret: secretVote,
      isActive: true,
      endsAt: null,
      cardId: poll?.cardId || '',
    });

    handleClose();
  };

  const handleClose = () => {
    setQuestion('');
    setOptions([
      { id: '1', text: '' },
      { id: '2', text: '' },
    ]);
    setMultipleChoice(false);
    setSecretVote(false);
    setErrors({});
    onClose();
  };

  const addOption = () => {
    if (options.length < 10) {
      const newId = (options.length + 1).toString();
      setOptions([...options, { id: newId, text: '' }]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, text } : opt
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <BarChart3 className="h-5 w-5 text-primary" />
            {poll ? t('poll.editPoll') : t('poll.createPoll')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question" className="text-sm font-medium text-foreground">
              {t('poll.question')}
            </Label>
            <Textarea
              id="question"
              placeholder={t('poll.questionPlaceholder')}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className={`min-h-[80px] resize-none ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-300 text-black placeholder:text-gray-500'
              }`}
            />
            {errors.question && (
              <p className="text-sm text-destructive">{errors.question}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              {t('poll.options')}
            </Label>
            
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder={`${t('poll.optionPlaceholder')} ${index + 1}`}
                      value={option.text}
                      onChange={(e) => updateOption(option.id, e.target.value)}
                      className={`${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                          : 'bg-white border-gray-300 text-black placeholder:text-gray-500'
                      }`}
                    />
                  </div>
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(option.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={options.length >= 10}
              className="w-full border-dashed border-border/50 hover:border-border hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('poll.addOption')}
              {options.length >= 10 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({t('poll.maximumOptions')})
                </span>
              )}
            </Button>

            {errors.options && (
              <p className="text-sm text-destructive">{errors.options}</p>
            )}
          </div>

          <Separator className="bg-border/30" />

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">
              {t('poll.pollSettings')}
            </h4>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">
                  {t('poll.multipleChoice')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('poll.multipleChoiceDescription')}
                </p>
              </div>
              <Switch
                checked={multipleChoice}
                onCheckedChange={setMultipleChoice}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">
                  {t('poll.secretVote')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('poll.secretVoteDescription')}
                </p>
              </div>
              <Switch
                checked={secretVote}
                onCheckedChange={setSecretVote}
              />
            </div>
          </div>

          <Separator className="bg-border/30" />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="hover:bg-secondary/50"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {poll ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
