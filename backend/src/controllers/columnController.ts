import { Request, Response, NextFunction } from 'express';
import { ColumnService } from '@/services/columnService';
import { ApiResponse } from '@/types';

export class ColumnController {
  private columnService: ColumnService;

  constructor() {
    this.columnService = new ColumnService();
  }

  createColumn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const column = await this.columnService.createColumn(req.body);
      
      const response: ApiResponse = {
        success: true,
        data: column,
        message: 'Coluna criada com sucesso',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getColumns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const columns = await this.columnService.getColumns();
      
      const response: ApiResponse = {
        success: true,
        data: columns,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getColumnById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const column = await this.columnService.getColumnById(req.params.id);
      
      const response: ApiResponse = {
        success: true,
        data: column,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateColumn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const column = await this.columnService.updateColumn(req.params.id, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: column,
        message: 'Coluna atualizada com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteColumn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.columnService.deleteColumn(req.params.id);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Coluna excluída com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  reorderColumns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const columns = await this.columnService.reorderColumns(req.body);
      
      const response: ApiResponse = {
        success: true,
        data: columns,
        message: 'Colunas reordenadas com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
