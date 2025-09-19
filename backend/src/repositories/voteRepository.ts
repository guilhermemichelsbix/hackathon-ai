import { prisma } from '@/utils/database';
import { Vote, Prisma } from '@prisma/client';

export class VoteRepository {
  async findByCardAndUser(cardId: string, userId: string): Promise<Vote | null> {
    return prisma.vote.findUnique({
      where: {
        cardId_userId: {
          cardId,
          userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.VoteCreateInput): Promise<Vote> {
    return prisma.vote.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(cardId: string, userId: string): Promise<Vote> {
    return prisma.vote.delete({
      where: {
        cardId_userId: {
          cardId,
          userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findByCard(cardId: string): Promise<Vote[]> {
    return prisma.vote.findMany({
      where: { cardId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async countByCard(cardId: string): Promise<number> {
    return prisma.vote.count({
      where: { cardId },
    });
  }

  async findByUser(userId: string): Promise<Vote[]> {
    return prisma.vote.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteByCard(cardId: string): Promise<number> {
    const result = await prisma.vote.deleteMany({
      where: { cardId },
    });
    return result.count;
  }

  async deleteByUser(userId: string): Promise<number> {
    const result = await prisma.vote.deleteMany({
      where: { userId },
    });
    return result.count;
  }
}
