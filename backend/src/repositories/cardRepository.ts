import { prisma } from '@/utils/database';
import { Card, Prisma } from '@prisma/client';
import { CardFilters } from '@/types';

export class CardRepository {
  async findById(id: string): Promise<Card | null> {
    return prisma.card.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        polls: {
          include: {
            options: {
              orderBy: { position: 'asc' },
              include: {
                votes: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            votes: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        column: true,
      },
    });
  }

  async create(data: Prisma.CardCreateInput): Promise<Card> {
    return prisma.card.create({
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        votes: true,
        comments: true,
        polls: true,
        column: true,
      },
    });
  }

  async update(id: string, data: Prisma.CardUpdateInput): Promise<Card> {
    return prisma.card.update({
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
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        polls: {
          include: {
            options: {
              orderBy: { position: 'asc' },
              include: {
                votes: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            votes: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        column: true,
      },
    });
  }

  async delete(id: string): Promise<Card> {
    return prisma.card.delete({
      where: { id },
    });
  }

  async findMany(filters: CardFilters = {}): Promise<Card[]> {
    const { query, creator, columnId, limit = 50, offset = 0 } = filters;

    const where: Prisma.CardWhereInput = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { creator: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    if (creator) {
      where.createdBy = creator;
    }

    if (columnId) {
      where.columnId = columnId;
    }

    return prisma.card.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: [
        { column: { position: 'asc' } },
        { position: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        polls: {
          include: {
            options: {
              orderBy: { position: 'asc' },
              include: {
                votes: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            votes: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        column: true,
      },
    });
  }

  async count(filters: CardFilters = {}): Promise<number> {
    const { query, creator, columnId } = filters;

    const where: Prisma.CardWhereInput = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { creator: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    if (creator) {
      where.createdBy = creator;
    }

    if (columnId) {
      where.columnId = columnId;
    }

    return prisma.card.count({ where });
  }

  async findByColumn(columnId: string): Promise<Card[]> {
    return prisma.card.findMany({
      where: { columnId },
      orderBy: { position: 'asc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        column: true,
      },
    });
  }

  async moveCard(id: string, columnId: string, position: number): Promise<Card> {
    return prisma.$transaction(async (tx) => {
      // Get the card to move
      const card = await tx.card.findUnique({
        where: { id },
      });

      if (!card) {
        throw new Error('Card not found');
      }

      const oldColumnId = card.columnId;

      // If moving to a different column, update positions in both columns
      if (oldColumnId !== columnId) {
        // Update positions in the old column (shift cards down)
        await tx.card.updateMany({
          where: {
            columnId: oldColumnId,
            position: { gt: card.position },
          },
          data: {
            position: { decrement: 1 },
          },
        });

        // Update positions in the new column (shift cards up)
        await tx.card.updateMany({
          where: {
            columnId,
            position: { gte: position },
          },
          data: {
            position: { increment: 1 },
          },
        });
      } else {
        // Moving within the same column
        if (card.position < position) {
          // Moving down
          await tx.card.updateMany({
            where: {
              columnId,
              position: { gt: card.position, lte: position },
            },
            data: {
              position: { decrement: 1 },
            },
          });
        } else if (card.position > position) {
          // Moving up
          await tx.card.updateMany({
            where: {
              columnId,
              position: { gte: position, lt: card.position },
            },
            data: {
              position: { increment: 1 },
            },
          });
        }
      }

      // Update the card
      return tx.card.update({
        where: { id },
        data: {
          columnId,
          position,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          comments: {
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          column: true,
        },
      });
    });
  }
}
