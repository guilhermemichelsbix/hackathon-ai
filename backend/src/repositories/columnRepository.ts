import { prisma } from '@/utils/database';
import { Column, Prisma } from '@prisma/client';

export class ColumnRepository {
  async findById(id: string): Promise<Column | null> {
    return prisma.column.findUnique({
      where: { id },
      include: {
        cards: {
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
          },
        },
      },
    });
  }

  async findAll(): Promise<Column[]> {
    return prisma.column.findMany({
      orderBy: { position: 'asc' },
      include: {
        cards: {
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
          },
        },
      },
    });
  }

  async create(data: Prisma.ColumnCreateInput): Promise<Column> {
    return prisma.column.create({
      data,
      include: {
        cards: {
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
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.ColumnUpdateInput): Promise<Column> {
    return prisma.column.update({
      where: { id },
      data,
      include: {
        cards: {
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
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Column> {
    return prisma.column.delete({
      where: { id },
    });
  }

  async reorder(columns: Array<{ id: string; position: number }>): Promise<Column[]> {
    return prisma.$transaction(async (tx) => {
      // Update each column position
      const updatePromises = columns.map(({ id, position }) =>
        tx.column.update({
          where: { id },
          data: { position },
        })
      );

      await Promise.all(updatePromises);

      // Return all columns with updated positions
      return tx.column.findMany({
        orderBy: { position: 'asc' },
        include: {
          cards: {
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
            },
          },
        },
      });
    });
  }

  async getNextPosition(): Promise<number> {
    const lastColumn = await prisma.column.findFirst({
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return lastColumn ? lastColumn.position + 1 : 0;
  }
}
