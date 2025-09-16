import { Request, Response } from 'express';
import { LMStudioService } from '../services';
import { ApiResponse } from '../types';

export class HealthController {
  private lmStudioService: LMStudioService;

  constructor() {
    this.lmStudioService = new LMStudioService();
  }

  getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const lmStudioHealthy = await this.lmStudioService.checkHealth();
      
      const health = {
        status: lmStudioHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date(),
        services: {
          lmStudio: lmStudioHealthy ? 'connected' : 'disconnected',
          database: 'connected', // TODO: Add actual DB health check
        },
      };

      const statusCode = lmStudioHealthy ? 200 : 503;
      
      res.status(statusCode).json({
        success: lmStudioHealthy,
        data: health,
        timestamp: new Date(),
      } as ApiResponse);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        timestamp: new Date(),
      } as ApiResponse);
    }
  };
}