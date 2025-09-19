import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sseManager } from '@/utils/sseManager';
import { optionalAuth } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Conectar ao stream de eventos em tempo real
 *     tags: [Real-time]
 *     parameters:
 *       - in: query
 *         name: lastEventId
 *         schema:
 *           type: string
 *         description: ID do último evento recebido (para reconexão)
 *     responses:
 *       200:
 *         description: Conexão SSE estabelecida
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: Stream de eventos Server-Sent Events
 */
router.get('/', optionalAuth, (req: Request, res: Response) => {
  try {
    const clientId = uuidv4();
    const lastEventId = req.query.lastEventId as string;

    logger.info(`SSE connection request from client: ${clientId}, lastEventId: ${lastEventId}`);

    // Add client to SSE manager
    sseManager.addClient(clientId, res, lastEventId);

    // Keep connection alive with periodic heartbeat
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch (error) {
        logger.error(`Heartbeat error for client ${clientId}:`, error);
        clearInterval(heartbeat);
        sseManager.removeClient(clientId);
      }
    }, 30000); // Send heartbeat every 30 seconds

    // Clean up on disconnect
    res.on('close', () => {
      clearInterval(heartbeat);
      sseManager.removeClient(clientId);
    });

    res.on('error', (error) => {
      logger.error(`SSE connection error for client ${clientId}:`, error);
      clearInterval(heartbeat);
      sseManager.removeClient(clientId);
    });

  } catch (error) {
    logger.error('SSE connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao estabelecer conexão SSE',
    });
  }
});

/**
 * @swagger
 * /events/stats:
 *   get:
 *     summary: Obter estatísticas de conexões SSE
 *     tags: [Real-time]
 *     responses:
 *       200:
 *         description: Estatísticas das conexões
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = {
      connectedClients: sseManager.getClientCount(),
      clientIds: sseManager.getClients(),
      timestamp: new Date(),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting SSE stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas',
    });
  }
});

export default router;
