import fetch from 'cross-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
// No extra HTML decoding required here; Readability gives textContent.

export async function fetchAndExtract(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  const html = await res.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  const title = article?.title || dom.window.document.title || url;
  const byline = article?.byline || '';
  const content = (article?.textContent || '').replace(/\s+/g, ' ').trim();
  return { url, title, byline, content, length: content.length };
}
