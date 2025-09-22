import { prisma } from '../utils/database';
import type { CreatePollRequest, UpdatePollRequest } from '../types';

export class PollRepository {
  async create(data: CreatePollRequest & { createdBy: string }) {
    const { options, ...pollData } = data;
    
    return await prisma.poll.create({
      data: {
        ...pollData,
        options: {
          create: options.map((option, index) => ({
            text: typeof option === 'string' ? option : option.text,
            position: index,
          })),
        },
      },
      include: {
        options: {
          orderBy: { position: 'asc' },
          include: {
            votes: true,
          },
        },
        votes: {
          include: {
            user: data.isSecret ? false : {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return await prisma.poll.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { position: 'asc' },
          include: {
            votes: true,
          },
        },
        votes: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  async findByCardId(cardId: string) {
    return await prisma.poll.findMany({
      where: { cardId },
      include: {
        options: {
          orderBy: { position: 'asc' },
          include: {
            votes: true,
          },
        },
        votes: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdatePollRequest) {
    return await prisma.poll.update({
      where: { id },
      data,
      include: {
        options: {
          orderBy: { position: 'asc' },
          include: {
            votes: true,
          },
        },
        votes: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  async delete(id: string) {
    return await prisma.poll.delete({
      where: { id },
    });
  }

  async vote(pollId: string, userId: string, optionIds: string[]) {
    const poll = await this.findById(pollId);
    if (!poll) throw new Error('Poll not found');

    // If not multiple choice, remove existing votes first
    if (!poll.allowMultiple) {
      await prisma.pollVote.deleteMany({
        where: {
          pollId,
          userId,
        },
      });
    }

    // Add new votes
    const votes = await Promise.all(
      optionIds.map(optionId =>
        prisma.pollVote.create({
          data: {
            pollId,
            optionId,
            userId,
          },
          include: {
            user: poll.isSecret ? false : {
              select: { id: true, name: true },
            },
          },
        })
      )
    );

    return votes;
  }

  async removeVote(pollId: string, userId: string, optionId?: string) {
    const where: any = {
      pollId,
      userId,
    };

    if (optionId) {
      where.optionId = optionId;
    }

    return await prisma.pollVote.deleteMany({
      where,
    });
  }

  async getUserVotes(pollId: string, userId: string) {
    return await prisma.pollVote.findMany({
      where: {
        pollId,
        userId,
      },
      include: {
        option: true,
      },
    });
  }
}

export const pollRepository = new PollRepository();
