/**
 * HTML Parser - Utilities for parsing and extracting content from HTML
 */

import type { Element } from 'cheerio';
import * as cheerio from 'cheerio';

export interface ParsedElement {
  tag: string;
  text: string;
  html: string;
  attributes: Record<string, string>;
  children: ParsedElement[];
}

export interface ParsedPage {
  title: string;
  description: string;
  links: { text: string; href: string }[];
  images: { alt: string; src: string }[];
  headings: { level: number; text: string }[];
  text: string;
  html: string;
}

/**
 * Parse HTML and extract structured data
 */
export function parseHTML(html: string): ParsedPage {
  const $ = cheerio.load(html);
  
  return {
    title: $('title').text().trim(),
    description: $('meta[name="description"]').attr('content') || '',
    links: $('a[href]').map((_, el) => ({
      text: $(el).text().trim(),
      href: $(el).attr('href') || '',
    })).get().filter(link => link.href),
    images: $('img[src]').map((_, el) => ({
      alt: $(el).attr('alt') || '',
      src: $(el).attr('src') || '',
    })).get(),
    headings: $('h1, h2, h3, h4, h5, h6').map((_, el) => ({
      level: parseInt(el.tagName.slice(1)),
      text: $(el).text().trim(),
    })).get(),
    text: $('body').text().replace(/\s+/g, ' ').trim(),
    html: html,
  };
}

/**
 * Extract text content from a specific element
 */
export function extractText(html: string, selector: string): string {
  const $ = cheerio.load(html);
  return $(selector).text().replace(/\s+/g, ' ').trim();
}

/**
 * Extract attributes from elements matching a selector
 */
export function extractAttributes(html: string, selector: string, attribute: string): string[] {
  const $ = cheerio.load(html);
  return $(selector).map((_, el) => $(el).attr(attribute) || '').get();
}

/**
 * Extract structured data using CSS selectors
 */
export function extractStructuredData(
  html: string,
  schema: Record<string, string>
): Record<string, string[]> {
  const $ = cheerio.load(html);
  const result: Record<string, string[]> = {};
  
  for (const [key, selector] of Object.entries(schema)) {
    result[key] = $(selector).map((_, el) => $(el).text().trim()).get();
  }
  
  return result;
}

/**
 * Find all links within a specific container
 */
export function findContainerLinks(html: string, containerSelector: string): { text: string; href: string }[] {
  const $ = cheerio.load(html);
  const container = $(containerSelector);
  
  return container.find('a[href]').map((_, el) => ({
    text: $(el).text().trim(),
    href: $(el).attr('href') || '',
  })).get();
}

export default parseHTML;
