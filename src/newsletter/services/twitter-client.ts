import axios from 'axios';
import { Article, ArticleCategory } from '../types';

interface TwitterTweet {
  id: string;
  text: string;
  created_at?: string;
  author_id?: string;
  entities?: {
    urls?: Array<{
      url: string;
      expanded_url: string;
      display_url: string;
    }>;
  };
}

interface TwitterSearchResponse {
  data?: TwitterTweet[];
  meta?: {
    result_count: number;
    next_token?: string;
  };
}

export class TwitterClient {
  private bearerToken?: string;
  private baseUrl = 'https://api.twitter.com/2';

  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!this.bearerToken) {
      console.warn('WARNING: TWITTER_BEARER_TOKEN is not set. Twitter search will be mocked.');
    }
  }

  /**
   * Search Twitter for recent tweets with links on a topic.
   * Returns articles extracted from linked URLs in tweets.
   */
  async search(
    query: string,
    category: ArticleCategory,
    maxResults: number = 5
  ): Promise<Article[]> {
    if (!this.bearerToken) {
      console.log(`[Twitter] Mock search for: "${query}"`);
      return this.getMockResults(query, category, maxResults);
    }

    // Build query: topic + has links + exclude retweets + English
    const fullQuery = `${query} has:links -is:retweet lang:en`;

    try {
      const response = await axios.get<TwitterSearchResponse>(
        `${this.baseUrl}/tweets/search/recent`,
        {
          headers: {
            Authorization: `Bearer ${this.bearerToken}`,
          },
          params: {
            query: fullQuery,
            max_results: Math.min(maxResults * 2, 25), // fetch extra since many tweets link to same domains
            'tweet.fields': 'created_at,entities',
            expansions: 'author_id',
            'user.fields': 'username',
          },
          timeout: 15000,
        }
      );

      const tweets = response.data?.data || [];
      const articles: Article[] = [];
      const seenUrls = new Set<string>();

      for (const tweet of tweets) {
        const urls = tweet.entities?.urls || [];
        for (const urlObj of urls) {
          const expandedUrl = urlObj.expanded_url;

          // Skip Twitter-internal links and common shorteners without real content
          if (this.isLowQualityUrl(expandedUrl)) continue;
          if (seenUrls.has(expandedUrl)) continue;
          seenUrls.add(expandedUrl);

          // Extract a summary from tweet text (remove the URL itself)
          let summary = tweet.text
            .replace(urlObj.url, '')
            .replace(/\s+/g, ' ')
            .trim();

          // Truncate summary
          summary = summary.length > 200 ? summary.substring(0, 200) + '...' : summary;

          // If summary is too short, use a generic one
          if (summary.length < 30) {
            summary = `A recent post about ${query}.`;
          }

          articles.push({
            id: `twitter-${tweet.id}`,
            title: summary.split(/[.!?]/, 1)[0].substring(0, 80) || 'Shared on Twitter',
            url: expandedUrl,
            source: 'Twitter',
            summary,
            category,
            publishedAt: tweet.created_at,
          });

          if (articles.length >= maxResults) break;
        }
        if (articles.length >= maxResults) break;
      }

      console.log(`[Twitter] Found ${articles.length} articles for "${query}"`);
      return articles;
    } catch (error) {
      console.warn('Twitter search failed:', (error as Error).message);
      if (axios.isAxiosError(error) && error.response) {
        console.warn('  Response:', JSON.stringify(error.response.data, null, 2));
      }
      return [];
    }
  }

  private isLowQualityUrl(url: string): boolean {
    const blocked = [
      'twitter.com',
      'x.com',
      't.co',
      'youtube.com',
      'youtu.be',
      'instagram.com',
      'tiktok.com',
      'facebook.com',
      'fb.me',
      'linkedin.com',
      'spotify.com',
      'apple.co',
      'amzn.to',
    ];
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return blocked.some((b) => hostname.includes(b));
    } catch {
      return true;
    }
  }

  private getMockResults(query: string, category: ArticleCategory, limit: number): Article[] {
    const mockData: Record<string, Article[]> = {
      'kids-audio': [
        {
          id: 'twitter-mock-1',
          title: 'New research on audio storytelling in early childhood',
          url: 'https://example.com/audio-research',
          source: 'Twitter',
          summary: 'A thread breaking down the latest study on how narrative audio improves vocabulary in 3-5 year olds. Key finding: 20 min/day of structured audio = +12% word retention.',
          category: 'kids-audio',
        },
      ],
      'educational-ai': [
        {
          id: 'twitter-mock-2',
          title: 'Teachers are using AI to personalise reading levels in real time',
          url: 'https://example.com/ai-reading',
          source: 'Twitter',
          summary: 'Thread on how 4th-grade teachers are using LLMs to adapt passage difficulty on the fly. Results after 6 weeks: 89% of students improved by at least one reading level.',
          category: 'educational-ai',
        },
      ],
      'podcasting': [
        {
          id: 'twitter-mock-3',
          title: 'Classroom podcast project goes district-wide',
          url: 'https://example.com/podcast-district',
          source: 'Twitter',
          summary: 'A teacher shared how her classroom podcast project expanded to 12 schools. Students produce weekly episodes on local history. Engagement up 40%.',
          category: 'podcasting',
        },
      ],
      'parenting-tips': [
        {
          id: 'twitter-mock-4',
          title: 'Screen-free dinner challenge results after 30 days',
          url: 'https://example.com/screen-free',
          source: 'Twitter',
          summary: 'Parenting thread on the 30-day no-screens-at-dinner experiment. Families reported better conversation quality and fewer tantrums at bedtime.',
          category: 'parenting-tips',
        },
      ],
    };

    return (mockData[category] || []).slice(0, limit);
  }
}
