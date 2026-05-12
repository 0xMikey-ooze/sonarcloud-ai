import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import { Resend } from 'resend';
import { ContentAggregator } from '../services/content-aggregator';
import { Curator } from '../services/curator';
import { HistoryTracker } from '../services/history-tracker';
import { extractImage } from '../services/image-extractor';
import { Article, NewsletterIssue } from '../types';

async function renderPremiumHtml(issue: NewsletterIssue, subjectLine: string): Promise<string> {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const issueNum = String(issue.issueNumber).padStart(3, '0');

  // Pick spotlight and field notes
  const spotlight = issue.spotlight;
  const fieldArticles = issue.sections
    .flatMap((s) => s.articles)
    .filter((a) => a.id !== spotlight?.id)
    .slice(0, 6);

  const totalSignals = issue.sections.reduce((sum, s) => sum + s.articles.length, 0);
  const readTime = Math.max(5, Math.round(totalSignals * 0.7));

  // Extract images for field articles
  const articlesWithImages = await Promise.all(
    fieldArticles.map(async (article) => ({
      ...article,
      imageUrl: article.imageUrl || (await extractImage(article.url)),
    }))
  );

  // Persona display mapping
  const personaLabel = issue.primaryPersona
    ? {
        'tech-savvy-educator': 'Educators',
        'screen-free-parent': 'Parents',
        'podcast-curious-creator': 'Creators',
      }[issue.primaryPersona]
    : null;

  // Build article list HTML
  let articlesHtml = '';
  articlesWithImages.forEach((article, idx) => {
    const num = String(idx + 2).padStart(2, '0');
    const categoryTag = article.category
      .replace(/-/g, '_')
      .toUpperCase();
    const thumbHtml = article.imageUrl
      ? `<td class="article-thumb" valign="top" style="width:96px;vertical-align:top;line-height:0;font-size:0;padding-right:16px;">
           <a href="${article.url}" style="text-decoration:none;display:block;">
             <img src="${article.imageUrl}" width="96" height="96" alt="${escapeHtml(article.title)}" onerror="this.style.display='none';this.parentNode.parentNode.style.display='none';" style="display:block;width:96px;height:96px;border:0;outline:none;border-radius:12px;object-fit:cover;">
           </a>
         </td>`
      : '';
    const contentWidth = article.imageUrl ? '' : 'width:100%;';
    const audience = issue.articleAudience?.[article.id];
    const audienceTag = audience
      ? `<span style="display:inline-block;font-family:'Courier New',Courier,monospace;font-size:10px;color:#FFFFFF;background-color:${audience === 'educator' ? '#3A86FF' : audience === 'parent' ? '#F55C47' : '#00D084'};border-radius:999px;padding:2px 8px;margin-left:8px;letter-spacing:0.5px;text-transform:uppercase;vertical-align:middle;line-height:1;">${audience}</span>`
      : '';
    articlesHtml += `
      <!-- Entry ${num} -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="article-pad" style="padding:20px 0 20px 0;${idx < articlesWithImages.length - 1 ? 'border-bottom:1px solid #DADADA;' : ''}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${thumbHtml}
                <td ${contentWidth} valign="top" style="vertical-align:top;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td class="mono" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#222222;letter-spacing:0;line-height:1.6;padding-right:10px;vertical-align:middle;">${num}</td>
                      <td class="mono" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#3A86FF;letter-spacing:0;text-transform:uppercase;vertical-align:middle;line-height:1.6;">[ ${categoryTag} ]</td>
                      ${audienceTag ? `<td>${audienceTag}</td>` : ''}
                    </tr>
                  </table>
                  <h3 style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:600;line-height:1.4;color:#222222;margin:8px 0 6px 0;">
                    <a href="${article.url}" class="dark-text" style="color:#222222;text-decoration:none;">${escapeHtml(article.title)}</a>
                  </h3>
                  <p class="body-text dark-text-secondary" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#363636;margin:0 0 8px 0;">
                    ${escapeHtml(article.summary)}
                  </p>
                  ${audience === 'parent' ? `
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:10px 0 0 0;">
                    <tr>
                      <td style="background-color:#FFF8F0;border-left:3px solid #F55C47;border-radius:0 4px 4px 0;padding:10px 14px;">
                        <p class="mono" style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#F55C47;margin:0 0 4px 0;letter-spacing:0.5px;text-transform:uppercase;">◆ Try this at home</p>
                        <p class="body-text" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.4;color:#363636;margin:0;">This one has a practical takeaway you can try with your family this week.</p>
                      </td>
                    </tr>
                  </table>` : ''}
                  <!-- source removed -->
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  });

  // Spotlight HTML
  const spotlightHtml = spotlight
    ? `
      <h2 class="heading-xl" style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;line-height:1.3;color:#222222;margin:0 0 12px 0;letter-spacing:0;">
        <a href="${spotlight.url}" style="color:#222222;text-decoration:none;">${escapeHtml(spotlight.title)}</a>
      </h2>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.55;color:#363636;margin:0;">
        ${escapeHtml(spotlight.summary)}
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0 0;">
        <tr>
          <td class="mono" style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;color:#FFFFFF;background-color:#00D084;border:none;border-radius:999px;padding:6px 12px;letter-spacing:1px;text-transform:uppercase;box-shadow:0 2px 4px rgba(0,208,132,0.2);">
            <span style="color:#00D084;font-weight:700;">SPOTLIGHT</span>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
        <tr><td style="border-top:1px solid #DADADA;line-height:0;font-size:0;height:0;">&nbsp;</td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
        <tr>
          <td class="mono" align="left" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;letter-spacing:0;">
            FEATURED
          </td>
          <td align="right">
            <a href="${spotlight.url}" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.5px;color:#3A86FF;text-decoration:none;">Read →</a>
          </td>
        </tr>
      </table>
    `
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <title>The Listen & Learn Weekly · Issue ${issueNum}</title>
  <style>
    body, table, td, p, a, h1, h2, h3 { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { width: 100% !important; height: 100% !important; background-color: #F0EDE5; font-family: Arial, Helvetica, sans-serif; color: #222222; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    a { text-decoration: none; color: #3A86FF; }
    .mono { font-family: 'Courier New', Courier, monospace; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .mob-pad { padding: 12px !important; }
      .mob-pad-x { padding-left: 16px !important; padding-right: 16px !important; }
      .px-l { padding-left: 16px !important; padding-right: 16px !important; }
      .py-l { padding-top: 20px !important; padding-bottom: 20px !important; }
      .display { font-size: 26px !important; letter-spacing: -0.5px !important; }
      .heading-xl { font-size: 18px !important; }
      .metric-cell { width: 100% !important; display: block !important; padding: 14px 16px !important; border-right: 0 !important; border-bottom: 1px solid #CCCCCC !important; }
      .metric-cell:last-child { border-bottom: 0 !important; }
      .section-pad { padding: 8px 16px !important; }
      .article-pad { padding: 16px 0 !important; }
      .section-header-left { display: block !important; width: 100% !important; padding-bottom: 4px !important; }
      .section-header-right { display: block !important; width: 100% !important; text-align: left !important; }
      .footer-meta-left { display: block !important; width: 100% !important; padding-bottom: 4px !important; }
      .footer-meta-right { display: block !important; width: 100% !important; text-align: left !important; }
      .body-text { font-size: 15px !important; line-height: 1.6 !important; }
      .cta-btn { padding: 14px 28px !important; font-size: 14px !important; }
      .article-thumb { width: 72px !important; padding-right: 12px !important; }
      .article-thumb img { width: 72px !important; height: 72px !important; }
    }
    @media (prefers-color-scheme: dark) {
      body { background-color: #1a1a1a !important; }
      .dark-bg { background-color: #2a2a2a !important; }
      .dark-card { background-color: #252525 !important; border-color: #3a3a3a !important; }
      .dark-text { color: #e0e0e0 !important; }
      .dark-text-secondary { color: #a0a0a0 !important; }
      .dark-border { border-color: #3a3a3a !important; }
    }
  </style>
</head>
<body class="dark-bg" style="margin:0;padding:0;background-color:#F0EDE5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F0EDE5;">
    <tr>
      <td class="mob-pad" align="center" style="padding:24px 16px 48px 16px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

          <!-- PREHEADER -->
          <tr>
            <td style="padding:0 4px 16px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="mono" align="left" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;letter-spacing:0;">FOR EDUCATORS & PARENTS</td>
                  <td class="mono" align="right" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;letter-spacing:0;">ISSUE ${issueNum} · ${dateStr}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="border-top:1px solid #CCCCCC;line-height:0;font-size:0;height:0;">&nbsp;</td></tr>
          <tr><td style="height:24px;line-height:24px;font-size:0;">&nbsp;</td></tr>

          <!-- HERO -->
          <tr>
            <td class="dark-card" style="background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:8px;padding:0;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="px-l py-l mob-pad-x" style="padding:32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="mono" align="left" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#3A86FF;letter-spacing:0;padding-bottom:20px;">
                          THE LISTEN & LEARN WEEKLY &nbsp;//&nbsp; ISSUE ${issueNum}
                        </td>
                        <td class="mono" align="right" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;letter-spacing:0;padding-bottom:20px;">
                          ${personaLabel ? `FOCUS: ${personaLabel.toUpperCase()} · ` : ''}◆ ${issueNum} / 52
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr><td style="border-top:1px solid #DADADA;line-height:0;font-size:0;height:0;">&nbsp;</td></tr>
                    </table>
                    <h1 class="display dark-text" style="font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:700;line-height:1.2;letter-spacing:0;color:#222222;margin:24px 0 16px 0;">
                      ${escapeHtml(subjectLine)}
                    </h1>
                    <p class="body-text dark-text-secondary" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#363636;margin:0 0 28px 0;">
                      ${escapeHtml(issue.intro)}
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#3A86FF;border:1px solid #3A86FF;border-radius:4px;box-shadow:0 2px 8px rgba(58,134,255,0.2);">
                          <a href="#read" class="cta-btn" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;line-height:1.2;letter-spacing:0.5px;color:#FFFFFF;text-decoration:none;">READ THE ISSUE →</a>
                        </td>
                        <td style="width:12px;line-height:0;font-size:0;">&nbsp;</td>
                        <td class="mono" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;letter-spacing:0;vertical-align:middle;">
                          ~ ${readTime} MIN · ${totalSignals} SIGNALS
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height:32px;line-height:32px;font-size:0;">&nbsp;</td></tr>

          <!-- METRICS -->
          <tr>
            <td class="dark-card" style="background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:8px;padding:0;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="metric-cell" width="33%" style="padding:20px 16px 20px 16px;border-right:1px solid #DADADA;text-align:left;">
                    <p class="mono" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;margin:0 0 8px 0;letter-spacing:0;text-transform:uppercase;">M.01 · Signals</p>
                    <p style="font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:700;color:#222222;margin:0 0 4px 0;line-height:1.2;letter-spacing:0;">${totalSignals}</p>
                    <p class="mono" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#00D084;margin:0;letter-spacing:0;">▲ curated</p>
                  </td>
                  <td class="metric-cell" width="33%" style="padding:20px 16px 20px 16px;border-right:1px solid #DADADA;text-align:left;">
                    <p class="mono" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;margin:0 0 8px 0;letter-spacing:0;text-transform:uppercase;">M.02 · Sources</p>
                    <p style="font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:700;color:#222222;margin:0 0 4px 0;line-height:1.2;letter-spacing:0;">07</p>
                    <p class="mono" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;margin:0;letter-spacing:0;">multi-platform</p>
                  </td>
                  <td class="metric-cell" width="34%" style="padding:20px 16px 20px 16px;text-align:left;">
                    <p class="mono" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;margin:0 0 8px 0;letter-spacing:0;text-transform:uppercase;">PARTNER · YOTO</p>
                    <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;line-height:1.3;color:#222222;margin:0 0 6px 0;">The screen-free audio player kids love</p>
                    <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.4;color:#363636;margin:0 0 10px 0;">Stories, music & podcasts — no screen required.</p>
                    <a href="https://www.yotoplayer.com" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.5px;color:#3A86FF;text-decoration:none;">Learn more &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height:40px;line-height:40px;font-size:0;">&nbsp;</td></tr>

          <!-- SPOTLIGHT HEADER -->
          <tr>
            <td class="mob-pad-x" style="padding:0 4px 16px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="section-header-left dark-text" align="left" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#222222;letter-spacing:1.5px;text-transform:uppercase;">
                    <span style="color:#3A86FF;font-size:14px;">◆</span> &nbsp; Section 01 &nbsp;·&nbsp; Spotlight
                  </td>
                  <td class="section-header-right" align="right" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;letter-spacing:0;">
                    ──── 1 of 1
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SPOTLIGHT CARD -->
          <tr>
            <td class="dark-card" style="background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:8px;padding:0;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="mob-pad-x" style="background-color:#F0EDE5;border-bottom:1px solid #DADADA;border-radius:8px 8px 0 0;padding:10px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="mono" align="left" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#222222;letter-spacing:0;">FILE_01 · SPOTLIGHT</td>
                        <td class="mono" align="right" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;letter-spacing:0;">★ Editor's pick</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="px-l mob-pad-x" style="padding:28px 24px 24px 24px;">
                    <p class="mono" style="font-family:'Courier New',Courier,monospace;font-size:24px;font-weight:700;color:#3A86FF;margin:0 0 8px 0;line-height:1.2;letter-spacing:0;">01</p>
                    ${spotlightHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height:40px;line-height:40px;font-size:0;">&nbsp;</td></tr>

          <!-- FIELD NOTES HEADER -->
          <tr>
            <td class="mob-pad-x" style="padding:0 4px 16px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="section-header-left dark-text" align="left" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#222222;letter-spacing:1.5px;text-transform:uppercase;">
                    <span style="color:#3A86FF;font-size:14px;">◆</span> &nbsp; Section 02 &nbsp;·&nbsp; Field Notes
                  </td>
                  <td class="section-header-right" align="right" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;letter-spacing:0;">
                    ──── ${fieldArticles.length} entries
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ARTICLES -->
          <tr>
            <td class="section-pad dark-card" style="background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:8px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
              ${articlesHtml}
            </td>
          </tr>

          <tr><td style="height:48px;line-height:48px;font-size:0;">&nbsp;</td></tr>

          <!-- FORWARD CTA -->
          <tr>
            <td class="mob-pad-x" style="padding:0 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="mono" align="center" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;letter-spacing:0;text-transform:uppercase;padding-bottom:16px;">
                    ◇ &nbsp; Signal boost &nbsp; ◇
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <h2 class="dark-text" style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;line-height:1.3;color:#222222;margin:0;letter-spacing:0;">
                      Forward this to one educator.<br>One parent.
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td class="dark-bg" style="background-color:#F0EDE5;border:1px solid #CCCCCC;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                          <a href="#forward" class="cta-btn dark-text" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;line-height:1.2;letter-spacing:0.5px;color:#222222;text-decoration:none;">FORWARD →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height:48px;line-height:48px;font-size:0;">&nbsp;</td></tr>

          <!-- SPONSORS -->
          <tr>
            <td class="mob-pad-x" style="padding:0 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td class="mono" align="center" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;letter-spacing:0;text-transform:uppercase;padding-bottom:16px;">&#9671; &nbsp; Partners &nbsp; &#9671;</td></tr>
                <tr>
                  <td class="dark-card" style="background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:8px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" style="padding:0 12px 0 0;border-right:1px solid #DADADA;vertical-align:top;">
                          <p class="mono" style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#666666;margin:0 0 8px 0;letter-spacing:1px;text-transform:uppercase;">Platinum</p>
                          <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;line-height:1.3;color:#222222;margin:0 0 4px 0;">Yoto</p>
                          <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.4;color:#363636;margin:0;">Screen-free audio for curious minds.</p>
                        </td>
                        <td width="50%" style="padding:0 0 0 12px;vertical-align:top;">
                          <p class="mono" style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#666666;margin:0 0 8px 0;letter-spacing:1px;text-transform:uppercase;">Partner</p>
                          <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;line-height:1.3;color:#222222;margin:0 0 4px 0;">Sonarcloud</p>
                          <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.4;color:#363636;margin:0;">School PA systems, reimagined.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height:48px;line-height:48px;font-size:0;">&nbsp;</td></tr>

          <!-- FOOTER -->
          <tr>
            <td class="mob-pad-x" style="padding:0 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #CCCCCC;line-height:0;font-size:0;height:0;">&nbsp;</td></tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                <tr>
                  <td valign="top" style="vertical-align:top;">
                    <p class="dark-text" style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:600;color:#222222;margin:0 0 4px 0;line-height:1.3;letter-spacing:0;">The Listen & Learn Weekly</p>
                    <p class="mono" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#3A86FF;margin:0 0 10px 0;letter-spacing:0;text-transform:uppercase;">Newsletter · weekly</p>
                    <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#363636;margin:0;">Kids audio, podcasting<br>& educational AI.</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;padding-top:16px;border-top:1px solid #CCCCCC;">
                <tr>
                  <td class="footer-meta-left mono" align="left" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;letter-spacing:0;">
                    ISSUE.${issueNum} · ${now.toISOString().split('T')[0]} · AI-CURATED
                  </td>
                  <td class="footer-meta-right mono" align="right" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#363636;letter-spacing:0;">
                    <a href="#" style="color:#363636;text-decoration:none;border-bottom:1px solid #DADADA;">UNSUBSCRIBE</a>
                  </td>
                </tr>
              </table>
              <p class="body-text dark-text-secondary" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#363636;margin:16px 0 0 0;">
                You're receiving this because you subscribed. Update preferences anytime.
              </p>
              <p class="body-text dark-text-secondary" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#363636;margin:8px 0 0 0;">
                <strong>Reply to share what resonated</strong> — we read every response.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:32px 0 0 0;">
              <span class="mono" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#DADADA;letter-spacing:0;">◆ &nbsp; ◇ &nbsp; ◆</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM_EMAIL;
  const recipients = (process.env.NEWSLETTER_RECIPIENTS || '')
    .split(',').map((s) => s.trim()).filter(Boolean);

  if (!apiKey) throw new Error('RESEND_API_KEY missing');
  if (!from) throw new Error('NEWSLETTER_FROM_EMAIL missing');
  if (recipients.length === 0) throw new Error('NEWSLETTER_RECIPIENTS missing');

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     🎧 LISTEN & LEARN WEEKLY · AI-CURATED SEND            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // 1. Gather content
  const aggregator = new ContentAggregator();
  const gathered = await aggregator.gatherAll();

  // 1b. Filter out previously sent articles
  const history = new HistoryTracker();
  const newArticles = history.filterNew(gathered.allArticles);
  console.log(`\n📚 History: ${newArticles.length} new articles out of ${gathered.allArticles.length} gathered`);
  if (newArticles.length === 0) {
    console.warn('⚠️  All gathered articles have been sent before. Consider generating fresh briefs or expanding search.');
  }
  gathered.allArticles = newArticles;

  // 2. AI Curation
  const curator = new Curator({ maxArticlesPerSection: 7 });
  const curation = await curator.curate(
    gathered.allArticles,
    gathered.issueNumber,
    gathered.date
  );

  // 3. Build issue
  const issue: NewsletterIssue = {
    issueNumber: gathered.issueNumber,
    date: gathered.date,
    title: 'The Listen & Learn Weekly',
    subtitle: 'Kids Audio, Podcasting & Educational AI',
    intro: curation.intro,
    spotlight: curation.spotlight,
    sections: curation.sections,
    footerNote: 'Have feedback? Reply to this email.',
    subjectLine: curation.subjectLine,
    primaryPersona: curation.primaryPersona,
    articleAudience: curation.articleAudience,
  };

  // 4. Render premium HTML
  const html = await renderPremiumHtml(issue, curation.subjectLine);
  const outPath = path.join(process.cwd(), 'output', `newsletter-issue-${issue.issueNumber}.html`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);

  const totalArticles = issue.sections.reduce((sum, s) => sum + s.articles.length, 0);

  console.log('\n📊 Curation Report');
  console.log(`   Target: ${curator.getPersonaProfile(curation.primaryPersona).name}`);
  console.log(`   Subject: "${curation.subjectLine}"`);
  console.log(`   Articles: ${totalArticles} across ${issue.sections.length} sections`);
  console.log(`   HTML: ${html.length.toLocaleString()} chars`);
  console.log(`   Preview: ${outPath}`);

  // 5. Send
  const allSentArticles = issue.sections.flatMap((s) => s.articles);
  console.log(`\n📧 Sending to ${recipients.length} recipient(s)...`);
  const resend = new Resend(apiKey);
  const res = await resend.emails.send({
    from,
    to: recipients,
    subject: curation.subjectLine,
    html,
  });

  if ((res as any).error) {
    console.error('❌ SEND FAILED:', (res as any).error);
    process.exit(1);
  }
  console.log('✅ SENT. id=' + ((res as any).data?.id || '?'));

  // 6. Record to history
  const historyTracker = new HistoryTracker();
  const newArticlesCheck = historyTracker.filterNew(allSentArticles);
  console.log(`\n📚 History check: ${newArticlesCheck.length} new articles out of ${allSentArticles.length} total`);
  if (newArticlesCheck.length < allSentArticles.length) {
    const dupes = allSentArticles.filter((a) => !newArticlesCheck.includes(a));
    console.log(`   Skipped ${dupes.length} previously sent article(s)`);
  }
  historyTracker.recordSent(allSentArticles, issue.issueNumber);
  const stats = historyTracker.getStats();
  console.log(`   History: ${stats.totalSent} total articles sent`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
