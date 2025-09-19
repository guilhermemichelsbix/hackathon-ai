import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { validate } from '@/utils/validation';
import { loginSchema, registerSchema } from '@/utils/validation';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               locale:
 *                 type: string
 *                 enum: [pt-BR, en]
 *                 default: pt-BR
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já existe
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Fazer login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 *       400:
 *         description: Dados inválidos
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar token de acesso
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *       401:
 *         description: Refresh token inválido
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obter dados do usuário atual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Não autorizado
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Fazer logout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
router.post('/logout', authController.logout);

export default router;
