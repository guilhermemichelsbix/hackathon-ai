import { Router } from 'express';
import { CardController } from '@/controllers/cardController';
import { validate, validateQuery, validateParams } from '@/utils/validation';
import { 
  createCardSchema, 
  updateCardSchema, 
  moveCardSchema, 
  cardFiltersSchema,
  idParamSchema 
} from '@/utils/validation';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const cardController = new CardController();

/**
 * @swagger
 * /cards:
 *   get:
 *     summary: Listar cards com filtros
 *     tags: [Cards]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Buscar por título, descrição ou criador
 *       - in: query
 *         name: creator
 *         schema:
 *           type: string
 *         description: Filtrar por criador
 *       - in: query
 *         name: columnId
 *         schema:
 *           type: string
 *         description: Filtrar por coluna
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: Lista de cards
 */
router.get('/', validateQuery(cardFiltersSchema), cardController.getCards);

/**
 * @swagger
 * /cards:
 *   post:
 *     summary: Criar novo card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - columnId
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *               columnId:
 *                 type: string
 *                 format: cuid
 *     responses:
 *       201:
 *         description: Card criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Coluna não encontrada
 */
router.post('/', authenticateToken, validate(createCardSchema), cardController.createCard);

/**
 * @swagger
 * /cards/{id}:
 *   get:
 *     summary: Obter card por ID
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *     responses:
 *       200:
 *         description: Dados do card
 *       404:
 *         description: Card não encontrado
 */
router.get('/:id', validateParams(idParamSchema), cardController.getCardById);

/**
 * @swagger
 * /cards/{id}:
 *   patch:
 *     summary: Atualizar card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
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
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *     responses:
 *       200:
 *         description: Card atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Apenas o criador pode editar
 *       404:
 *         description: Card não encontrado
 */
router.patch('/:id', authenticateToken, validateParams(idParamSchema), validate(updateCardSchema), cardController.updateCard);

/**
 * @swagger
 * /cards/{id}:
 *   delete:
 *     summary: Excluir card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *     responses:
 *       200:
 *         description: Card excluído com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Apenas o criador pode excluir
 *       404:
 *         description: Card não encontrado
 */
router.delete('/:id', authenticateToken, validateParams(idParamSchema), cardController.deleteCard);

/**
 * @swagger
 * /cards/{id}/move:
 *   patch:
 *     summary: Mover card entre colunas
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
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
 *             required:
 *               - toColumnId
 *               - position
 *             properties:
 *               toColumnId:
 *                 type: string
 *                 format: cuid
 *               position:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Card movido com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Card ou coluna não encontrados
 */
router.patch('/:id/move', authenticateToken, validateParams(idParamSchema), validate(moveCardSchema), cardController.moveCard);

/**
 * @swagger
 * /cards/column/{columnId}:
 *   get:
 *     summary: Obter cards de uma coluna
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *           format: cuid
 *     responses:
 *       200:
 *         description: Lista de cards da coluna
 *       404:
 *         description: Coluna não encontrada
 */
router.get('/column/:columnId', validateParams(idParamSchema), cardController.getCardsByColumn);

export default router;
