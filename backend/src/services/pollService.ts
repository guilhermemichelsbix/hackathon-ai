import { pollRepository } from '../repositories/pollRepository';
import { cardRepository } from '../repositories/cardRepository';
import { sseManager } from '../utils/sseManager';
import { NotFoundError, ForbiddenError, ValidationError } from '../types';
import type { CreatePollRequest, UpdatePollRequest } from '../types';

export class PollService {
  async createPoll(data: CreatePollRequest, userId: string) {
    // Verify user owns the card
    const card = await cardRepository.findById(data.cardId);
    if (!card) {
      throw new NotFoundError('Card not found');
    }

    if (card.createdBy !== userId) {
      throw new ForbiddenError('Only card creator can add polls');
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

    const poll = await pollRepository.create({
      ...data,
      createdBy: userId,
    });

    // Calculate vote counts and percentages
    const enrichedPoll = this.enrichPollData(poll);

    // Broadcast real-time event
    sseManager.broadcast({
      type: 'poll.created',
      payload: enrichedPoll,
    });

    return enrichedPoll;
  }

  async getPollById(id: string, userId?: string) {
    const poll = await pollRepository.findById(id);
    if (!poll) {
      throw new NotFoundError('Poll not found');
    }

    return this.enrichPollData(poll, userId);
  }

  async getPollsByCardId(cardId: string, userId?: string) {
    const polls = await pollRepository.findByCardId(cardId);
    return polls.map(poll => this.enrichPollData(poll, userId));
  }

  async updatePoll(id: string, data: UpdatePollRequest, userId: string) {
    const existingPoll = await pollRepository.findById(id);
    if (!existingPoll) {
      throw new NotFoundError('Poll not found');
    }

    if (existingPoll.createdBy !== userId) {
      throw new ForbiddenError('Only poll creator can update poll');
    }

    const updatedPoll = await pollRepository.update(id, data);
    const enrichedPoll = this.enrichPollData(updatedPoll);

    // Broadcast real-time event
    sseManager.broadcast({
      type: 'poll.updated',
      payload: enrichedPoll,
    });

    return enrichedPoll;
  }

  async deletePoll(id: string, userId: string) {
    const poll = await pollRepository.findById(id);
    if (!poll) {
      throw new NotFoundError('Poll not found');
    }

    if (poll.createdBy !== userId) {
      throw new ForbiddenError('Only poll creator can delete poll');
    }

    await pollRepository.delete(id);

    // Broadcast real-time event
    sseManager.broadcast({
      type: 'poll.deleted',
      payload: { pollId: id, cardId: poll.cardId },
    });

    return { success: true };
  }

  async votePoll(pollId: string, optionIds: string[], userId: string) {
    const poll = await pollRepository.findById(pollId);
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

    const votes = await pollRepository.vote(pollId, userId, optionIds);

    // Get updated poll data
    const updatedPoll = await pollRepository.findById(pollId);
    const enrichedPoll = this.enrichPollData(updatedPoll!);

    // Broadcast real-time event
    sseManager.broadcast({
      type: 'poll.voted',
      payload: { 
        pollId, 
        cardId: poll.cardId, 
        votes: poll.isSecret ? [] : votes 
      },
    });

    return enrichedPoll;
  }

  async removeVote(pollId: string, optionId: string, userId: string) {
    const poll = await pollRepository.findById(pollId);
    if (!poll) {
      throw new NotFoundError('Poll not found');
    }

    if (!poll.isActive) {
      throw new ValidationError('Poll is no longer active');
    }

    await pollRepository.removeVote(pollId, userId, optionId);

    // Get updated poll data
    const updatedPoll = await pollRepository.findById(pollId);
    const enrichedPoll = this.enrichPollData(updatedPoll!);

    // Broadcast real-time event
    sseManager.broadcast({
      type: 'poll.voted',
      payload: { 
        pollId, 
        cardId: poll.cardId, 
        votes: [] 
      },
    });

    return enrichedPoll;
  }

  async getUserVotes(pollId: string, userId: string) {
    return await pollRepository.getUserVotes(pollId, userId);
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
