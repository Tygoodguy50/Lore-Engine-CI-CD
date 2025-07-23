import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import conflictRoutes from './routes/conflict.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/lore/conflicts', conflictRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'lore-localai-integration',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Lore-LocalAI Integration API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      conflicts: {
        analyze: '/lore/conflicts/analyze',
        history: '/lore/conflicts/history',
        stats: '/lore/conflicts/stats',
        health: '/lore/conflicts/health'
      },
      docs: '/docs'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Lore-LocalAI Integration server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
