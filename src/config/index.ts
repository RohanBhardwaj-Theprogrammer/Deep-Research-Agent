import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/deep-research-agent',
  },
  lmStudio: {
    baseUrl: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234',
    apiKey: process.env.LM_STUDIO_API_KEY || '',
  },
  research: {
    maxDepth: parseInt(process.env.MAX_RESEARCH_DEPTH || '5', 10),
    defaultModel: process.env.DEFAULT_MODEL || 'llama-2-7b-chat',
    timeout: parseInt(process.env.RESEARCH_TIMEOUT || '300000', 10),
  },
};

export default config;