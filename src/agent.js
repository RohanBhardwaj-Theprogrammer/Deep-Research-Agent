import { v4 as uuidv4 } from 'uuid';
import pLimit from 'p-limit';
import { chat, system, user } from './llm.js';
import { webSearch } from './search.js';
import { fetchAndExtract } from './fetchPage.js';
import { chunkText } from './chunk.js';
import { getDb } from './db.js';

const CONCURRENCY = 4;

export async function runResearch(query, opts = {}) {
  const db = await getDb();
  const runId = uuidv4();
  const createdAt = new Date();
  const run = {
    _id: runId,
    query,
    status: 'running',
    createdAt,
    updatedAt: createdAt,
    params: opts,
  };
  await db.collection('research_runs').insertOne(run);

  try {
    // 1) Expand into sub-queries
    const subQueries = await proposeSubqueries(query);

    // 2) Search web for each sub-query
    const searchResults = [];
    for (const sq of subQueries) {
      const res = await webSearch(sq, { limit: 6 });
      searchResults.push(...res);
    }

    // Deduplicate by URL
    const seen = new Set();
    const unique = [];
    for (const r of searchResults) {
      const key = r.url.split('#')[0];
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(r);
    }

    // 3) Fetch and extract content
    const limit = pLimit(CONCURRENCY);
    const docs = (await Promise.all(
      unique.slice(0, opts.maxDocs ?? 12).map((r) =>
        limit(async () => {
          try {
            const doc = await fetchAndExtract(r.url);
            return { ...r, ...doc };
          } catch (e) {
            return null;
          }
        })
      )
    )).filter(Boolean);

    // Save docs
    for (const d of docs) {
      await db.collection('documents').insertOne({
        runId,
        url: d.url,
        title: d.title,
        snippet: d.snippet,
        byline: d.byline,
        content: d.content,
        length: d.length,
        createdAt: new Date(),
      });
    }

    // 4) Summarize each doc into key points
    const summaries = [];
    for (const d of docs) {
      const chunks = chunkText(d.content, { chunkSize: 2000, overlap: 200 });
      const chunkSummaries = [];
      for (let i = 0; i < chunks.length; i++) {
        const { content } = await chat({
          messages: [
            system('You are a meticulous research assistant. Summarize facts only from the provided text. Return concise bullet points.'),
            user(`Source: ${d.title} (${d.url})\n\nChunk ${i + 1}/${chunks.length}:\n\n${chunks[i]}`),
          ],
          temperature: 0.1,
          max_tokens: 400,
        });
        chunkSummaries.push(content.trim());
      }
      const { content: merged } = await chat({
        messages: [
          system('Merge bullet points into a compact summary. Preserve citations as [n]. Do not hallucinate.'),
          user(chunkSummaries.join('\n')),
        ],
        temperature: 0.1,
        max_tokens: 400,
      });
      summaries.push({ url: d.url, title: d.title, summary: merged.trim() });
    }

    // 5) Synthesize final report with citations
    const bibliography = summaries
      .map((s, i) => `[${i + 1}] ${s.title} - ${s.url}`)
      .join('\n');
    const corpus = summaries
      .map((s, i) => `Source [${i + 1}] ${s.title} (${s.url})\n${s.summary}`)
      .join('\n\n');

    const { content: report } = await chat({
      messages: [
        system('You are a senior analyst. Write a well-structured research brief with sections, clear takeaways, and inline citations like [1], [2]. Base only on provided sources.'),
        user(`Research question: ${query}\n\nSource notes:\n${corpus}\n\nWrite a 600-900 word report with:\n- Executive summary\n- Key findings\n- Evidence with citations\n- Risks and unknowns\n- References list placeholder (will be appended)\n`),
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const finalReport = `${report}\n\nReferences\n${bibliography}`.trim();

    await db.collection('research_runs').updateOne(
      { _id: runId },
      { $set: { status: 'completed', updatedAt: new Date(), report: finalReport } }
    );

    return { runId, status: 'completed' };
  } catch (err) {
    await db.collection('research_runs').updateOne(
      { _id: runId },
      { $set: { status: 'failed', updatedAt: new Date(), error: String(err) } }
    );
    throw err;
  }
}

async function proposeSubqueries(query) {
  const { content } = await chat({
    messages: [
      system('Decompose the research question into 4-6 focused sub-queries that, collectively, answer the question.'),
      user(query),
    ],
    temperature: 0.4,
    max_tokens: 300,
  });
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*\d\.\)\s]+/, '').trim())
    .filter(Boolean);
  const uniq = [...new Set(lines)].slice(0, 6);
  return uniq.length ? uniq : [query];
}
