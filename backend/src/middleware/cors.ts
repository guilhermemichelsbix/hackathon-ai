import cors from 'cors';

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

export const corsOptions = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow requests from the configured origin
    if (origin === CORS_ORIGIN) {
      return callback(null, true);
    }
    
    // In development, allow localhost with any port
    if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['X-Total-Count'],
});
