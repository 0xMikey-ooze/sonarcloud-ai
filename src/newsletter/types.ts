export type ArticleCategory = 'kids-audio' | 'educational-ai' | 'podcasting' | 'parenting-tips' | 'general';

export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  category: ArticleCategory;
  publishedAt?: string;
  author?: string;
  imageUrl?: string;
}

export interface NewsletterSection {
  title: string;
  description?: string;
  articles: Article[];
}

export interface NewsletterIssue {
  issueNumber: number;
  date: string;
  title: string;
  subtitle: string;
  intro: string;
  sections: NewsletterSection[];
  spotlight?: Article;
  footerNote?: string;
  /** AI-curated subject line for the email */
  subjectLine?: string;
  /** Primary persona this issue was curated for */
  primaryPersona?: 'tech-savvy-educator' | 'screen-free-parent' | 'podcast-curious-creator';
  /** Audience tag for each article: 'educator' | 'parent' | 'both' */
  articleAudience?: Record<string, 'educator' | 'parent' | 'both'>;
}

export interface SendNewsletterParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface ContentSource {
  name: string;
  search: (query: string) => Promise<Article[]>;
}
