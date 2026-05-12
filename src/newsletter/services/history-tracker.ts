import * as fs from 'fs';
import * as path from 'path';

interface HistoryEntry {
  url: string;
  title: string;
  sentAt: string;
  issueNumber: number;
}

interface HistoryFile {
  articles: HistoryEntry[];
}

export class HistoryTracker {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'output', 'sent-articles.json');
  }

  /** Load all previously sent article URLs */
  loadSentUrls(): Set<string> {
    if (!fs.existsSync(this.filePath)) {
      return new Set();
    }
    try {
      const data: HistoryFile = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      return new Set(data.articles.map((a) => a.url));
    } catch {
      return new Set();
    }
  }

  /** Filter out articles that have been sent before */
  filterNew<T extends { url: string }>(articles: T[]): T[] {
    const sent = this.loadSentUrls();
    return articles.filter((a) => !sent.has(a.url));
  }

  /** Record articles as sent */
  recordSent(articles: Array<{ url: string; title: string }>, issueNumber: number): void {
    const existing: HistoryFile = fs.existsSync(this.filePath)
      ? JSON.parse(fs.readFileSync(this.filePath, 'utf8'))
      : { articles: [] };

    const now = new Date().toISOString();
    const newEntries: HistoryEntry[] = articles.map((a) => ({
      url: a.url,
      title: a.title,
      sentAt: now,
      issueNumber,
    }));

    // Merge and dedupe by URL (keep earliest send)
    const merged = new Map<string, HistoryEntry>();
    for (const a of existing.articles) merged.set(a.url, a);
    for (const a of newEntries) {
      if (!merged.has(a.url)) merged.set(a.url, a);
    }

    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify({ articles: Array.from(merged.values()) }, null, 2));
  }

  getStats(): { totalSent: number; lastSentAt: string | null } {
    const data = fs.existsSync(this.filePath)
      ? JSON.parse(fs.readFileSync(this.filePath, 'utf8'))
      : { articles: [] };
    return {
      totalSent: data.articles.length,
      lastSentAt: data.articles.length > 0
        ? data.articles[data.articles.length - 1].sentAt
        : null,
    };
  }
}
