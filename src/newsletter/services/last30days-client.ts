import * as fs from 'fs';
import * as path from 'path';
import { Article, ArticleCategory } from '../types';

interface Last30DaysBrief {
  topic: string;
  synthesis: string;
  sources: Array<{
    platform: string;
    url: string;
    title: string;
    snippet: string;
  }>;
}

export class Last30DaysClient {
  private memoryDir: string;

  constructor() {
    this.memoryDir = process.env.LAST30DAYS_MEMORY_DIR || path.join(process.env.HOME || '', 'Documents', 'Last30Days');
  }

  /**
   * Read a last30days HTML brief file and extract articles from it.
   * The brief files are typically saved as `{topic}-brief.html` in the memory directory.
   */
  async readBrief(topic: string): Promise<Article[]> {
    const safeTopic = topic.replace(/[^a-zA-Z0-9_-]/g, '_');
    const possiblePaths = [
      path.join(this.memoryDir, `${safeTopic}-brief.html`),
      path.join(this.memoryDir, `${topic}-brief.html`),
      path.join(process.cwd(), 'data', 'last30days', `${safeTopic}-brief.html`),
      path.join(process.cwd(), 'data', 'last30days', `${topic}-brief.html`),
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          return this.parseBriefHtml(content, topic);
        } catch (error) {
          console.warn(`Failed to read brief at ${filePath}:`, (error as Error).message);
        }
      }
    }

    console.log(`[Last30Days] No brief file found for topic: ${topic}`);
    return [];
  }

  /**
   * List all available brief files in the memory directory.
   */
  listAvailableBriefs(): string[] {
    const briefs: string[] = [];

    const dirs = [this.memoryDir, path.join(process.cwd(), 'data', 'last30days')];

    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          const briefFiles = files
            .filter((f) => f.endsWith('-brief.html'))
            .map((f) => f.replace('-brief.html', ''));
          briefs.push(...briefFiles);
        } catch {
          // Ignore read errors
        }
      }
    }

    return [...new Set(briefs)];
  }

  private parseBriefHtml(html: string, topic: string): Article[] {
    const articles: Article[] = [];

    // Extract links from the brief - look for anchor tags with hrefs
    const linkRegex = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    const seenUrls = new Set<string>();

    while ((match = linkRegex.exec(html)) !== null) {
      const url = match[1];
      const text = match[2].trim();

      if (seenUrls.has(url)) continue;
      seenUrls.add(url);

      // Skip navigation/internal links
      if (url.includes('github.com/mvanhorn') || url.includes('last30days')) continue;

      articles.push({
        id: `l30d-${Buffer.from(url).toString('base64').substring(0, 16)}`,
        title: text || `Link from ${topic} brief`,
        url,
        source: 'Last30Days Research',
        summary: `Found in last30days research on "${topic}".`,
        category: this.inferCategory(topic),
      });
    }

    return articles;
  }

  private inferCategory(topic: string): ArticleCategory {
    const lower = topic.toLowerCase();
    if (lower.includes('audio') || lower.includes('sound') || lower.includes('music')) return 'kids-audio';
    if (lower.includes('podcast')) return 'podcasting';
    if (lower.includes('ai') || lower.includes('education') || lower.includes('learning')) return 'educational-ai';
    if (lower.includes('parent')) return 'parenting-tips';
    return 'general';
  }
}
