import axios from 'axios';
import { Article, ArticleCategory } from '../types';

export class SocialClient {
  private tiktokApiKey?: string;
  private instagramToken?: string;
  private threadsToken?: string;

  constructor() {
    this.tiktokApiKey = process.env.TIKTOK_API_KEY;
    this.instagramToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    this.threadsToken = process.env.THREADS_ACCESS_TOKEN;
  }

  /**
   * Search across TikTok, Instagram, and Threads for relevant content.
   * Returns articles extracted from posts that link to external content.
   */
  async search(
    query: string,
    category: ArticleCategory,
    maxPerPlatform: number = 3
  ): Promise<Article[]> {
    const articles: Article[] = [];

    // TikTok
    const tiktokResults = await this.searchTikTok(query, category, maxPerPlatform);
    articles.push(...tiktokResults);

    // Instagram
    const instagramResults = await this.searchInstagram(query, category, maxPerPlatform);
    articles.push(...instagramResults);

    // Threads
    const threadsResults = await this.searchThreads(query, category, maxPerPlatform);
    articles.push(...threadsResults);

    return articles;
  }

  private async searchTikTok(
    query: string,
    category: ArticleCategory,
    limit: number
  ): Promise<Article[]> {
    if (!this.tiktokApiKey) {
      return this.getMockResults('tiktok', query, category, limit);
    }

    // TikTok Research API requires special approval
    // This is a placeholder for when credentials are available
    console.log('[TikTok] API key present but Research API integration pending');
    return [];
  }

  private async searchInstagram(
    query: string,
    category: ArticleCategory,
    limit: number
  ): Promise<Article[]> {
    if (!this.instagramToken) {
      return this.getMockResults('instagram', query, category, limit);
    }

    try {
      // Instagram Graph API hashtag search
      const hashtag = query.replace(/\s+/g, '').toLowerCase().substring(0, 30);
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/ig_hashtag_search`,
        {
          params: {
            q: hashtag,
            access_token: this.instagramToken,
          },
          timeout: 10000,
        }
      );

      // Placeholder: real implementation would fetch recent media and extract links
      console.log('[Instagram] Hashtag search response received');
      return [];
    } catch (error) {
      console.warn('Instagram search failed:', (error as Error).message);
      return this.getMockResults('instagram', query, category, limit);
    }
  }

  private async searchThreads(
    query: string,
    category: ArticleCategory,
    limit: number
  ): Promise<Article[]> {
    if (!this.threadsToken) {
      return this.getMockResults('threads', query, category, limit);
    }

    // Threads API is limited to authenticated user's content
    console.log('[Threads] API token present but search functionality is limited');
    return [];
  }

  private getMockResults(
    platform: string,
    query: string,
    category: ArticleCategory,
    limit: number
  ): Article[] {
    const key = `${platform}-${category}`;
    const mockData: Record<string, Article[]> = {
      'tiktok-kids-audio': [
        {
          id: 'tiktok-mock-1',
          title: 'Parents are using audio players instead of tablets',
          url: 'https://example.com/tiktok-audio-players',
          source: 'TikTok',
          summary: 'Viral trend shows families replacing screen time with Yoto and Tonies audio players. 2.3M views.',
          category: 'kids-audio',
        },
      ],
      'instagram-kids-audio': [
        {
          id: 'instagram-mock-1',
          title: 'Bedtime audio routines that actually work',
          url: 'https://example.com/ig-bedtime-audio',
          source: 'Instagram',
          summary: 'Pediatric sleep consultant shares audio-based bedtime routines. 45K saves.',
          category: 'kids-audio',
        },
      ],
      'threads-educational-ai': [
        {
          id: 'threads-mock-1',
          title: 'Teachers on Threads: AI is changing grading forever',
          url: 'https://example.com/threads-ai-grading',
          source: 'Threads',
          summary: 'Discussion thread on how AI feedback tools are reshaping formative assessment in K-12.',
          category: 'educational-ai',
        },
      ],
      'tiktok-podcasting': [
        {
          id: 'tiktok-mock-2',
          title: 'My students started a podcast and test scores went up',
          url: 'https://example.com/tiktok-podcast-scores',
          source: 'TikTok',
          summary: 'Teacher documents classroom podcast project. Engagement and speaking scores improved significantly.',
          category: 'podcasting',
        },
      ],
      'instagram-parenting-tips': [
        {
          id: 'instagram-mock-2',
          title: 'Screen-free Saturday challenge results',
          url: 'https://example.com/ig-screen-free',
          source: 'Instagram',
          summary: 'Family of five documents their no-screen Saturdays for a month. Creativity and sibling bonding improved.',
          category: 'parenting-tips',
        },
      ],
    };

    return (mockData[key] || []).slice(0, limit);
  }
}
