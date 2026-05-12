import axios from 'axios';

/**
 * Extract the main image from a URL using OpenGraph / Twitter Card meta tags.
 * Falls back to the first large image in the HTML.
 */
export async function extractImage(url: string): Promise<string | undefined> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsletterBot/1.0)',
      },
    });

    const html: string = response.data;

    // 1. Try OpenGraph image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch) return resolveUrl(ogMatch[1], url);

    // 2. Try Twitter image
    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (twMatch) return resolveUrl(twMatch[1], url);

    // 3. Try first large <img> tag (skip icons, logos, tracking pixels)
    const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
    for (const match of imgMatches) {
      const src = match[1];
      // Skip tiny images, tracking pixels, icons
      if (src.includes('pixel') || src.includes('tracking') || src.includes('icon')) continue;
      if (src.endsWith('.svg')) continue;
      const widthMatch = match[0].match(/width=["'](\d+)["']/i);
      if (widthMatch && parseInt(widthMatch[1]) < 100) continue;
      return resolveUrl(src, url);
    }

    return undefined;
  } catch {
    return undefined;
  }
}

function resolveUrl(src: string, baseUrl: string): string {
  if (src.startsWith('http')) return src;
  if (src.startsWith('//')) return 'https:' + src;
  try {
    return new URL(src, baseUrl).href;
  } catch {
    return src;
  }
}
