import { Router } from 'express';
import { ColumnController } from '@/controllers/columnController';
import { validate, validateParams } from '@/utils/validation';
import { 
  createColumnSchema, 
  updateColumnSchema, 
  reorderColumnsSchema,
  idParamSchema 
} from '@/utils/validation';

const router = Router();
const columnController = new ColumnController();

/**
 * @swagger
 * /columns:
 *   get:
 *     summary: Listar todas as colunas
 *     tags: [Columns]
 *     responses:
 *       200:
 *         description: Lista de colunas com seus cards
 */
router.get('/', columnController.getColumns);

/**
 * @swagger
 * /columns:
 *   post:
 *     summary: Criar nova coluna
 *     tags: [Columns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               position:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Coluna criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', validate(createColumnSchema), columnController.createColumn);

/**
 * @swagger
 * /columns/reorder:
 *   patch:
 *     summary: Reordenar colunas
 *     tags: [Columns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - columns
 *             properties:
 *               columns:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - position
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: cuid
 *                     position:
 *                       type: integer
 *                       minimum: 0
 *     responses:
 *       200:
 *         description: Colunas reordenadas com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.patch('/reorder', validate(reorderColumnsSchema), columnController.reorderColumns);

/**
 * @swagger
 * /columns/{id}:
 *   get:
 *     summary: Obter coluna por ID
 *     tags: [Columns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *     responses:
 *       200:
 *         description: Dados da coluna
 *       404:
 *         description: Coluna não encontrada
 */
router.get('/:id', validateParams(idParamSchema), columnController.getColumnById);

/**
 * @swagger
 * /columns/{id}:
 *   patch:
 *     summary: Atualizar coluna
 *     tags: [Columns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               position:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Coluna atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Coluna não encontrada
 */
router.patch('/:id', validateParams(idParamSchema), validate(updateColumnSchema), columnController.updateColumn);

/**
 * @swagger
 * /columns/{id}:
 *   delete:
 *     summary: Excluir coluna
 *     tags: [Columns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *     responses:
 *       200:
 *         description: Coluna excluída com sucesso
 *       400:
 *         description: Coluna contém cards
 *       404:
 *         description: Coluna não encontrada
 */
router.delete('/:id', validateParams(idParamSchema), columnController.deleteColumn);

export default router;
