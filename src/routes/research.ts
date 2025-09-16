import { Router } from 'express';
import { ResearchController } from '../controllers';

const router = Router();
const researchController = new ResearchController();

// Create a new research query
router.post('/queries', researchController.createQuery);

// Execute research for a specific query
router.post('/queries/:queryId/execute', researchController.executeResearch);

// Get a specific research query
router.get('/queries/:queryId', researchController.getQuery);

// Get research result for a specific query
router.get('/queries/:queryId/result', researchController.getResult);

// List all research queries with pagination
router.get('/queries', researchController.listQueries);

export default router;