import { Router } from 'express';
import { PollController } from '@/controllers/pollController';
import { validateParams, validateBody } from '@/utils/validation';
import { idParamSchema } from '@/utils/validation';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const pollController = new PollController();

/**
 * @swagger
 * /polls:
 *   post:
 *     summary: Criar uma nova enquete
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - cardId
 *               - options
 *             properties:
 *               question:
 *                 type: string
 *                 description: Pergunta da enquete
 *               cardId:
 *                 type: string
 *                 description: ID do card
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de opções da enquete
 *               allowMultiple:
 *                 type: boolean
 *                 description: Permitir múltiplas escolhas
 *                 default: false
 *               isSecret:
 *                 type: boolean
 *                 description: Voto secreto
 *                 default: false
 *               endsAt:
 *                 type: string
 *                 format: date-time
 *                 description: Data de fim da enquete
 *     responses:
 *       201:
 *         description: Enquete criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Apenas o criador do card pode criar enquetes
 */
router.post('/', authenticateToken, pollController.createPoll);

/**
 * @swagger
 * /polls/{id}:
 *   get:
 *     summary: Obter enquete por ID
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID da enquete
 *     responses:
 *       200:
 *         description: Enquete encontrada
 *       404:
 *         description: Enquete não encontrada
 */
router.get('/:id', authenticateToken, validateParams(idParamSchema), pollController.getPollById);

/**
 * @swagger
 * /polls/card/{cardId}:
 *   get:
 *     summary: Obter enquetes de um card
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID do card
 *     responses:
 *       200:
 *         description: Lista de enquetes do card
 */
router.get('/card/:cardId', authenticateToken, validateParams(idParamSchema), pollController.getPollsByCardId);

/**
 * @swagger
 * /polls/{id}:
 *   patch:
 *     summary: Atualizar enquete
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID da enquete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               allowMultiple:
 *                 type: boolean
 *               isSecret:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *               endsAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Enquete atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Apenas o criador da enquete pode atualizá-la
 *       404:
 *         description: Enquete não encontrada
 */
router.patch('/:id', authenticateToken, validateParams(idParamSchema), pollController.updatePoll);

/**
 * @swagger
 * /polls/{id}:
 *   delete:
 *     summary: Deletar enquete
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID da enquete
 *     responses:
 *       200:
 *         description: Enquete deletada com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Apenas o criador da enquete pode deletá-la
 *       404:
 *         description: Enquete não encontrada
 */
router.delete('/:id', authenticateToken, validateParams(idParamSchema), pollController.deletePoll);

/**
 * @swagger
 * /polls/{id}/vote:
 *   post:
 *     summary: Votar em uma enquete
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID da enquete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - optionIds
 *             properties:
 *               optionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs das opções selecionadas
 *     responses:
 *       200:
 *         description: Voto registrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Enquete não encontrada
 */
router.post('/:id/vote', authenticateToken, validateParams(idParamSchema), pollController.votePoll);

/**
 * @swagger
 * /polls/{id}/vote/{optionId}:
 *   delete:
 *     summary: Remover voto de uma opção
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID da enquete
 *       - in: path
 *         name: optionId
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID da opção
 *     responses:
 *       200:
 *         description: Voto removido com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Enquete ou opção não encontrada
 */
router.delete('/:id/vote/:optionId', authenticateToken, validateParams(idParamSchema), pollController.removeVote);

/**
 * @swagger
 * /polls/{id}/votes:
 *   get:
 *     summary: Obter votos do usuário em uma enquete
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *         description: ID da enquete
 *     responses:
 *       200:
 *         description: Votos do usuário
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Enquete não encontrada
 */
router.get('/:id/votes', authenticateToken, validateParams(idParamSchema), pollController.getUserVotes);

export { router as pollRoutes };
