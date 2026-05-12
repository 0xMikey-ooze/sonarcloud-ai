import { Article, ArticleCategory, NewsletterSection, NewsletterIssue } from '../types';
import { TinyFishClient } from './tinyfish-client';
import { PerplexityClient } from './perplexity-client';
import { ExaClient } from './exa-client';

export interface AggregationConfig {
  exaEnabled?: boolean;
  tinyfishEnabled?: boolean;
  perplexityEnabled?: boolean;
  maxArticlesPerSection?: number;
  enrichWithTinyFish?: boolean;
}

const DEFAULT_LAST30DAYS_TOPICS = [
  'kids podcasting',
  'educational AI',
  'children audio apps',
  'AI parenting tools',
  'classroom podcasting',
];

export interface GatheredArticles {
  allArticles: Article[];
  byCategory: {
    'kids-audio': Article[];
    'educational-ai': Article[];
    'podcasting': Article[];
    'parenting-tips': Article[];
  };
  issueNumber: number;
  date: string;
}

export class ContentAggregator {
  private exa: ExaClient;
  private tinyfish: TinyFishClient;
  private perplexity: PerplexityClient;

  constructor() {
    this.exa = new ExaClient();
    this.tinyfish = new TinyFishClient();
    this.perplexity = new PerplexityClient();
  }

  /**
   * Gather all articles from all sources without slicing.
   * Returns the full pool for AI curation.
   */
  async gatherAll(config: AggregationConfig = {}): Promise<GatheredArticles> {
    const raw = await this.gatherRaw(config);

    // Filter out press releases before deduplication
    const filterPR = (articles: Article[]): Article[] => {
      return articles.filter((a) => !isPressRelease(a));
    };

    // Deduplicate by URL
    const dedupe = (articles: Article[]): Article[] => {
      const seen = new Set<string>();
      return articles.filter((a) => {
        if (seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
      });
    };

    const kidsAudio = dedupe(filterPR(raw.kidsAudioArticles));
    const edAi = dedupe(filterPR(raw.educationalAiArticles));
    const podcasting = dedupe(filterPR(raw.podcastingArticles));
    const parenting = dedupe(filterPR(raw.parentingTipsArticles));

    // Enrich weak summaries
    const { tinyfishEnabled = true, enrichWithTinyFish = true } = config;
    if (tinyfishEnabled && enrichWithTinyFish) {
      console.log('✨ Enriching article summaries with TinyFish...');
      await this.tinyfish.enrichArticles(kidsAudio, 2);
      await this.tinyfish.enrichArticles(edAi, 2);
      await this.tinyfish.enrichArticles(podcasting, 2);
      await this.tinyfish.enrichArticles(parenting, 2);
    }

    const allArticles = [...kidsAudio, ...edAi, ...podcasting, ...parenting];
    const now = new Date();

    const prFilteredCount = raw.kidsAudioArticles.length + raw.educationalAiArticles.length + raw.podcastingArticles.length + raw.parentingTipsArticles.length - allArticles.length;
    if (prFilteredCount > 0) {
      console.log(`   🚫 Filtered ${prFilteredCount} press release(s)`);
    }

    console.log(`\n✅ Content gathered (pre-curation):`);
    console.log(`   🎧 Kids Audio: ${kidsAudio.length} articles`);
    console.log(`   🤖 Educational AI: ${edAi.length} articles`);
    console.log(`   🎙️ Podcasting: ${podcasting.length} articles`);
    console.log(`   👨‍👩‍👧 Parenting Tips: ${parenting.length} articles`);
    console.log(`   📊 Total: ${allArticles.length} articles\n`);

    return {
      allArticles,
      byCategory: {
        'kids-audio': kidsAudio,
        'educational-ai': edAi,
        'podcasting': podcasting,
        'parenting-tips': parenting,
      },
      issueNumber: this.getWeekNumber(now),
      date: now.toISOString().split('T')[0],
    };
  }

  private async gatherRaw(config: AggregationConfig = {}) {
    const {
      exaEnabled = true,
      tinyfishEnabled = true,
      perplexityEnabled = true,
    } = config;

    const enabledList = [
      exaEnabled && this.exa.isEnabled ? 'Exa (neural)' : null,
      tinyfishEnabled ? 'TinyFish' : null,
      perplexityEnabled ? 'Perplexity' : null,
    ].filter(Boolean).join(' + ');

    console.log('🔍 Aggregating content for newsletter...');
    console.log(`   Sources: ${enabledList || '(none enabled)'}`);
    console.log('');

    const kidsAudioArticles: Article[] = [];
    const educationalAiArticles: Article[] = [];
    const podcastingArticles: Article[] = [];
    const parentingTipsArticles: Article[] = [];

    // Primary: Exa neural search (fresh content from last 14 days)
    if (exaEnabled && this.exa.isEnabled) {
      console.log('🧠 Querying Exa (neural, last 14 days)...');
      kidsAudioArticles.push(...await this.exa.search('latest news about kids audio platforms, audiobooks, and screen-free listening for children', 'kids-audio', 8));
      educationalAiArticles.push(...await this.exa.search('latest news about AI tools and tutoring in K-5 elementary classrooms', 'educational-ai', 8));
      podcastingArticles.push(...await this.exa.search('latest news about kids podcasts and podcast curricula in schools', 'podcasting', 6));
      parentingTipsArticles.push(...await this.exa.search('recent guidance for parents on audio learning and screen-free education', 'parenting-tips', 4));
    }

    // Fallback: TinyFish (skipped if Exa already returned plenty)
    if (tinyfishEnabled && kidsAudioArticles.length < 4) {
      console.log('🐟 Falling back to TinyFish AI...');
      kidsAudioArticles.push(...await this.tinyfish.search('kids audio podcasting children educational stories', 'kids-audio', 6));
      educationalAiArticles.push(...await this.tinyfish.search('educational AI tools teachers students classroom learning', 'educational-ai', 6));
      podcastingArticles.push(...await this.tinyfish.search('podcasting education classroom student podcast creation tools', 'podcasting', 6));
      parentingTipsArticles.push(...await this.tinyfish.search('parenting tips screen free audio learning children education', 'parenting-tips', 4));
    }

    // Fallback: Perplexity (skipped if Exa already returned plenty)
    if (perplexityEnabled && educationalAiArticles.length < 4) {
      console.log('🔮 Falling back to Perplexity...');
      kidsAudioArticles.push(...await this.perplexity.search('latest kids audio content apps stories 2026', 'kids-audio', 4));
      educationalAiArticles.push(...await this.perplexity.search('educational AI tools classroom learning 2026', 'educational-ai', 4));
      podcastingArticles.push(...await this.perplexity.search('podcasting education classroom tools 2026', 'podcasting', 4));
      parentingTipsArticles.push(...await this.perplexity.search('screen free parenting tips audio learning 2026', 'parenting-tips', 4));
    }

    return { kidsAudioArticles, educationalAiArticles, podcastingArticles, parentingTipsArticles };
  }

  async aggregate(config: AggregationConfig = {}): Promise<NewsletterIssue> {
    const { maxArticlesPerSection = 7 } = config;

    const gathered = await this.gatherAll(config);
    const { byCategory, issueNumber, date } = gathered;

    // Slice to max per section (legacy behavior)
    const kidsAudio = byCategory['kids-audio'].slice(0, maxArticlesPerSection);
    const edAi = byCategory['educational-ai'].slice(0, maxArticlesPerSection);
    const podcasting = byCategory['podcasting'].slice(0, maxArticlesPerSection);
    const parenting = byCategory['parenting-tips'].slice(0, maxArticlesPerSection);

    const spotlight = edAi[0] || kidsAudio[0] || podcasting[0] || undefined;

    const intro = `Welcome to Issue #${issueNumber}! This week we explore the latest in kids audio content, podcasting tools for families, and AI innovations shaping education. Whether you are a teacher looking for classroom resources or a parent seeking quality screen-free content, we have got you covered.`;

    const sections: NewsletterSection[] = [
      { title: '🎧 Kids Audio & Stories', description: 'The best audio content, apps, and stories for children.', articles: kidsAudio },
      { title: '🤖 Educational AI', description: 'AI tools and trends transforming how kids learn.', articles: edAi },
      { title: '🎙️ Podcasting Resources', description: 'Tips and tools for creating or discovering great podcasts.', articles: podcasting },
    ];

    if (parenting.length > 0) {
      sections.push({ title: '👨‍👩‍👧 Parenting Tips', description: 'Practical advice for parents navigating screen-free learning and educational tech.', articles: parenting });
    }

    return {
      issueNumber,
      date,
      title: 'The Listen & Learn Weekly',
      subtitle: 'Kids Audio, Podcasting & Educational AI for Educators and Parents',
      intro,
      spotlight,
      sections,
      footerNote: 'Have feedback or want to suggest a topic? Reply to this email — we read every message.',
    };
  }

  private getWeekNumber(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
  }
}

/**
 * Detect press releases by URL domain, title patterns, and content markers.
 * Returns true if the article appears to be a PR piece.
 */
export function isPressRelease(article: Article): boolean {
  const url = article.url.toLowerCase();
  const title = article.title.toLowerCase();
  const summary = (article.summary || '').toLowerCase();
  const combined = `${title} ${summary}`;

  // PR wire domains
  const prDomains = [
    'prnewswire.com',
    'businesswire.com',
    'globenewswire.com',
    'accesswire.com',
    'newsfilecorp.com',
    'einnews.com',
    'benzinga.com',
    'markets.businessinsider.com',
    'finance.yahoo.com/news/',
    'apnews.com/press-release',
    'reuters.com/business/',
    'bloomberg.com/press-releases',
  ];
  if (prDomains.some((d) => url.includes(d))) return true;

  // Title patterns — corporate announcement language
  const prTitlePatterns = [
    /^\s*press release/i,
    /^\s*for immediate release/i,
    /\bannounces?\b.*\blaunch/i,
    /\bannounces?\b.*\bpartnership/i,
    /\bannounces?\b.*\bacquisition/i,
    /\bannounces?\b.*\bfunding/i,
    /\bannounces?\b.*\bseries [a-z]/i,
    /\bannounces?\b.*\bnew platform/i,
    /\bannounces?\b.*\bexpansion/i,
    /\bintroduces?\b.*\bnew/i,
    /\blaunches?\b.*\bnew/i,
    /\bunveils?\b.*\bnew/i,
    /\bdebut(s|ed|ing)?\b/i,
    /\bteams (up|with)\b/i,
    /\bpartners (with|to)\b/i,
    /\bacquires?\b/i,
    /\bmerges? (with|and)\b/i,
    /\braises?\b.*\b\$\d+/i,
    /\bsecures?\b.*\b\$\d+/i,
    /\bfunding round/i,
    /\bseries [a-z]\b.*\bfunding/i,
    /\binvestment round/i,
    /\bipo\b/i,
    /\binitial public offering/i,
    /\bstock\b.*\bexchange/i,
    /\bshareholder/i,
    /\bquarterly earnings?/i,
    /\bfiscal (year|quarter)/i,
    /\brevenue (growth|increase)/i,
    /\bgrowth (momentum|trajectory)/i,
    /\bmarket (leader|leading)/i,
    /\bindustry.?leading/i,
    /\baward.?(winning|winner)/i,
    /\brecognized (as|by|for)\b/i,
    /\bnamed (to|among|a)\b/i,
    /\btop \d+ (list|company|startup)/i,
    /\binnovation award/i,
    /\bexcellence award/i,
    /\bachievement award/i,
  ];
  if (prTitlePatterns.some((p) => p.test(title))) return true;

  // Content markers — PR boilerplate language
  const prContentMarkers = [
    'is pleased to announce',
    'we are excited to announce',
    'today announced',
    'proud to announce',
    'delighted to announce',
    'thrilled to announce',
    'announced today that',
    'forward-looking statements',
    'safe harbor',
    'about the company',
    'media contact',
    'investor relations',
    'for more information, please contact',
    'this press release contains',
    'disclaimer: this press release',
    'the company (also )?provides',
    'headquartered in',
    'founded in',
    'leading provider of',
    'pioneer in',
  ];
  if (prContentMarkers.some((m) => combined.includes(m))) return true;

  return false;
}
