# Agent Smart Scraper

An AI-powered web scraper that uses LLMs to intelligently extract structured data from web pages. Built for OpenClaw agents and compatible with any AI agent that supports MCP tools.

## Features

- **AI-Powered Extraction**: Uses LLM to understand page structure and extract relevant data
- **Multiple Output Formats**: JSON, Markdown, CSV
- **Login Support**: Handles authentication cookies and sessions
- **Dynamic Content**: Waits for JavaScript to render before extraction
- **Batch Scraping**: Extract data from multiple pages in one run
- **Schema Validation**: Validates extracted data against defined schemas

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/agent-smart-scraper.git
cd agent-smart-scraper

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage as OpenClaw Skill

### Quick Start

1. Add to your OpenClaw skills directory
2. Configure your LLM provider
3. Start scraping!

```bash
# Scrape a single page
openclaw scrape https://example.com --schema "title,description,links"

# Scrape with custom prompt
openclaw scrape https://example.com --prompt "Extract all blog post titles and their publication dates"
```

### Configuration

Create `config.json`:

```json
{
  "llm": {
    "provider": "openai",
    "model": "gpt-4o",
    "apiKey": "${OPENAI_API_KEY}"
  },
  "scraper": {
    "timeout": 30000,
    "waitFor": "networkidle",
    "headless": true
  }
}
```

## Usage as Standalone Tool

### Python API

```python
from smart_scraper import SmartScraper

scraper = SmartScraper(
    provider="openai",
    model="gpt-4o",
    api_key="your-api-key"
)

# Extract structured data
result = await scraper.scrape(
    url="https://example.com",
    schema={
        "title": "string",
        "description": "string", 
        "links": ["string"]
    }
)

print(result)
```

### JavaScript/TypeScript API

```typescript
import { SmartScraper } from 'smart-scraper';

const scraper = new SmartScraper({
  provider: 'openai',
  model: 'gpt-4o',
  apiKey: process.env.OPENAI_API_KEY
});

const result = await scraper.scrape({
  url: 'https://example.com',
  prompt: 'Extract all article titles and summaries'
});
```

## Architecture

```
agent-smart-scraper/
├── src/
│   ├── index.ts          # Main entry point
│   ├── scraper.ts        # Core scraping logic
│   ├── llm.ts           # LLM integration
│   ├── parser.ts        # HTML parsing utilities
│   ├── schema.ts        # Schema validation
│   └── types.ts         # TypeScript types
├── tests/
│   └── scraper.test.ts
├── package.json
└── README.md
```

### Key Components

1. **Scraper Engine**: Handles browser automation via Playwright/Puppeteer
2. **LLM Integrator**: Sends page content to LLM for intelligent extraction
3. **Schema Validator**: Ensures extracted data matches expected structure
4. **Output Formatter**: Converts results to JSON/Markdown/CSV

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | If using OpenAI |
| `ANTHROPIC_API_KEY` | Anthropic API key | If using Claude |
| `OPENCLAW_API_KEY` | OpenClaw API key | If using OpenClaw |

## Examples

### Blog Post Extraction

```python
result = await scraper.scrape(
    url="https://blog.example.com/posts",
    prompt="Extract all blog posts with: title, author, date, summary, url",
    format="json"
)
```

### Product Listings

```python
result = await scraper.scrape(
    url="https://shop.example.com/category/electronics",
    schema={
        "products": [{
            "name": "string",
            "price": "number",
            "rating": "number",
            "availability": "string"
        }]
    }
)
```

### News Articles

```python
result = await scraper.scrape(
    url="https://news.example.com/latest",
    prompt="Extract all news articles with: headline, source, published_at, summary",
    batch=True
)
```

## Integration with OpenClaw

### As a Tool

```json
{
  "tools": [{
    "name": "smart_scrape",
    "description": "AI-powered web scraping with intelligent data extraction",
    "inputSchema": {
      "type": "object",
      "properties": {
        "url": { "type": "string" },
        "prompt": { "type": "string" },
        "schema": { "type": "object" }
      }
    }
  }]
}
```

### As a Skill

Add to your OpenClaw skill manifest:

```json
{
  "name": "smart-scraper",
  "version": "1.0.0",
  "description": "AI-powered web scraping skill",
  "triggers": ["scrape", "extract", "crawl"]
}
```

## License

MIT
