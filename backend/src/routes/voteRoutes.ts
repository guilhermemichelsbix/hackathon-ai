import { Router } from 'express';
import { VoteController } from '@/controllers/voteController';
import { validateParams } from '@/utils/validation';
import { idParamSchema } from '@/utils/validation';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const voteController = new VoteController();

/**
 * @swagger
 * /cards/{id}/votes:
 *   post:
 *     summary: Votar em um card
 *     tags: [Votes]
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
 *     responses:
 *       201:
 *         description: Voto adicionado com sucesso
 *       400:
 *         description: Usuário já votou neste card
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Card não encontrado
 */
router.post('/:id/votes', authenticateToken, validateParams(idParamSchema), voteController.addVote);

/**
 * @swagger
 * /cards/{id}/votes:
 *   delete:
 *     summary: Remover voto de um card
 *     tags: [Votes]
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
 *     responses:
 *       200:
 *         description: Voto removido com sucesso
 *       400:
 *         description: Usuário não votou neste card
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Card não encontrado
 */
router.delete('/:id/votes', authenticateToken, validateParams(idParamSchema), voteController.removeVote);

/**
 * @swagger
 * /cards/{id}/votes:
 *   get:
 *     summary: Listar votos de um card
 *     tags: [Votes]
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
 *         description: Lista de votos
 *       404:
 *         description: Card não encontrado
 */
router.get('/:id/votes', validateParams(idParamSchema), voteController.getVotesByCard);

/**
 * @swagger
 * /cards/{id}/votes/count:
 *   get:
 *     summary: Obter contagem de votos de um card
 *     tags: [Votes]
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
 *         description: Contagem de votos
 *       404:
 *         description: Card não encontrado
 */
router.get('/:id/votes/count', validateParams(idParamSchema), voteController.getVoteCountByCard);

/**
 * @swagger
 * /cards/{id}/votes/me:
 *   get:
 *     summary: Verificar se o usuário atual votou no card
 *     tags: [Votes]
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
 *     responses:
 *       200:
 *         description: Status do voto do usuário
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Card não encontrado
 */
router.get('/:id/votes/me', authenticateToken, validateParams(idParamSchema), voteController.hasUserVoted);

export default router;
