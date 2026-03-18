/**
 * Agent Smart Scraper - Core scraping logic
 * AI-powered web scraping with intelligent data extraction
 */

import { chromium, type Browser, type Page } from 'playwright';
import { LLMClient } from './llm';
import { parseHTML } from './parser';
import { validateSchema } from './schema';
import type { ScrapeOptions, ScrapeResult, SchemaDefinition } from './types';

export class SmartScraper {
  private browser: Browser | null = null;
  private llm: LLMClient;
  private defaultOptions: Required<ScrapeOptions>;

  constructor(options: ScrapeOptions) {
    this.llm = new LLMClient(options.llm);
    this.defaultOptions = {
      timeout: options.timeout ?? 30000,
      waitFor: options.waitFor ?? 'networkidle',
      headless: options.headless ?? true,
      viewport: options.viewport ?? { width: 1280, height: 720 },
      headers: options.headers ?? {},
    };
  }

  /**
   * Initialize browser instance
   */
  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: this.defaultOptions.headless,
      });
    }
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrape a URL with AI-powered extraction
   */
  async scrape(url: string, options: Partial<ScrapeOptions> = {}): Promise<ScrapeResult> {
    await this.init();
    
    const page = await this.browser!.newPage({
      viewport: this.defaultOptions.viewport,
    });

    try {
      // Set custom headers if provided
      if (this.defaultOptions.headers) {
        await page.setExtraHTTPHeaders(this.defaultOptions.headers);
      }

      // Navigate to URL
      await page.goto(url, {
        waitUntil: this.defaultOptions.waitFor as any,
        timeout: this.defaultOptions.timeout,
      });

      // Get page content
      const html = await page.content();
      const text = await page.evaluate(() => document.body.innerText);
      const title = await page.title();

      // Extract using LLM
      const extracted = await this.extractWithLLM(
        html,
        text,
        title,
        options
      );

      // Validate schema if provided
      if (options.schema) {
        const validation = validateSchema(extracted, options.schema);
        if (!validation.valid) {
          return {
            success: false,
            error: `Schema validation failed: ${validation.errors.join(', ')}`,
            data: null,
          };
        }
      }

      return {
        success: true,
        data: extracted,
        metadata: {
          url,
          title,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: null,
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Batch scrape multiple URLs
   */
  async scrapeBatch(
    urls: string[],
    options: Partial<ScrapeOptions> = {}
  ): Promise<ScrapeResult[]> {
    const results: ScrapeResult[] = [];
    
    for (const url of urls) {
      const result = await this.scrape(url, options);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Extract data using LLM
   */
  private async extractWithLLM(
    html: string,
    text: string,
    title: string,
    options: Partial<ScrapeOptions>
  ): Promise<any> {
    const prompt = this.buildPrompt(title, text, options);
    
    const response = await this.llm.complete(prompt);
    
    // Parse LLM response based on expected format
    if (options.schema) {
      return this.parseJSONResponse(response);
    }
    
    return this.parseJSONResponse(response);
  }

  /**
   * Build extraction prompt
   */
  private buildPrompt(title: string, text: string, options: Partial<ScrapeOptions>): string {
    let prompt = `You are a web scraping assistant. Extract structured data from the following web page.\n\n`;
    prompt += `Page Title: ${title}\n\n`;
    
    if (options.prompt) {
      prompt += `User Request: ${options.prompt}\n\n`;
    }
    
    if (options.schema) {
      prompt += `Expected Schema: ${JSON.stringify(options.schema, null, 2)}\n\n`;
    }
    
    prompt += `Page Text Content:\n${text.slice(0, 10000)}\n\n`;
    prompt += `Respond with ONLY valid JSON matching the schema. No additional text.`;
    
    return prompt;
  }

  /**
   * Parse JSON response from LLM
   */
  private parseJSONResponse(response: string): any {
    // Try to extract JSON from response
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) 
      || response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch {
        // Return raw response if parsing fails
        return response;
      }
    }
    
    return response;
  }
}

export default SmartScraper;
