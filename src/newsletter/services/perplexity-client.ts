import axios from 'axios';
import { Article, ArticleCategory } from '../types';

export class PerplexityClient {
  private apiKey?: string;
  private baseUrl = 'https://api.perplexity.ai';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    if (!this.apiKey) {
      console.warn('WARNING: PERPLEXITY_API_KEY is not set. Perplexity search will be mocked.');
    }
  }

  /**
   * Search the web via Perplexity API and return articles.
   * Perplexity does real-time web search + summarization.
   */
  async search(
    query: string,
    category: ArticleCategory,
    maxResults: number = 5
  ): Promise<Article[]> {
    if (!this.apiKey) {
      console.log(`[Perplexity] Mock search for: "${query}"`);
      return this.getMockResults(query, category, maxResults);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a research assistant. Find recent articles, blog posts, and news about the user\'s query. For each source, provide: title, URL, and a 1-sentence summary. Return ONLY a JSON array.',
            },
            {
              role: 'user',
              content: `Find ${maxResults} recent articles about: ${query}. Return JSON: [{"title":"...","url":"...","summary":"..."}]`,
            },
          ],
          max_tokens: 2048,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content || '';
      let parsed: any[] = [];

      try {
        // Try to extract JSON array from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        console.warn('[Perplexity] Could not parse response as JSON');
        return [];
      }

      const articles: Article[] = [];
      for (const item of parsed.slice(0, maxResults)) {
        if (!item.url || !item.title) continue;
        articles.push({
          id: `perplexity-${Buffer.from(item.url).toString('base64').substring(0, 16)}`,
          title: item.title,
          url: item.url,
          source: 'Perplexity',
          summary: item.summary || `Article about ${query}.`,
          category,
        });
      }

      console.log(`[Perplexity] Found ${articles.length} articles for "${query}"`);
      return articles;
    } catch (error) {
      console.warn('Perplexity search failed:', (error as Error).message);
      if (axios.isAxiosError(error) && error.response) {
        console.warn('  Response:', JSON.stringify(error.response.data, null, 2));
      }
      return [];
    }
  }

  private getMockResults(query: string, category: ArticleCategory, limit: number): Article[] {
    const mockData: Record<string, Article[]> = {
      'kids-audio': [
        {
          id: 'perplexity-mock-1',
          title: 'The Rise of Interactive Audio for Children in 2026',
          url: 'https://example.com/interactive-audio',
          source: 'Perplexity',
          summary: 'New platforms are combining voice AI with traditional storytelling to create adaptive narratives that respond to children\'s choices in real time.',
          category: 'kids-audio',
        },
      ],
      'educational-ai': [
        {
          id: 'perplexity-mock-2',
          title: 'State of AI in Education: Mid-2026 Report',
          url: 'https://example.com/ai-edu-report',
          source: 'Perplexity',
          summary: 'Comprehensive survey of 500 districts finds 67% now use AI for personalised learning paths, up from 23% in 2024.',
          category: 'educational-ai',
        },
      ],
      'podcasting': [
        {
          id: 'perplexity-mock-3',
          title: 'Student Podcasting as Assessment: New Research',
          url: 'https://example.com/podcast-assessment',
          source: 'Perplexity',
          summary: 'Study shows students who produce podcasts demonstrate 34% better information retention compared to traditional essay assignments.',
          category: 'podcasting',
        },
      ],
      'parenting-tips': [
        {
          id: 'perplexity-mock-4',
          title: 'The 20-Minute Audio Rule: What Pediatricians Now Recommend',
          url: 'https://example.com/audio-rule',
          source: 'Perplexity',
          summary: 'Updated AAP guidelines suggest structured audio listening as part of daily routines for children ages 2-8.',
          category: 'parenting-tips',
        },
      ],
    };

    return (mockData[category] || []).slice(0, limit);
  }
}
