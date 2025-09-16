import { Router } from 'express';
import researchRoutes from './research';
import healthRoutes from './health';

const router = Router();

// API Routes
router.use('/api/research', researchRoutes);
router.use('/api/health', healthRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Deep Research Agent API',
    version: '1.0.0',
    timestamp: new Date(),
    endpoints: {
      health: '/api/health',
      research: '/api/research',
    },
  });
});

export default router;