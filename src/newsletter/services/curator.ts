import axios from 'axios';
import { Article, ArticleCategory, NewsletterSection } from '../types';

export type PersonaId = 'tech-savvy-educator' | 'screen-free-parent' | 'podcast-curious-creator';

export interface PersonaProfile {
  id: PersonaId;
  name: string;
  description: string;
  painPoints: string[];
  contentPreferences: string[];
  emailTone: string;
}

export interface PersonaScore {
  personaId: PersonaId;
  score: number; // 1-10
  reason: string;
}

export interface CuratedArticle extends Article {
  personaScores: PersonaScore[];
  averageScore: number;
  bestPersona: PersonaId;
}

export interface CurationResult {
  primaryPersona: PersonaId;
  subjectLine: string;
  subjectLineOptions: string[];
  intro: string;
  spotlight: Article | undefined;
  sections: NewsletterSection[];
  curationNotes: string;
  /** Audience tag per article ID: educator | parent | both */
  articleAudience: Record<string, 'educator' | 'parent' | 'both'>;
}

export interface CuratorConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  reasoningEffort?: 'low' | 'medium' | 'high' | 'max';
  maxArticlesPerSection?: number;
  forcePersona?: PersonaId | null;
}

const PERSONAS: Record<PersonaId, PersonaProfile> = {
  'tech-savvy-educator': {
    id: 'tech-savvy-educator',
    name: 'Tech-Savvy Educator',
    description: 'Teachers and school leaders actively looking for AI tools, classroom tech, and practical edtech implementations.',
    painPoints: [
      'Overwhelmed by too many edtech tools',
      'Needs proof that tools work in real classrooms',
      'Wants actionable guides, not hype',
      'Limited time to experiment',
    ],
    contentPreferences: [
      'AI tutoring and assessment tools',
      'Classroom podcasting guides',
      'Evidence-based edtech reviews',
      'Teacher workflow automation',
      'Student data privacy considerations',
    ],
    emailTone: 'Practical, direct, and evidence-based. Respect their intelligence and time.',
  },
  'screen-free-parent': {
    id: 'screen-free-parent',
    name: 'Screen-Free Parent',
    description: 'Parents seeking quality audio content and screen-free learning alternatives for their children.',
    painPoints: [
      'Worried about excessive screen time',
      'Struggling to find quality audio content',
      'Wants educational content that feels like fun',
      'Needs age-appropriate recommendations',
    ],
    contentPreferences: [
      'Interactive audio stories and apps',
      'Research on screen-time alternatives',
      'Parenting tips for digital balance',
      'Kids podcast recommendations',
      'Voice-based learning tools',
    ],
    emailTone: 'Warm, reassuring, and empowering. Acknowledge parenting challenges without being preachy.',
  },
  'podcast-curious-creator': {
    id: 'podcast-curious-creator',
    name: 'Podcast-Curious Creator',
    description: 'Educators and administrators interested in starting or improving classroom podcasts and audio storytelling.',
    painPoints: [
      'Unsure what equipment or platform to use',
      'Needs curriculum integration ideas',
      'Wants student podcasting success stories',
      'Looking for low-barrier entry points',
    ],
    contentPreferences: [
      'Podcast creation tools and platforms',
      'Student voice and storytelling projects',
      'Audio editing tutorials',
      'Classroom podcasting case studies',
      'Distribution and audience-building tips',
    ],
    emailTone: 'Encouraging and creative. Celebrate their initiative and lower the perceived barrier to entry.',
  },
};

export class Curator {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private reasoningEffort: string;
  private maxArticlesPerSection: number;
  private forcePersona: PersonaId | null;

  constructor(config: CuratorConfig = {}) {
    this.apiKey = config.apiKey || process.env.DEEPSEEK_API_KEY || '';
    this.baseUrl = config.baseUrl || 'https://api.deepseek.com';
    this.model = config.model || 'deepseek-chat';
    this.reasoningEffort = config.reasoningEffort || 'high';
    this.maxArticlesPerSection = config.maxArticlesPerSection || 7;
    this.forcePersona = config.forcePersona || null;

    if (!this.apiKey) {
      console.warn('⚠️  DEEPSEEK_API_KEY not set. Curator will fall back to basic selection.');
    }
  }

  /**
   * Curate newsletter content using DeepSeek V4.
   * Scores articles per persona, selects the best mix, generates subject lines and intro.
   */
  async curate(
    allArticles: Article[],
    issueNumber: number,
    date: string
  ): Promise<CurationResult> {
    if (!this.apiKey || allArticles.length === 0) {
      console.log('📋 Curator: falling back to basic selection (no API key or no articles)');
      return this.fallbackCuration(allArticles);
    }

    // Pre-filter to top candidates per category to keep prompt size manageable
    const preFiltered = this.preFilterArticles(allArticles, 8);

    console.log('🎯 Curating with DeepSeek...');
    console.log(`   Articles to evaluate: ${preFiltered.length} (filtered from ${allArticles.length})`);
    console.log(`   Model: ${this.model}`);
    console.log(`   Personas: ${Object.keys(PERSONAS).join(', ')}`);

    const prompt = this.buildPrompt(preFiltered, issueNumber, date);

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            { role: 'system', content: this.getSystemPrompt() },
            { role: 'user', content: prompt },
          ],
          max_tokens: 4096,
          temperature: 0.4,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      const fullContent = this.extractAndLogContent(response.data);
      const parsed = this.parseResponse(fullContent, allArticles);

      console.log(`   ✅ Primary persona: ${PERSONAS[parsed.primaryPersona].name}`);
      console.log(`   📝 Subject: "${parsed.subjectLine}"`);
      console.log(`   📊 Sections: ${parsed.sections.length}`);

      return parsed;
    } catch (error) {
      console.error('❌ DeepSeek curation failed:', (error as Error).message);
      if (axios.isAxiosError(error) && error.response) {
        console.error('   Response:', JSON.stringify(error.response.data, null, 2));
      }
      return this.fallbackCuration(allArticles);
    }
  }

  private extractAndLogContent(responseData: any): string {
    const content = responseData?.choices?.[0]?.message?.content || '';
    const reasoning = responseData?.choices?.[0]?.message?.reasoning_content || '';
    return (content + '\n' + reasoning).trim();
  }

  private getSystemPrompt(): string {
    return `You are an expert newsletter editor and audience strategist for "The Listen & Learn Weekly" — a newsletter about kids audio, podcasting, and educational AI.

Your job is to:
1. Score every article for relevance to 3 target personas
2. Select the best articles for each newsletter section
3. Generate compelling subject lines that drive opens
4. Write an editor's intro that hooks the primary persona

Rules:
- Be ruthless about quality. A weak article is worse than a short section.
- Subject lines must be specific, curiosity-driven, and under 60 characters.
- The intro should feel personal and reference the week's top story directly.
- Return ONLY valid JSON. No markdown code blocks, no extra text.`;
  }

  private buildPrompt(articles: Article[], issueNumber: number, date: string): string {
    const personaDescriptions = Object.values(PERSONAS)
      .map(
        (p) => `
### ${p.name} (${p.id})
${p.description}
Pain points: ${p.painPoints.join(', ')}
Content preferences: ${p.contentPreferences.join(', ')}
Tone: ${p.emailTone}`
      )
      .join('\n');

    const articlesJson = articles.map((a) => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      category: a.category,
      source: a.source,
      url: a.url,
    }));

    return `Newsletter Issue #${issueNumber} — ${date}

## Target Personas
${personaDescriptions}

## Available Articles (${articles.length})
${JSON.stringify(articlesJson, null, 2)}

## Instructions

IMPORTANT: Every issue serves BOTH educators and parents. The primary persona determines spotlight emphasis and subject line angle — but the issue must have valuable content for ALL audiences.

IMPORTANT: Reject press releases, product announcements, and corporate PR. Select only genuine articles: reporting, analysis, reviews, research, opinion pieces, and practical guides. If an article reads like a company announcement ("X announces Y", "launches new product", "partners with Z"), exclude it unless it contains substantial independent analysis.

1. **Score each article** 1-10 for each persona. Consider: Does it match their pain points? Is it actionable? Is it fresh and interesting? Is it a real article (not PR)?

2. **Pick a primary persona** for this issue based on which persona has the highest-quality, most relevant content overall. ${this.forcePersona ? `FORCE PRIMARY PERSONA: ${this.forcePersona}` : ''}

3. **Tag each selected article with its audience**: "educator" (best for tech-savvy-educator), "parent" (best for screen-free-parent), or "both" (equally relevant). Use the persona scores to decide.

4. **Select articles per section** (max ${this.maxArticlesPerSection} each). Aim for a balanced mix — every issue should serve educators AND parents. Skip low-quality or PR articles rather than fill slots:
   - kids-audio → "🎧 Kids Audio & Stories"
   - educational-ai → "🤖 Educational AI"
   - podcasting → "🎙️ Podcasting Resources"
   - parenting-tips → "👨‍👩‍👧 Parenting Tips" (include if quality exists)

5. **Pick a spotlight article** — the single most compelling article for the primary persona.

6. **Generate 3 subject line options** (under 50 chars each, no emojis):
   - Option A: Curiosity gap (e.g., "The screen-free trick teachers love")
   - Option B: Specific benefit + number (e.g., "3 tools that cut lesson prep in half")
   - Option C: Counter-intuitive or contrarian (e.g., "Why kids learn faster without screens")
   Rules: No generic phrases like "Weekly Roundup" or "This Week In". No publication names. Make people NEED to open. Pick the strongest as the primary subject line.

7. **Write an editor's intro** (2-3 sentences) that:
   - Opens by addressing BOTH educators and parents as the core audience
   - Emphasizes the primary persona's angle as "this week's focus" while assuring the other audience they will find value too
   - References the spotlight article
   - Feels welcoming and inclusive, not exclusive

8. **Write curationNotes** explaining why you chose the primary persona and how the mix serves both audiences.

## Output Format
Return ONLY this JSON structure:
{
  "primaryPersona": "tech-savvy-educator|screen-free-parent|podcast-curious-creator",
  "subjectLine": "Best subject line",
  "subjectLineOptions": ["Option A", "Option B", "Option C"],
  "intro": "Editor intro text...",
  "spotlightId": "article-id-or-null",
  "selectedIds": {
    "kids-audio": ["id1", "id2"],
    "educational-ai": ["id3"],
    "podcasting": ["id4", "id5"],
    "parenting-tips": ["id6"]
  },
  "articleAudience": {
    "id1": "educator",
    "id2": "both",
    "id3": "parent"
  },
  "scores": [
    {
      "articleId": "id1",
      "personaScores": {
        "tech-savvy-educator": 8,
        "screen-free-parent": 5,
        "podcast-curious-creator": 6
      },
      "bestPersona": "tech-savvy-educator"
    }
  ],
  "curationNotes": "I chose tech-savvy-educator because..."
}`;
  }

  private parseResponse(content: string, allArticles: Article[]): CurationResult {
    // DeepSeek V4 may return reasoning_content mixed with content.
    // Strip any <think> blocks or reasoning markers first.
    let cleaned = content
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/< reasoning >[\s\S]*?<\/ reasoning >/g, '');

    // Extract JSON from response
    let jsonStr = cleaned;

    // Try markdown code block first
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
      // Try to find the outermost JSON object
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
      }
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Last resort: try every `{...}` substring
      const objMatches = cleaned.match(/\{[\s\S]*?\}/g);
      if (objMatches) {
        for (const m of objMatches) {
          try {
            parsed = JSON.parse(m);
            if (parsed.primaryPersona || parsed.subjectLine) break;
          } catch {
            continue;
          }
        }
      }
      if (!parsed) {
        throw new Error('No JSON object found in DeepSeek response');
      }
    }

    // Validate primary persona
    const validPersonas: PersonaId[] = ['tech-savvy-educator', 'screen-free-parent', 'podcast-curious-creator'];
    const primaryPersona: PersonaId = validPersonas.includes(parsed.primaryPersona)
      ? parsed.primaryPersona
      : 'tech-savvy-educator';

    // Build article lookup
    const articleMap = new Map(allArticles.map((a) => [a.id, a]));

    // Build sections from selected IDs
    const sectionConfig: { category: ArticleCategory; title: string; description: string }[] = [
      {
        category: 'kids-audio',
        title: '🎧 Kids Audio & Stories',
        description: 'The best audio content, apps, and stories for children.',
      },
      {
        category: 'educational-ai',
        title: '🤖 Educational AI',
        description: 'AI tools and trends transforming how kids learn.',
      },
      {
        category: 'podcasting',
        title: '🎙️ Podcasting Resources',
        description: 'Tips and tools for creating or discovering great podcasts.',
      },
    ];

    const selectedIds: Record<string, string[]> = parsed.selectedIds || {};

    const sections: NewsletterSection[] = [];
    for (const config of sectionConfig) {
      const ids = selectedIds[config.category] || [];
      const sectionArticles = ids
        .map((id: string) => articleMap.get(id))
        .filter((a): a is Article => a !== undefined);

      if (sectionArticles.length > 0) {
        sections.push({
          title: config.title,
          description: config.description,
          articles: sectionArticles.slice(0, this.maxArticlesPerSection),
        });
      }
    }

    // Add parenting section if selected
    const parentingIds = selectedIds['parenting-tips'] || [];
    const parentingArticles = parentingIds
      .map((id: string) => articleMap.get(id))
      .filter((a): a is Article => a !== undefined);
    if (parentingArticles.length > 0) {
      sections.push({
        title: '👨‍👩‍👧 Parenting Tips',
        description: 'Practical advice for parents navigating screen-free learning and educational tech.',
        articles: parentingArticles.slice(0, this.maxArticlesPerSection),
      });
    }

    // Get spotlight
    const spotlight = parsed.spotlightId
      ? articleMap.get(parsed.spotlightId) || undefined
      : undefined;

    return {
      primaryPersona,
      subjectLine: parsed.subjectLine || `The audio learning trick parents swear by`,
      subjectLineOptions: parsed.subjectLineOptions || [],
      intro: parsed.intro || '',
      spotlight,
      sections,
      curationNotes: parsed.curationNotes || '',
      articleAudience: parsed.articleAudience || {},
    };
  }

  private fallbackCuration(allArticles: Article[]): CurationResult {
    // Group articles by category
    const byCategory = new Map<ArticleCategory, Article[]>();
    for (const article of allArticles) {
      const list = byCategory.get(article.category) || [];
      list.push(article);
      byCategory.set(article.category, list);
    }

    const sections: NewsletterSection[] = [
      {
        title: '🎧 Kids Audio & Stories',
        description: 'The best audio content, apps, and stories for children.',
        articles: (byCategory.get('kids-audio') || []).slice(0, this.maxArticlesPerSection),
      },
      {
        title: '🤖 Educational AI',
        description: 'AI tools and trends transforming how kids learn.',
        articles: (byCategory.get('educational-ai') || []).slice(0, this.maxArticlesPerSection),
      },
      {
        title: '🎙️ Podcasting Resources',
        description: 'Tips and tools for creating or discovering great podcasts.',
        articles: (byCategory.get('podcasting') || []).slice(0, this.maxArticlesPerSection),
      },
    ];

    const parentingArticles = byCategory.get('parenting-tips') || [];
    if (parentingArticles.length > 0) {
      sections.push({
        title: '👨‍👩‍👧 Parenting Tips',
        description: 'Practical advice for parents navigating screen-free learning and educational tech.',
        articles: parentingArticles.slice(0, this.maxArticlesPerSection),
      });
    }

    // Remove empty sections
    const nonEmptySections = sections.filter((s) => s.articles.length > 0);

    // Pick spotlight from first available article
    const spotlight = allArticles[0];

    return {
      primaryPersona: 'tech-savvy-educator',
      subjectLine: `The audio learning trick parents swear by`,
      subjectLineOptions: [],
      intro: `Welcome! This week we explore the latest in kids audio content, podcasting tools for families, and AI innovations shaping education.`,
      spotlight,
      sections: nonEmptySections,
      curationNotes: 'Fallback curation — DeepSeek API unavailable.',
      articleAudience: {},
    };
  }

  getPersonaProfile(personaId: PersonaId): PersonaProfile {
    return PERSONAS[personaId];
  }

  getAllPersonas(): PersonaProfile[] {
    return Object.values(PERSONAS);
  }

  /**
   * Pre-filter articles to top N per category to keep the prompt
   * size manageable for the LLM.
   */
  private preFilterArticles(articles: Article[], maxPerCategory: number): Article[] {
    const byCategory = new Map<ArticleCategory, Article[]>();
    for (const a of articles) {
      const list = byCategory.get(a.category) || [];
      list.push(a);
      byCategory.set(a.category, list);
    }

    const result: Article[] = [];
    for (const [, list] of byCategory) {
      // Simple heuristic: prefer articles with longer summaries (more substance)
      const sorted = [...list].sort((a, b) => (b.summary?.length || 0) - (a.summary?.length || 0));
      result.push(...sorted.slice(0, maxPerCategory));
    }

    return result;
  }
}
