import fetch from 'cross-fetch';
import { load as cheerioLoad } from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
};

export async function webSearch(query, { limit = 8 } = {}) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerioLoad(html);
  const results = [];
  $('a.result__a').each((_, el) => {
    if (results.length >= limit) return false;
    const title = $(el).text().trim();
    let href = $(el).attr('href');
    if (!href) return;
    // DuckDuckGo may wrap URLs; decode if needed
    try {
      const u = new URL(href, 'https://duckduckgo.com');
      const q = u.searchParams.get('uddg');
      if (q) href = decodeURIComponent(q);
    } catch {}
    const snippet = $(el).parent().find('.result__snippet').text().trim();
    results.push({ title, url: href, snippet });
  });
  return results;
}
