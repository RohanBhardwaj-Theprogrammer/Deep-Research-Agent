// Core research types
export interface ResearchQuery {
  id: string;
  topic: string;
  depth: number;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface ResearchResult {
  id: string;
  queryId: string;
  content: string;
  sources: Source[];
  confidence: number;
  createdAt: Date;
}

export interface Source {
  url: string;
  title: string;
  excerpt: string;
  relevance: number;
  type: 'web' | 'academic' | 'news' | 'document';
}

// LM Studio integration types
export interface LMStudioRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface LMStudioResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Choice {
  index: number;
  message: Message;
  finish_reason: string;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// Research Agent types
export interface ResearchAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AgentTask {
  id: string;
  agentId: string;
  queryId: string;
  type: 'research' | 'summarize' | 'analyze' | 'synthesize';
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Configuration types
export interface Config {
  server: {
    port: number;
    nodeEnv: string;
  };
  database: {
    mongoUri: string;
  };
  lmStudio: {
    baseUrl: string;
    apiKey: string;
  };
  research: {
    maxDepth: number;
    defaultModel: string;
    timeout: number;
  };
}