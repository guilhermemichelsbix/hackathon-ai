import { PollRepository } from '@/repositories/pollRepository';
import { CardRepository } from '@/repositories/cardRepository';
import { getSocketManager } from '@/utils/socketManager';
import { NotFoundError, ForbiddenError, ValidationError } from '../types';
import type { CreatePollRequest, UpdatePollRequest } from '../types';

export class PollService {
  private pollRepository: PollRepository;
  private cardRepository: CardRepository;

  constructor() {
    this.pollRepository = new PollRepository();
    this.cardRepository = new CardRepository();
  }

  async createPoll(data: CreatePollRequest, userId: string) {
    // Verify user owns the card
    const card = await this.cardRepository.findById(data.cardId);
    if (!card) {
      throw new NotFoundError('Card not found');
    }

    if (card.createdBy !== userId) {
      throw new ForbiddenError('Only card creator can add polls');
    }

    // Check if card already has a poll
    const existingPolls = await this.pollRepository.findByCardId(data.cardId);
    if (existingPolls.length > 0) {
      throw new ValidationError('Card already has a poll. Only one poll per card is allowed.');
    }

    // Validate options
    if (!data.options || data.options.length < 2) {
      throw new ValidationError('Poll must have at least 2 options');
    }

    if (data.options.length > 10) {
      throw new ValidationError('Poll cannot have more than 10 options');
    }

    // Validate question
    if (!data.question.trim()) {
      throw new ValidationError('Poll question is required');
    }

    const poll = await this.pollRepository.create({
      ...data,
      createdBy: userId,
    });

    // Calculate vote counts and percentages
    const enrichedPoll = this.enrichPollData(poll);

    // Broadcast real-time event
    const socketManager = getSocketManager();
    if (socketManager) {
      socketManager.broadcastPollCreated(enrichedPoll);
    }

    return enrichedPoll;
  }

  async getPollById(id: string, userId?: string) {
    const poll = await this.pollRepository.findById(id);
    if (!poll) {
      throw new NotFoundError('Poll not found');
    }

    return this.enrichPollData(poll, userId);
  }

  async getPollsByCardId(cardId: string, userId?: string) {
    const polls = await this.pollRepository.findByCardId(cardId);
    return polls.map(poll => this.enrichPollData(poll, userId));
  }

  async updatePoll(id: string, data: UpdatePollRequest, userId: string) {
    const existingPoll = await this.pollRepository.findById(id);
    if (!existingPoll) {
      throw new NotFoundError('Poll not found');
    }

    if (existingPoll.createdBy !== userId) {
      throw new ForbiddenError('Only poll creator can update poll');
    }

    // Extract only the fields that should be updated in the poll table
    const { question, allowMultiple, isSecret, isActive, endsAt } = data;
    const pollUpdateData = {
      question,
      allowMultiple,
      isSecret,
      isActive,
      endsAt,
      updatedAt: new Date(),
    };

    const updatedPoll = await this.pollRepository.update(id, pollUpdateData);
    const enrichedPoll = this.enrichPollData(updatedPoll);

    // Broadcast real-time event
    const socketManager = getSocketManager();
    if (socketManager) {
      socketManager.broadcastPollUpdated(enrichedPoll);
    }

    return enrichedPoll;
  }

  async deletePoll(id: string, userId: string) {
    const poll = await this.pollRepository.findById(id);
    if (!poll) {
      throw new NotFoundError('Poll not found');
    }

    if (poll.createdBy !== userId) {
      throw new ForbiddenError('Only poll creator can delete poll');
    }

    await this.pollRepository.delete(id);

    // Broadcast real-time event
    const socketManager = getSocketManager();
    if (socketManager) {
      socketManager.broadcastPollDeleted(id, poll.cardId);
    }

    return { success: true };
  }

  async votePoll(pollId: string, optionIds: string[], userId: string) {
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      throw new NotFoundError('Poll not found');
    }

    if (!poll.isActive) {
      throw new ValidationError('Poll is no longer active');
    }

    if (poll.endsAt && new Date() > poll.endsAt) {
      throw new ValidationError('Poll has ended');
    }

    // Validate option IDs belong to this poll
    const validOptionIds = poll.options.map(opt => opt.id);
    const invalidOptions = optionIds.filter(id => !validOptionIds.includes(id));
    if (invalidOptions.length > 0) {
      throw new ValidationError('Invalid poll options');
    }

    // Check multiple choice constraint
    if (!poll.allowMultiple && optionIds.length > 1) {
      throw new ValidationError('This poll only allows one choice');
    }

    const votes = await this.pollRepository.vote(pollId, userId, optionIds);

    // Get updated poll data
    const updatedPoll = await this.pollRepository.findById(pollId);
    const enrichedPoll = this.enrichPollData(updatedPoll!);

    // Broadcast real-time event
    const socketManager = getSocketManager();
    if (socketManager) {
      socketManager.broadcastPollVoted(pollId, optionIds[0], userId);
    }

    return enrichedPoll;
  }

  async removeVote(pollId: string, optionId: string, userId: string) {
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      throw new NotFoundError('Poll not found');
    }

    if (!poll.isActive) {
      throw new ValidationError('Poll is no longer active');
    }

    await this.pollRepository.removeVote(pollId, userId, optionId);

    // Get updated poll data
    const updatedPoll = await this.pollRepository.findById(pollId);
    const enrichedPoll = this.enrichPollData(updatedPoll!);

    // Broadcast real-time event
    const socketManager = getSocketManager();
    if (socketManager) {
      socketManager.broadcastPollVoteRemoved(pollId, optionId, userId);
    }

    return enrichedPoll;
  }

  async getUserVotes(pollId: string, userId: string) {
    return await this.pollRepository.getUserVotes(pollId, userId);
  }

  private enrichPollData(poll: any, userId?: string) {
    // Calculate vote counts and percentages
    const totalVotes = poll.votes.length;
    
    const enrichedOptions = poll.options.map((option: any) => {
      const voteCount = option.votes.length;
      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
      
      return {
        ...option,
        voteCount,
        percentage,
      };
    });

    // Filter votes for secret polls
    const votes = poll.isSecret ? [] : poll.votes;

    // Get user's votes if userId provided
    const userVotes = userId 
      ? poll.votes.filter((vote: any) => vote.userId === userId)
      : [];

    return {
      ...poll,
      options: enrichedOptions,
      votes,
      totalVotes,
      userVotes,
    };
  }
}

export const pollService = new PollService();
