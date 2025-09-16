# Deep Research Agent

A comprehensive AI-powered research assistant built with Node.js, MongoDB, and LM Studio integration. This application provides both backend API services and a frontend interface for conducting in-depth research on any topic.

## Features

🔬 **AI-Powered Research**: Leverages LM Studio for intelligent research planning and content analysis  
📊 **MongoDB Integration**: Persistent storage for research queries, results, and agent configurations  
🎯 **Configurable Depth**: Research depth levels from 1 (basic) to 10 (exhaustive)  
🌐 **REST API**: Comprehensive API for integration with other applications  
💻 **Web Interface**: Clean, responsive frontend for easy interaction  
🔧 **TypeScript**: Full TypeScript support for both frontend and backend  

## Architecture

- **Backend**: Node.js + Express.js + TypeScript + MongoDB + LM Studio API
- **Frontend**: Vanilla JavaScript with TypeScript types  
- **Database**: MongoDB for research data and agent state
- **AI**: LM Studio integration for research agent inference

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or remote)
- LM Studio (running with API enabled)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/RohanBhardwaj-Theprogrammer/Deep-Research-Agent.git
cd Deep-Research-Agent
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Build and start the server:
```bash
npm run build
npm start
# Or for development:
npm run dev
```

### Environment Configuration

Edit `.env` file with your settings:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/deep-research-agent

# LM Studio Configuration
LM_STUDIO_BASE_URL=http://localhost:1234
LM_STUDIO_API_KEY=your-api-key-here

# Research Agent Configuration
MAX_RESEARCH_DEPTH=5
DEFAULT_MODEL=llama-2-7b-chat
RESEARCH_TIMEOUT=300000
```

## API Endpoints

### Research Queries

#### Create Research Query
```http
POST /api/research/queries
Content-Type: application/json

{
  "topic": "Artificial Intelligence in Healthcare",
  "depth": 3,
  "keywords": ["machine learning", "diagnostics", "patient care"]
}
```

#### Execute Research
```http
POST /api/research/queries/{queryId}/execute
```

#### Get Query Details
```http
GET /api/research/queries/{queryId}
```

#### Get Research Results
```http
GET /api/research/queries/{queryId}/result
```

#### List All Queries
```http
GET /api/research/queries?page=1&limit=10
```

### Health Check

#### System Health
```http
GET /api/health
```

## Frontend Interface

Access the web interface at `http://localhost:3000/static/index.html`

The frontend provides:
- Research topic input with configurable depth
- Real-time research execution
- Results display with source citations
- Query history management

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Project Structure

```
src/
├── config/         # Configuration management
├── controllers/    # Request handlers
├── models/         # MongoDB schemas
├── routes/         # API route definitions
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── server.ts       # Main server file

frontend/
├── index.html      # Main frontend page
└── js/
    └── app.js      # Frontend application logic
```

## LM Studio Integration

The application integrates with LM Studio for AI-powered research capabilities:

1. **Research Planning**: Generates comprehensive research plans based on topics
2. **Content Analysis**: Analyzes content relevance and extracts key insights
3. **Result Synthesis**: Combines multiple sources into coherent research reports

Ensure LM Studio is running with API access enabled on the configured port (default: 1234).

## TypeScript Types

Shared types are defined in `src/types/index.ts` and include:

- `ResearchQuery` - Research query structure
- `ResearchResult` - Research result with sources and confidence
- `LMStudioRequest/Response` - LM Studio API interfaces
- `ApiResponse` - Standardized API response format

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Ensure LM Studio and MongoDB are properly configured
