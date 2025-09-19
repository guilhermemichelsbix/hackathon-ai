import { prisma } from '@/utils/database';
import { Comment, Prisma } from '@prisma/client';

export class CommentRepository {
  async findById(id: string): Promise<Comment | null> {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByCard(cardId: string): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: { cardId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return prisma.comment.create({
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment> {
    return prisma.comment.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Comment> {
    return prisma.comment.delete({
      where: { id },
    });
  }

  async deleteByCard(cardId: string): Promise<number> {
    const result = await prisma.comment.deleteMany({
      where: { cardId },
    });
    return result.count;
  }

  async deleteByUser(userId: string): Promise<number> {
    const result = await prisma.comment.deleteMany({
      where: { createdBy: userId },
    });
    return result.count;
  }

  async findByUser(userId: string): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: { createdBy: userId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countByCard(cardId: string): Promise<number> {
    return prisma.comment.count({
      where: { cardId },
    });
  }
}
