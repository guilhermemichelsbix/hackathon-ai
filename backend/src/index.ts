import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from '@/routes/authRoutes';
import cardRoutes from '@/routes/cardRoutes';
import columnRoutes from '@/routes/columnRoutes';
import voteRoutes from '@/routes/voteRoutes';
import commentRoutes from '@/routes/commentRoutes';
import { pollRoutes } from '@/routes/pollRoutes';

// Import middleware
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { corsOptions } from '@/middleware/cors';

// Import utilities
import { logger } from '@/utils/logger';
import { prisma } from '@/utils/database';
import { initializeSocketManager } from '@/utils/socketManager';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize Socket.IO
const socketManager = initializeSocketManager(server);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kanban de Ideias API',
      version: '1.0.0',
      description: 'API para gestão de ideias em formato Kanban',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(corsOptions);

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Muitas requisições deste IP, tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Kanban de Ideias API está funcionando',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Kanban de Ideias API Docs',
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/cards', voteRoutes); // Votes are nested under cards
app.use('/api/cards', commentRoutes); // Comments are nested under cards
app.use('/api/polls', pollRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo à API do Kanban de Ideias',
    version: '1.0.0',
    documentation: `/docs`,
    endpoints: {
      auth: '/api/auth',
      cards: '/api/cards',
      columns: '/api/columns',
      events: '/api/events',
    },
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`🔌 Socket.IO inicializado`);
  logger.info(`📚 Documentação disponível em http://localhost:${PORT}/docs`);
  logger.info(`🌐 API disponível em http://localhost:${PORT}/api`);
  logger.info(`💚 Health check em http://localhost:${PORT}/health`);
});

export default app;
