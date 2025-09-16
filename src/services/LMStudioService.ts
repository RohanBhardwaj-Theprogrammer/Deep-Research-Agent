import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { LMStudioRequest, LMStudioResponse, Message } from '../types';

export class LMStudioService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.lmStudio.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.lmStudio.apiKey}`,
      },
      timeout: config.research.timeout,
    });
  }

  async generateCompletion(request: LMStudioRequest): Promise<LMStudioResponse> {
    try {
      const response = await this.client.post('/v1/chat/completions', request);
      return response.data;
    } catch (error) {
      console.error('LM Studio API error:', error);
      throw new Error(`LM Studio request failed: ${error}`);
    }
  }

  async generateResearchPlan(topic: string, depth: number): Promise<string> {
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are a research planning AI. Create a comprehensive research plan for the given topic with the specified depth level. 
        Generate specific research questions, keywords, and methodologies. Be thorough and structured.`
      },
      {
        role: 'user',
        content: `Create a research plan for: "${topic}" with depth level ${depth}. 
        Include: research questions, key areas to investigate, important keywords, and methodology.`
      }
    ];

    const request: LMStudioRequest = {
      model: config.research.defaultModel,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    };

    const response = await this.generateCompletion(request);
    return response.choices[0]?.message?.content || '';
  }

  async analyzeContent(content: string, query: string): Promise<{ summary: string; relevance: number }> {
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are a content analysis AI. Analyze the given content for relevance to the research query. 
        Provide a summary and relevance score (0-1). Respond in JSON format: {"summary": "...", "relevance": 0.8}`
      },
      {
        role: 'user',
        content: `Query: "${query}"\n\nContent to analyze:\n${content}`
      }
    ];

    const request: LMStudioRequest = {
      model: config.research.defaultModel,
      messages,
      temperature: 0.3,
      max_tokens: 500,
    };

    try {
      const response = await this.generateCompletion(request);
      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      return {
        summary: result.summary || 'No summary available',
        relevance: Math.min(Math.max(result.relevance || 0, 0), 1)
      };
    } catch (error) {
      console.error('Content analysis failed:', error);
      return { summary: 'Analysis failed', relevance: 0 };
    }
  }

  async synthesizeResults(results: string[], query: string): Promise<string> {
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are a research synthesis AI. Combine multiple research findings into a comprehensive, 
        well-structured report. Focus on answering the research query while maintaining academic rigor.`
      },
      {
        role: 'user',
        content: `Research Query: "${query}"\n\nFindings to synthesize:\n${results.join('\n\n---\n\n')}`
      }
    ];

    const request: LMStudioRequest = {
      model: config.research.defaultModel,
      messages,
      temperature: 0.5,
      max_tokens: 2000,
    };

    const response = await this.generateCompletion(request);
    return response.choices[0]?.message?.content || '';
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.client.get('/v1/models');
      return true;
    } catch (error) {
      console.error('LM Studio health check failed:', error);
      return false;
    }
  }
}