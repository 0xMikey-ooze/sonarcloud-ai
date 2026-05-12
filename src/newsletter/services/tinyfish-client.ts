import axios from 'axios';
import { Article, ArticleCategory } from '../types';

export interface TinyFishSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface TinyFishFetchResult {
  url: string;
  markdown: string;
  title?: string;
}

export interface TinyFishEnrichedArticle extends Article {
  fullContent?: string;
}

export class TinyFishClient {
  private apiKey?: string;
  private baseUrl = 'https://agent.tinyfish.ai/api/v1';

  constructor() {
    this.apiKey = process.env.TINYFISH_API_KEY;
    if (!this.apiKey) {
      console.warn('WARNING: TINYFISH_API_KEY is not set. TinyFish search will be mocked.');
    }
  }

  async search(query: string, category: ArticleCategory, limit: number = 5): Promise<Article[]> {
    if (!this.apiKey) {
      console.log(`[TinyFish] Mock search for: "${query}"`);
      return this.getMockResults(query, category, limit);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/search`,
        {
          query,
          num_results: limit,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const results: TinyFishSearchResult[] = response.data?.results || [];

      return results.map((result, index) => ({
        id: `tinyfish-${Buffer.from(result.url).toString('base64').substring(0, 16)}`,
        title: result.title,
        url: result.url,
        source: 'TinyFish Search',
        summary: this.truncate(result.snippet, 240),
        category,
      }));
    } catch (error) {
      console.warn('TinyFish search failed:', (error as Error).message);
      return [];
    }
  }

  /**
   * Enrich articles by fetching full page content via TinyFish.
   * This produces better summaries for the newsletter.
   */
  async enrichArticles(articles: Article[], maxToEnrich: number = 3): Promise<Article[]> {
    if (!this.apiKey) {
      console.log('[TinyFish] Skipping enrichment (no API key)');
      return articles;
    }

    const enriched: Article[] = [];
    let enrichedCount = 0;

    for (const article of articles) {
      if (enrichedCount >= maxToEnrich) {
        enriched.push(article);
        continue;
      }

      // Only enrich articles with weak summaries
      if (article.summary && article.summary.length > 80 && !article.summary.includes('No description')) {
        enriched.push(article);
        continue;
      }

      try {
        const fetched = await this.fetchPage(article.url);
        if (fetched && fetched.markdown) {
          const betterSummary = this.extractSummary(fetched.markdown, 240);
          enriched.push({
            ...article,
            summary: betterSummary || article.summary,
            title: fetched.title || article.title,
          });
          enrichedCount++;
          console.log(`[TinyFish] Enriched: ${article.title.substring(0, 50)}...`);
        } else {
          enriched.push(article);
        }
      } catch {
        enriched.push(article);
      }
    }

    return enriched;
  }

  async fetchPage(url: string): Promise<TinyFishFetchResult | null> {
    if (!this.apiKey) {
      console.log(`[TinyFish] Mock fetch for: ${url}`);
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/fetch`,
        {
          url,
          format: 'markdown',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return {
        url: response.data?.url || url,
        markdown: response.data?.markdown || '',
        title: response.data?.title,
      };
    } catch (error) {
      console.warn('TinyFish fetch failed:', (error as Error).message);
      return null;
    }
  }

  /**
   * Extract a readable summary from markdown content.
   */
  private extractSummary(markdown: string, maxLength: number): string {
    // Remove markdown syntax
    const plain = markdown
      .replace(/#+ /g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\*\*|__/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    // Take first meaningful paragraph (skip very short lines)
    const sentences = plain.split(/[.!?]+/).filter(s => s.trim().length > 20);
    let summary = sentences.slice(0, 2).join('. ').trim();

    if (summary.length < 40 && plain.length > 40) {
      summary = plain.substring(0, maxLength);
    }

    return this.truncate(summary, maxLength);
  }

  private truncate(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength).trim() + '...';
  }

  private getMockResults(query: string, category: ArticleCategory, limit: number): Article[] {
    const mockData: Record<string, Article[]> = {
      'kids-audio': [
        {
          id: 'tinyfish-mock-1',
          title: 'The Rise of Interactive Audio Stories for Children',
          url: 'https://example.com/kids-audio-1',
          source: 'TinyFish Search',
          summary: 'New apps are transforming bedtime with choose-your-own-adventure audio stories that respond to voice commands. Parents report 40% longer engagement compared to traditional audiobooks.',
          category: 'kids-audio',
        },
        {
          id: 'tinyfish-mock-2',
          title: 'Why Pediatricians Are Prescribing Podcasts',
          url: 'https://example.com/kids-audio-2',
          source: 'TinyFish Search',
          summary: 'A growing number of pediatricians recommend educational podcasts as a screen-free alternative for children aged 4-10. Research shows audio content improves listening comprehension.',
          category: 'kids-audio',
        },
      ],
      'educational-ai': [
        {
          id: 'tinyfish-mock-3',
          title: 'AI Tutors That Actually Work: A Teacher\'s Guide',
          url: 'https://example.com/ed-ai-1',
          source: 'TinyFish Search',
          summary: 'We tested 12 AI tutoring platforms in real classrooms. Three stood out for accuracy, safety, and student engagement. Here is what teachers need to know before adopting.',
          category: 'educational-ai',
        },
        {
          id: 'tinyfish-mock-4',
          title: 'How Schools Are Using Voice AI for Early Literacy',
          url: 'https://example.com/ed-ai-2',
          source: 'TinyFish Search',
          summary: 'Voice-enabled AI assistants are helping young learners practice reading aloud. New research from Stanford shows significant gains in phonemic awareness.',
          category: 'educational-ai',
        },
      ],
      'podcasting': [
        {
          id: 'tinyfish-mock-5',
          title: 'Starting a Classroom Podcast: A Step-by-Step Guide',
          url: 'https://example.com/podcast-1',
          source: 'TinyFish Search',
          summary: 'Teachers across the country are using classroom podcasts to build student confidence in public speaking. This guide covers equipment, platforms, and curriculum integration.',
          category: 'podcasting',
        },
      ],
    };

    return (mockData[category] || []).slice(0, limit);
  }
}
