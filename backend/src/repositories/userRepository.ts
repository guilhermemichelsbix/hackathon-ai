import { prisma } from '@/utils/database';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  async findMany(options?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<User[]> {
    const { limit = 50, offset = 0, search } = options || {};

    return prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        locale: true,
        createdAt: true,
      },
    });
  }

  async count(options?: { search?: string }): Promise<number> {
    const { search } = options || {};

    return prisma.user.count({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
    });
  }
}
