import { Router } from 'express';
import { HealthController } from '../controllers';

const router = Router();
const healthController = new HealthController();

// Health check endpoint
router.get('/', healthController.getHealth);

export default router;