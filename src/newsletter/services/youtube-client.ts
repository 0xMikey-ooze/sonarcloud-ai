import axios from 'axios';
import { Article, ArticleCategory } from '../types';

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelTitle: string;
    thumbnails: {
      default: { url: string };
    };
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
}

export class YouTubeClient {
  private apiKey?: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    if (!this.apiKey) {
      console.warn('WARNING: YOUTUBE_API_KEY is not set. YouTube search will be mocked.');
    }
  }

  async search(
    query: string,
    category: ArticleCategory,
    maxResults: number = 5
  ): Promise<Article[]> {
    if (!this.apiKey) {
      console.log(`[YouTube] Mock search for: "${query}"`);
      return this.getMockResults(query, category, maxResults);
    }

    try {
      const response = await axios.get<YouTubeSearchResponse>(
        `${this.baseUrl}/search`,
        {
          params: {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: maxResults * 2,
            order: 'relevance',
            publishedAfter: this.get90DaysAgo(),
            key: this.apiKey,
          },
          timeout: 15000,
        }
      );

      const items = response.data?.items || [];
      const articles: Article[] = [];

      for (const item of items) {
        const videoId = item.id?.videoId;
        if (!videoId) continue;

        const title = item.snippet?.title || 'Untitled';
        const description = item.snippet?.description || '';
        const summary = description.length > 200
          ? description.substring(0, 200) + '...'
          : description || `Video about ${query}.`;

        articles.push({
          id: `youtube-${videoId}`,
          title,
          url: `https://youtube.com/watch?v=${videoId}`,
          source: 'YouTube',
          summary,
          category,
          publishedAt: item.snippet?.publishedAt,
          author: item.snippet?.channelTitle,
          imageUrl: item.snippet?.thumbnails?.default?.url,
        });

        if (articles.length >= maxResults) break;
      }

      console.log(`[YouTube] Found ${articles.length} videos for "${query}"`);
      return articles;
    } catch (error) {
      console.warn('YouTube search failed:', (error as Error).message);
      return [];
    }
  }

  private get90DaysAgo(): string {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString();
  }

  private getMockResults(query: string, category: ArticleCategory, limit: number): Article[] {
    const mockData: Record<string, Article[]> = {
      'kids-audio': [
        {
          id: 'youtube-mock-1',
          title: 'Best Audio Stories for Kids 2026',
          url: 'https://youtube.com/watch?v=mock1',
          source: 'YouTube',
          summary: 'A curated roundup of the best audio storytelling platforms for children, including Yoto, Tonies, and new indie apps.',
          category: 'kids-audio',
        },
      ],
      'educational-ai': [
        {
          id: 'youtube-mock-2',
          title: 'AI in the Classroom: What Teachers Need to Know',
          url: 'https://youtube.com/watch?v=mock2',
          source: 'YouTube',
          summary: 'Edtech expert walks through practical AI tools for lesson planning, grading, and personalised feedback.',
          category: 'educational-ai',
        },
      ],
      'podcasting': [
        {
          id: 'youtube-mock-3',
          title: 'How to Start a Classroom Podcast (Step by Step)',
          url: 'https://youtube.com/watch?v=mock3',
          source: 'YouTube',
          summary: 'Complete guide to equipment, hosting, and curriculum integration for student podcasting projects.',
          category: 'podcasting',
        },
      ],
      'parenting-tips': [
        {
          id: 'youtube-mock-4',
          title: 'Screen-Free Parenting: A 30-Day Experiment',
          url: 'https://youtube.com/watch?v=mock4',
          source: 'YouTube',
          summary: 'Family documents their month without screens and shares unexpected benefits for creativity and sleep.',
          category: 'parenting-tips',
        },
      ],
    };

    return (mockData[category] || []).slice(0, limit);
  }
}
