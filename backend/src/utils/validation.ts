import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  locale: z.enum(['pt-BR', 'en']).optional().default('pt-BR'),
});

// Card schemas
export const createCardSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  description: z.string().min(1, 'Descrição é obrigatória').max(2000, 'Descrição muito longa'),
  columnId: z.string().cuid('ID da coluna inválido'),
});

export const updateCardSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo').optional(),
  description: z.string().min(1, 'Descrição é obrigatória').max(2000, 'Descrição muito longa').optional(),
});

export const moveCardSchema = z.object({
  toColumnId: z.string().cuid('ID da coluna de destino inválido'),
  position: z.number().int('Posição deve ser um número inteiro').min(0, 'Posição deve ser maior ou igual a 0'),
});

// Column schemas
export const createColumnSchema = z.object({
  name: z.string().min(1, 'Nome da coluna é obrigatório').max(100, 'Nome da coluna muito longo'),
  position: z.number().int('Posição deve ser um número inteiro').min(0, 'Posição deve ser maior ou igual a 0').optional(),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1, 'Nome da coluna é obrigatório').max(100, 'Nome da coluna muito longo').optional(),
  position: z.number().int('Posição deve ser um número inteiro').min(0, 'Posição deve ser maior ou igual a 0').optional(),
});

export const reorderColumnsSchema = z.object({
  columns: z.array(z.object({
    id: z.string().cuid('ID da coluna inválido'),
    position: z.number().int('Posição deve ser um número inteiro').min(0, 'Posição deve ser maior ou igual a 0'),
  })).min(1, 'Pelo menos uma coluna deve ser fornecida'),
});

// Comment schemas
export const createCommentSchema = z.object({
  body: z.string().min(1, 'Comentário é obrigatório').max(1000, 'Comentário muito longo'),
});

export const updateCommentSchema = z.object({
  body: z.string().min(1, 'Comentário é obrigatório').max(1000, 'Comentário muito longo'),
});

// Query schemas
export const cardFiltersSchema = z.object({
  query: z.string().optional(),
  creator: z.string().cuid().optional(),
  columnId: z.string().cuid().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit deve estar entre 1 e 100').optional().default('50'),
  offset: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 0, 'Offset deve ser maior ou igual a 0').optional().default('0'),
});

// ID parameter schema
export const idParamSchema = z.object({
  id: z.string().cuid('ID inválido'),
});

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Query validation middleware factory
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.parse(req.query);
      req.query = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Params validation middleware factory
export const validateParams = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.parse(req.params);
      req.params = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Parameter validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
