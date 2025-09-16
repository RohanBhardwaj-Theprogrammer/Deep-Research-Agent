import { ResearchQueryModel, ResearchResultModel, IResearchQuery, IResearchResult } from '../models';
import { LMStudioService } from './LMStudioService';
import { ResearchQuery, ResearchResult, Source } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ResearchService {
  private lmStudioService: LMStudioService;

  constructor() {
    this.lmStudioService = new LMStudioService();
  }

  async createResearchQuery(topic: string, depth: number, keywords: string[] = []): Promise<ResearchQuery> {
    try {
      const query = new ResearchQueryModel({
        topic: topic.trim(),
        depth,
        keywords: keywords.map(k => k.trim()),
        status: 'pending',
      });

      const savedQuery = await query.save();
      
      return {
        id: savedQuery._id.toString(),
        topic: savedQuery.topic,
        depth: savedQuery.depth,
        keywords: savedQuery.keywords,
        status: savedQuery.status,
        createdAt: savedQuery.createdAt,
        updatedAt: savedQuery.updatedAt,
      };
    } catch (error) {
      console.error('Error creating research query:', error);
      throw new Error('Failed to create research query');
    }
  }

  async executeResearch(queryId: string): Promise<ResearchResult> {
    try {
      const query = await ResearchQueryModel.findById(queryId);
      if (!query) {
        throw new Error('Research query not found');
      }

      // Update status to in-progress
      query.status = 'in-progress';
      await query.save();

      // Generate research plan using LM Studio
      const researchPlan = await this.lmStudioService.generateResearchPlan(query.topic, query.depth);
      
      // Simulate research process (in a real implementation, this would involve web scraping, API calls, etc.)
      const mockSources = await this.generateMockSources(query.topic, query.keywords);
      
      // Analyze content and generate summary
      const analysisResults = await Promise.all(
        mockSources.map(source => 
          this.lmStudioService.analyzeContent(source.excerpt, query.topic)
        )
      );

      // Combine all content for synthesis
      const contentToSynthesize = mockSources.map((source, index) => 
        `Source: ${source.title}\n${analysisResults[index].summary}`
      );

      const synthesizedContent = await this.lmStudioService.synthesizeResults(
        contentToSynthesize,
        query.topic
      );

      // Calculate overall confidence
      const averageRelevance = analysisResults.reduce((sum, result) => sum + result.relevance, 0) / analysisResults.length;

      // Create research result
      const result = new ResearchResultModel({
        queryId: queryId,
        content: `${researchPlan}\n\n## Synthesis\n${synthesizedContent}`,
        sources: mockSources,
        confidence: averageRelevance,
      });

      const savedResult = await result.save();

      // Update query status to completed
      query.status = 'completed';
      await query.save();

      return {
        id: savedResult._id.toString(),
        queryId: savedResult.queryId,
        content: savedResult.content,
        sources: savedResult.sources,
        confidence: savedResult.confidence,
        createdAt: savedResult.createdAt,
      };
    } catch (error) {
      console.error('Error executing research:', error);
      
      // Update query status to failed
      const query = await ResearchQueryModel.findById(queryId);
      if (query) {
        query.status = 'failed';
        await query.save();
      }
      
      throw new Error('Research execution failed');
    }
  }

  async getResearchQuery(queryId: string): Promise<ResearchQuery | null> {
    try {
      const query = await ResearchQueryModel.findById(queryId);
      if (!query) return null;

      return {
        id: query._id.toString(),
        topic: query.topic,
        depth: query.depth,
        keywords: query.keywords,
        status: query.status,
        createdAt: query.createdAt,
        updatedAt: query.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching research query:', error);
      return null;
    }
  }

  async getResearchResult(queryId: string): Promise<ResearchResult | null> {
    try {
      const result = await ResearchResultModel.findOne({ queryId });
      if (!result) return null;

      return {
        id: result._id.toString(),
        queryId: result.queryId,
        content: result.content,
        sources: result.sources,
        confidence: result.confidence,
        createdAt: result.createdAt,
      };
    } catch (error) {
      console.error('Error fetching research result:', error);
      return null;
    }
  }

  async listResearchQueries(page: number = 1, limit: number = 10): Promise<{ queries: ResearchQuery[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const queries = await ResearchQueryModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await ResearchQueryModel.countDocuments();

      return {
        queries: queries.map(query => ({
          id: query._id.toString(),
          topic: query.topic,
          depth: query.depth,
          keywords: query.keywords,
          status: query.status,
          createdAt: query.createdAt,
          updatedAt: query.updatedAt,
        })),
        total,
      };
    } catch (error) {
      console.error('Error listing research queries:', error);
      throw new Error('Failed to list research queries');
    }
  }

  private async generateMockSources(topic: string, keywords: string[]): Promise<Source[]> {
    // In a real implementation, this would integrate with web scraping APIs, academic databases, etc.
    const mockSources: Source[] = [
      {
        url: `https://example.com/research/${topic.replace(/\s+/g, '-').toLowerCase()}`,
        title: `Comprehensive Study on ${topic}`,
        excerpt: `This research explores the fundamental aspects of ${topic}, providing insights into its current state and future directions. The study examines key factors and methodologies relevant to understanding ${topic} in depth.`,
        relevance: 0.9,
        type: 'academic',
      },
      {
        url: `https://news.example.com/${topic.replace(/\s+/g, '-').toLowerCase()}`,
        title: `Latest Developments in ${topic}`,
        excerpt: `Recent news and developments regarding ${topic} have shown significant progress. Industry experts discuss the implications and potential impacts on various sectors.`,
        relevance: 0.7,
        type: 'news',
      },
      {
        url: `https://web.example.com/${topic.replace(/\s+/g, '-').toLowerCase()}-guide`,
        title: `Ultimate Guide to ${topic}`,
        excerpt: `A comprehensive guide covering all aspects of ${topic}, including best practices, common challenges, and recommended approaches for both beginners and experts.`,
        relevance: 0.8,
        type: 'web',
      },
    ];

    return mockSources;
  }
}