/**
 * LLM Client - Interface for various LLM providers
 */

import type { LLMOptions, LLMResponse } from './types';

export class LLMClient {
  private options: LLMOptions;
  private baseURL: string;
  private apiKey: string;

  constructor(options: LLMOptions) {
    this.options = options;
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || '';
    
    // Set base URL based on provider
    this.baseURL = this.getBaseURL(options.provider);
  }

  private getBaseURL(provider: string): string {
    switch (provider) {
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'anthropic':
        return 'https://api.anthropic.com/v1';
      case 'openclaw':
        return process.env.OPENCLAW_API_URL || 'https://api.openclaw.ai/v1';
      case 'ollama':
        return process.env.OLLAMA_API_URL || 'http://localhost:11434/api';
      default:
        return 'https://api.openai.com/v1';
    }
  }

  /**
   * Complete a prompt using the configured LLM
   */
  async complete(prompt: string): Promise<string> {
    switch (this.options.provider) {
      case 'openai':
        return this.completeOpenAI(prompt);
      case 'anthropic':
        return this.completeAnthropic(prompt);
      case 'openclaw':
        return this.completeOpenClaw(prompt);
      case 'ollama':
        return this.completeOllama(prompt);
      default:
        return this.completeOpenAI(prompt);
    }
  }

  private async completeOpenAI(prompt: string): Promise<string> {
    const model = this.options.model || 'gpt-4o';
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  }

  private async completeAnthropic(prompt: string): Promise<string> {
    const model = this.options.model || 'claude-3-5-sonnet-20241022';
    
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.content[0].text;
  }

  private async completeOpenClaw(prompt: string): Promise<string> {
    const model = this.options.model || 'default';
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenClaw API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  }

  private async completeOllama(prompt: string): Promise<string> {
    const model = this.options.model || 'llama2';
    
    const response = await fetch(`${this.baseURL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.response;
  }
}

export default LLMClient;
