class ResearchClient {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }

    async createQuery(topic, depth, keywords = []) {
        const response = await fetch(`${this.baseUrl}/api/research/queries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic,
                depth: parseInt(depth),
                keywords: keywords.filter(k => k.trim())
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async executeResearch(queryId) {
        const response = await fetch(`${this.baseUrl}/api/research/queries/${queryId}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async getQuery(queryId) {
        const response = await fetch(`${this.baseUrl}/api/research/queries/${queryId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async getResult(queryId) {
        const response = await fetch(`${this.baseUrl}/api/research/queries/${queryId}/result`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async listQueries(page = 1, limit = 10) {
        const response = await fetch(`${this.baseUrl}/api/research/queries?page=${page}&limit=${limit}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async checkHealth() {
        const response = await fetch(`${this.baseUrl}/api/health`);
        return await response.json();
    }
}

class ResearchApp {
    constructor() {
        this.client = new ResearchClient();
        this.initializeEventListeners();
        this.checkServerHealth();
    }

    initializeEventListeners() {
        const form = document.getElementById('researchForm');
        const loadQueriesBtn = document.getElementById('loadQueriesBtn');

        form.addEventListener('submit', this.handleSubmit.bind(this));
        loadQueriesBtn.addEventListener('click', this.loadQueries.bind(this));
    }

    async checkServerHealth() {
        try {
            const health = await this.client.checkHealth();
            if (!health.success) {
                this.showError('Server or LM Studio is not available. Please check the configuration.');
            }
        } catch (error) {
            this.showError('Unable to connect to the server. Please ensure the backend is running.');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const topic = document.getElementById('topic').value.trim();
        const depth = document.getElementById('depth').value;
        const keywordsInput = document.getElementById('keywords').value.trim();
        const keywords = keywordsInput ? keywordsInput.split(',').map(k => k.trim()) : [];

        if (!topic) {
            this.showError('Please enter a research topic.');
            return;
        }

        this.showLoading(true);
        this.hideError();
        this.hideResult();

        try {
            // Create research query
            const createResponse = await this.client.createQuery(topic, depth, keywords);
            
            if (!createResponse.success) {
                throw new Error(createResponse.error || 'Failed to create research query');
            }

            const queryId = createResponse.data.id;

            // Execute research
            const executeResponse = await this.client.executeResearch(queryId);
            
            if (!executeResponse.success) {
                throw new Error(executeResponse.error || 'Research execution failed');
            }

            this.showResult(executeResponse.data);
            
        } catch (error) {
            console.error('Research error:', error);
            this.showError(error.message || 'An error occurred during research');
        } finally {
            this.showLoading(false);
        }
    }

    async loadQueries() {
        try {
            const response = await this.client.listQueries();
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to load queries');
            }

            this.displayQueries(response.data);
            
        } catch (error) {
            console.error('Load queries error:', error);
            this.showError(error.message || 'Failed to load recent queries');
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const submitBtn = document.getElementById('submitBtn');
        
        loading.style.display = show ? 'block' : 'none';
        submitBtn.disabled = show;
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    hideError() {
        const errorDiv = document.getElementById('error');
        errorDiv.style.display = 'none';
    }

    showResult(result) {
        const resultDiv = document.getElementById('result');
        const content = result.content || 'No content available';
        const sources = result.sources || [];
        
        let sourcesHtml = '';
        if (sources.length > 0) {
            sourcesHtml = `
                <div class="sources">
                    <h3>Sources (${sources.length})</h3>
                    ${sources.map(source => `
                        <div class="source">
                            <h4>${source.title}</h4>
                            <div class="url">${source.url}</div>
                            <p>${source.excerpt}</p>
                            <small>Type: ${source.type} | Relevance: ${(source.relevance * 100).toFixed(1)}%</small>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        resultDiv.innerHTML = `
            <h3>Research Result (Confidence: ${(result.confidence * 100).toFixed(1)}%)</h3>
            <pre>${content}</pre>
            ${sourcesHtml}
        `;
        
        resultDiv.style.display = 'block';
    }

    hideResult() {
        const resultDiv = document.getElementById('result');
        resultDiv.style.display = 'none';
    }

    displayQueries(queries) {
        const queriesDiv = document.getElementById('queries');
        
        if (!queries || queries.length === 0) {
            queriesDiv.innerHTML = '<p>No recent queries found.</p>';
            return;
        }

        const queriesHtml = queries.map(query => {
            const statusClass = `status-${query.status}`;
            const date = new Date(query.createdAt).toLocaleString();
            
            return `
                <div class="source">
                    <h4>${query.topic}</h4>
                    <div class="url">
                        <span class="status-badge ${statusClass}">${query.status}</span>
                        Created: ${date}
                    </div>
                    <p>Depth: ${query.depth} | Keywords: ${query.keywords.join(', ') || 'None'}</p>
                    <button onclick="app.viewResult('${query.id}')" style="margin-top: 10px; padding: 5px 10px; font-size: 14px;">
                        View Result
                    </button>
                </div>
            `;
        }).join('');

        queriesDiv.innerHTML = queriesHtml;
    }

    async viewResult(queryId) {
        try {
            const response = await this.client.getResult(queryId);
            
            if (!response.success) {
                throw new Error(response.error || 'Result not found');
            }

            this.showResult(response.data);
            
            // Scroll to result
            document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('View result error:', error);
            this.showError(error.message || 'Failed to load result');
        }
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ResearchApp();
});