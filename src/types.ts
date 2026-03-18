/**
 * TypeScript types for Agent Smart Scraper
 */

export interface ScrapeOptions {
  // LLM Configuration
  llm: LLMOptions;
  
  // Scraping Configuration
  timeout?: number;
  waitFor?: 'load' | 'domcontentloaded' | 'networkidle' | 'network0';
  headless?: boolean;
  viewport?: { width: number; height: number };
  headers?: Record<string, string>;
  
  // Extraction Configuration
  prompt?: string;
  schema?: SchemaDefinition;
  format?: 'json' | 'markdown' | 'csv';
  
  // Authentication
  cookies?: Cookie[];
  auth?: AuthConfig;
}

export interface LLMOptions {
  provider: 'openai' | 'anthropic' | 'openclaw' | 'ollama';
  model?: string;
  apiKey?: string;
}

export interface SchemaDefinition {
  [key: string]: string | number | boolean | SchemaDefinition | SchemaDefinition[];
}

export interface ScrapeResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    url: string;
    title: string;
    timestamp: string;
  };
}

export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface AuthConfig {
  type: 'cookie' | 'basic' | 'bearer';
  credentials: Record<string, string>;
}

export interface BatchScrapeOptions extends ScrapeOptions {
  concurrency?: number;
  retryCount?: number;
  retryDelay?: number;
}

export interface ExtractedData {
  [key: string]: any;
}
