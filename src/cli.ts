#!/usr/bin/env node

/**
 * CLI for Agent Smart Scraper
 */

import { parseArgs } from 'util';
import { scrape } from './index.js';

async function main() {
  const { positionals, values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      url: { type: 'string' },
      prompt: { type: 'string', short: 'p' },
      schema: { type: 'string', short: 's' },
      format: { type: 'string', short: 'f', default: 'json' },
      provider: { type: 'string', default: 'openai' },
      model: { type: 'string' },
      timeout: { type: 'string' },
      headless: { type: 'boolean', default: true },
      help: { type: 'boolean', default: false },
    },
    allowPositionals: true,
  });

  if (values.help || positionals[0] === 'help') {
    console.log(`
Agent Smart Scraper - AI-powered web scraping

Usage: smart-scraper <url> [options]

Options:
  --url, -u          URL to scrape
  --prompt, -p       Extraction prompt
  --schema, -s       JSON schema for extraction
  --format, -f       Output format (json|markdown|csv) [default: json]
  --provider         LLM provider (openai|anthropic|ollama) [default: openai]
  --model            LLM model to use
  --timeout          Timeout in milliseconds [default: 30000]
  --headless         Run browser in headless mode [default: true]
  --help             Show this help message

Examples:
  smart-scraper https://example.com --prompt "Extract all headings"
  smart-scraper https://example.com --schema '{"title":"string","links":["string"]}'
  smart-scraper https://example.com -p "Get all blog post titles"
    `.trim());
    process.exit(0);
  }

  const url = values.url || positionals[0];
  
  if (!url) {
    console.error('Error: URL is required');
    console.error('Usage: smart-scraper <url> [--prompt "..."] [--schema "..."]');
    process.exit(1);
  }

  let schema;
  if (values.schema) {
    try {
      schema = JSON.parse(values.schema);
    } catch (e) {
      console.error('Error: Invalid JSON schema');
      process.exit(1);
    }
  }

  const options = {
    llm: {
      provider: values.provider as any,
      model: values.model,
    },
    prompt: values.prompt,
    schema,
    format: values.format as any,
    timeout: values.timeout ? parseInt(values.timeout) : undefined,
    headless: values.headless,
  };

  console.log(`Scraping ${url}...`);
  
  try {
    const result = await scrape(url, options);
    
    if (result.success) {
      console.log('\n✓ Extraction successful!\n');
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.error('\n✗ Extraction failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch(console.error);
