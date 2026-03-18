/**
 * Agent Smart Scraper - Main Entry Point
 * AI-powered web scraping with intelligent data extraction
 */

export { SmartScraper } from './scraper';
export { LLMClient } from './llm';
export { validateSchema } from './schema';
export * from './parser';
export * from './types';

// CLI exports
export { main } from './cli';

import type { ScrapeOptions } from './types';

/**
 * Quick scrape function for simple use cases
 */
export async function scrape(url: string, options: Partial<ScrapeOptions> = {}) {
  const { SmartScraper } = await import('./scraper');
  
  const scraper = new SmartScraper({
    llm: options.llm || {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY || '',
    },
    timeout: options.timeout,
    waitFor: options.waitFor,
    headless: options.headless,
  });

  try {
    return await scraper.scrape(url, options);
  } finally {
    await scraper.close();
  }
}

export default {
  scrape,
  SmartScraper,
  validateSchema,
};
