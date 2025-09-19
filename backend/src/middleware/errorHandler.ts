import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/types';
import { logger } from '@/utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error:', error);

  // Default error
  let statusCode = 500;
  let message = 'Erro interno do servidor';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dados inválidos';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Não autorizado';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Acesso negado';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Recurso não encontrado';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.path,
  });
};
