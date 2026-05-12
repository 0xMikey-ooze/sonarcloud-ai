import Exa from 'exa-js';
import { Article, ArticleCategory } from '../types';

/**
 * Exa client — primary content discovery for the newsletter.
 * Uses neural (semantic) search with content extraction. Falls back to
 * keyword search if neural returns nothing.
 *
 * Docs: https://docs.exa.ai
 */
export class ExaClient {
  private exa: Exa | null;
  private enabled: boolean;

  constructor() {
    const key = process.env.EXA_API_KEY;
    this.enabled = !!key;
    this.exa = this.enabled ? new Exa(key) : null;
  }

  /**
   * Run a neural-search-with-contents query for a given topic and return
   * normalized Article rows for the aggregator.
   *
   * Filters: published within the last 14 days (so the issue stays fresh).
   */
  async search(query: string, category: ArticleCategory, limit = 8): Promise<Article[]> {
    if (!this.enabled || !this.exa) return [];

    const startPublishedDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    try {
      const res = await this.exa.searchAndContents(query, {
        type: 'neural',
        numResults: limit,
        startPublishedDate,
        useAutoprompt: true,
        text: { maxCharacters: 1500 },
      });

      const out: Article[] = (res.results || []).map((r: any): Article => ({
        id: `exa-${Buffer.from(r.url).toString('base64').substring(0, 16)}`,
        title: (r.title || '').trim(),
        url: r.url,
        summary: this.summarize(r.text || r.summary || ''),
        source: this.hostname(r.url) || r.author || 'web',
        author: r.author || undefined,
        publishedAt: r.publishedDate || undefined,
        category,
        imageUrl: r.image || undefined,
      })).filter((a: Article) => !!a.title && !!a.url);

      return out;
    } catch (e: any) {
      console.error(`Exa search failed for "${query}":`, e?.message || e);
      return [];
    }
  }

  /**
   * Given a URL the reader engaged with last week, find similar fresh stories.
   * Useful for continuing a thread across issues.
   */
  async findSimilar(url: string, category: ArticleCategory, limit = 4): Promise<Article[]> {
    if (!this.enabled || !this.exa) return [];

    try {
      const res = await this.exa.findSimilarAndContents(url, {
        numResults: limit,
        excludeSourceDomain: true,
        text: { maxCharacters: 1500 },
      });

      return (res.results || []).map((r: any): Article => ({
        id: `exa-sim-${Buffer.from(r.url).toString('base64').substring(0, 16)}`,
        title: (r.title || '').trim(),
        url: r.url,
        summary: this.summarize(r.text || ''),
        source: this.hostname(r.url) || 'web',
        author: r.author || undefined,
        publishedAt: r.publishedDate || undefined,
        category,
        imageUrl: r.image || undefined,
      })).filter((a: Article) => !!a.title && !!a.url);
    } catch (e: any) {
      console.error(`Exa findSimilar failed for ${url}:`, e?.message || e);
      return [];
    }
  }

  private summarize(text: string): string {
    if (!text) return '';
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= 280) return clean;
    const cut = clean.slice(0, 280);
    const lastDot = cut.lastIndexOf('.');
    return (lastDot > 100 ? cut.slice(0, lastDot + 1) : cut) + (clean.length > cut.length ? '…' : '');
  }

  private hostname(url: string): string {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }

  get isEnabled() {
    return this.enabled;
  }
}
