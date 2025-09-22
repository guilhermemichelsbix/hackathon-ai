import { Router } from 'express';
import { CommentController } from '@/controllers/commentController';
import { validate, validateParams } from '@/utils/validation';
import { 
  createCommentSchema, 
  updateCommentSchema,
  idParamSchema 
} from '@/utils/validation';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const commentController = new CommentController();

/**
 * @swagger
 * /cards/{id}/comments:
 *   post:
 *     summary: Adicionar comentário a um card
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID do card
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *             properties:
 *               body:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Comentário adicionado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Card não encontrado
 */
router.post('/:id/comments', authenticateToken, validateParams(idParamSchema), validate(createCommentSchema), commentController.createComment);

/**
 * @swagger
 * /cards/{id}/comments:
 *   get:
 *     summary: Listar comentários de um card
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID do card
 *     responses:
 *       200:
 *         description: Lista de comentários
 *       404:
 *         description: Card não encontrado
 */
router.get('/:id/comments', validateParams(idParamSchema), commentController.getCommentsByCard);

/**
 * @swagger
 * /cards/{id}/comments/count:
 *   get:
 *     summary: Obter contagem de comentários de um card
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID do card
 *     responses:
 *       200:
 *         description: Contagem de comentários
 *       404:
 *         description: Card não encontrado
 */
router.get('/:id/comments/count', validateParams(idParamSchema), commentController.getCommentCountByCard);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Obter comentário por ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID do comentário
 *     responses:
 *       200:
 *         description: Dados do comentário
 *       404:
 *         description: Comentário não encontrado
 */
router.get('/comments/:id', validateParams(idParamSchema), commentController.getCommentById);

/**
 * @swagger
 * /comments/{id}:
 *   patch:
 *     summary: Atualizar comentário
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID do comentário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *             properties:
 *               body:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Comentário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Apenas o autor pode editar
 *       404:
 *         description: Comentário não encontrado
 */
router.patch('/comments/:id', authenticateToken, validateParams(idParamSchema), validate(updateCommentSchema), commentController.updateComment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Excluir comentário
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID do comentário
 *     responses:
 *       200:
 *         description: Comentário excluído com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Apenas o autor pode excluir
 *       404:
 *         description: Comentário não encontrado
 */
router.delete('/comments/:id', authenticateToken, validateParams(idParamSchema), commentController.deleteComment);

export default router;
