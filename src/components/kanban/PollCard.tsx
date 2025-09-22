import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import {
  BarChart3,
  Users,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Poll, PollOption, PollVote } from '@/types/kanban';
import { useCurrentUser } from '@/store/kanban';

interface PollCardProps {
  poll: Poll;
  onVote?: (pollId: string, optionIds: string[]) => void;
  onEdit?: (poll: Poll) => void;
  onDelete?: (pollId: string) => void;
}

export function PollCard({ poll, onVote, onEdit, onDelete }: PollCardProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const currentUser = useCurrentUser();
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const isOwner = currentUser?.id === poll.createdBy;
  const canVote = !isOwner && currentUser;
  
  // Check if user has already voted based on poll data
  const hasVoted = currentUser ? poll.options.some(option => 
    option.votes.some(vote => vote.userId === currentUser.id)
  ) : false;
  
  const totalVotes = poll.options.reduce((sum, option) => sum + (option.voteCount || option.votes.length), 0);
  const maxVotes = Math.max(...poll.options.map(opt => opt.voteCount || opt.votes.length));

  const handleOptionSelect = (optionId: string) => {
    if (!canVote || hasVoted) return;

    if (poll.allowMultiple) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = () => {
    if (selectedOptions.length === 0 || !canVote || hasVoted) return;
    
    onVote?.(poll.id, selectedOptions);
    setSelectedOptions([]);
  };

  const getVotePercentage = (optionVotes: number) => {
    return totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
  };

  const hasUserVoted = (optionId: string) => {
    return poll.options.some(option => 
      option.id === optionId && 
      option.votes.some(vote => vote.userId === currentUser?.id)
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/30 rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">{t('poll.title')}</h3>
        </div>
        
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(poll)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('poll.editPoll')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(poll.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('poll.deletePoll')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Question */}
      <div className="space-y-2">
        <p className="font-medium text-foreground">{poll.question}</p>
        
        <div className="flex items-center gap-2">
          {poll.allowMultiple && (
            <Badge variant="secondary" className="text-xs">
              <CheckSquare className="h-3 w-3 mr-1" />
              {t('poll.multipleChoice')}
            </Badge>
          )}
          {poll.isSecret && (
            <Badge variant="secondary" className="text-xs">
              <EyeOff className="h-3 w-3 mr-1" />
              {t('poll.secretVote')}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {totalVotes} {t('poll.votes')}
          </Badge>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {poll.options.map((option) => {
          const voteCount = option.voteCount || option.votes.length;
          const percentage = getVotePercentage(voteCount);
          const userVotedForThis = hasUserVoted(option.id);
          const showResults = !poll.isSecret || isOwner || hasVoted;

          return (
            <div
              key={option.id}
              className={`
                relative rounded-lg border transition-all duration-200 cursor-pointer
                ${canVote && !hasVoted 
                  ? 'hover:border-primary/50 hover:bg-primary/5' 
                  : 'cursor-default'
                }
                ${userVotedForThis 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border/30'
                }
              `}
              onClick={() => handleOptionSelect(option.id)}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {canVote && !hasVoted ? (
                      poll.allowMultiple ? (
                        <Square className={`h-4 w-4 ${
                          selectedOptions.includes(option.id) 
                            ? 'text-primary' 
                            : 'text-muted-foreground'
                        }`} />
                      ) : (
                        <div className={`h-4 w-4 rounded-full border-2 ${
                          selectedOptions.includes(option.id) 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`} />
                      )
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {option.text}
                    </span>
                  </div>
                  
                  {showResults && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {voteCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  )}
                </div>
                
                {showResults && (
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vote Button */}
      {canVote && !hasVoted && (
        <div className="flex justify-end">
          <Button
            onClick={handleVote}
            disabled={selectedOptions.length === 0}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {t('poll.vote')}
          </Button>
        </div>
      )}

      {/* Results Summary */}
      {(!poll.isSecret || isOwner || hasVoted) && totalVotes > 0 && (
        <div className="pt-2 border-t border-border/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('poll.totalVotes')}: {totalVotes}</span>
            <span>
              {poll.options.find(opt => (opt.voteCount || opt.votes.length) === maxVotes)?.text}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
