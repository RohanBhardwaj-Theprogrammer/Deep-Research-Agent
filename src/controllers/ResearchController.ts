import { Request, Response } from 'express';
import { ResearchService } from '../services';
import { ApiResponse, PaginatedResponse } from '../types';

export class ResearchController {
  private researchService: ResearchService;

  constructor() {
    this.researchService = new ResearchService();
  }

  createQuery = async (req: Request, res: Response): Promise<void> => {
    try {
      const { topic, depth = 3, keywords = [] } = req.body;

      if (!topic) {
        res.status(400).json({
          success: false,
          error: 'Topic is required',
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      if (depth < 1 || depth > 10) {
        res.status(400).json({
          success: false,
          error: 'Depth must be between 1 and 10',
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      const query = await this.researchService.createResearchQuery(topic, depth, keywords);
      
      res.status(201).json({
        success: true,
        data: query,
        message: 'Research query created successfully',
        timestamp: new Date(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error creating research query:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create research query',
        timestamp: new Date(),
      } as ApiResponse);
    }
  };

  executeResearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { queryId } = req.params;

      if (!queryId) {
        res.status(400).json({
          success: false,
          error: 'Query ID is required',
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      const result = await this.researchService.executeResearch(queryId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Research executed successfully',
        timestamp: new Date(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error executing research:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute research',
        timestamp: new Date(),
      } as ApiResponse);
    }
  };

  getQuery = async (req: Request, res: Response): Promise<void> => {
    try {
      const { queryId } = req.params;

      const query = await this.researchService.getResearchQuery(queryId);
      
      if (!query) {
        res.status(404).json({
          success: false,
          error: 'Research query not found',
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: query,
        timestamp: new Date(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error fetching research query:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch research query',
        timestamp: new Date(),
      } as ApiResponse);
    }
  };

  getResult = async (req: Request, res: Response): Promise<void> => {
    try {
      const { queryId } = req.params;

      const result = await this.researchService.getResearchResult(queryId);
      
      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Research result not found',
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error fetching research result:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch research result',
        timestamp: new Date(),
      } as ApiResponse);
    }
  };

  listQueries = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Invalid pagination parameters',
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      const { queries, total } = await this.researchService.listResearchQueries(page, limit);
      
      res.status(200).json({
        success: true,
        data: queries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        timestamp: new Date(),
      } as PaginatedResponse<any>);
    } catch (error) {
      console.error('Error listing research queries:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list research queries',
        timestamp: new Date(),
      } as ApiResponse);
    }
  };
}