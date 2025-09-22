import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types';
import { UserRepository } from '@/repositories/userRepository';

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, limit, offset } = req.query as { search?: string; limit?: string; offset?: string };
      const users = await this.userRepository.findMany({
        search,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });

      const response: ApiResponse = {
        success: true,
        data: users,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;


