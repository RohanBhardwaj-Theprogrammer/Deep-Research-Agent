#!/usr/bin/env node

/**
 * Demo script for Deep Research Agent
 * Shows API structure and capabilities without requiring external services
 */

const { ResearchService } = require('./dist/services/ResearchService');
const { LMStudioService } = require('./dist/services/LMStudioService');

console.log('🔬 Deep Research Agent - Demo');
console.log('===============================\n');

// Demo API endpoints
console.log('📡 Available API Endpoints:');
console.log('');
console.log('POST /api/research/queries - Create new research query');
console.log('POST /api/research/queries/:id/execute - Execute research');
console.log('GET  /api/research/queries/:id - Get query details');
console.log('GET  /api/research/queries/:id/result - Get research results');
console.log('GET  /api/research/queries - List all queries');
console.log('GET  /api/health - Health check');
console.log('');

// Demo request examples
console.log('📝 Example API Requests:');
console.log('');
console.log('1. Create Research Query:');
console.log('curl -X POST http://localhost:3000/api/research/queries \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"topic": "AI in Healthcare", "depth": 3, "keywords": ["machine learning", "diagnosis"]}\'');
console.log('');

console.log('2. Execute Research:');
console.log('curl -X POST http://localhost:3000/api/research/queries/[QUERY_ID]/execute');
console.log('');

console.log('3. Get Research Result:');
console.log('curl http://localhost:3000/api/research/queries/[QUERY_ID]/result');
console.log('');

// Demo features
console.log('⚡ Key Features:');
console.log('');
console.log('✅ TypeScript for type safety');
console.log('✅ MongoDB for data persistence');
console.log('✅ LM Studio integration for AI inference');
console.log('✅ Express.js REST API');
console.log('✅ Frontend web interface');
console.log('✅ Configurable research depth (1-10)');
console.log('✅ Source citation and confidence scoring');
console.log('✅ Research query management');
console.log('');

// Demo architecture
console.log('🏗️  Architecture:');
console.log('');
console.log('Frontend (HTML/JS) → Express.js API → MongoDB + LM Studio');
console.log('');
console.log('- Frontend: http://localhost:3000/static/index.html');
console.log('- API: http://localhost:3000/api/');
console.log('- Health: http://localhost:3000/api/health');
console.log('');

// Setup instructions
console.log('🚀 Quick Start:');
console.log('');
console.log('1. Install dependencies: npm install');
console.log('2. Configure environment: cp .env.example .env');
console.log('3. Start MongoDB (locally or remote)');
console.log('4. Start LM Studio with API enabled');
console.log('5. Run server: npm run dev');
console.log('6. Open browser: http://localhost:3000/static/index.html');
console.log('');

console.log('📚 For full documentation, see README.md');
console.log('');
console.log('Demo completed! 🎉');