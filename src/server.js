import 'dotenv/config';
import express from 'express';
import { getDb } from './db.js';
import { runResearch } from './agent.js';
import { healthProbe } from './llm.js';

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/health', async (req, res) => {
  try {
    await getDb();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get('/health/llm', async (req, res) => {
  try {
    const r = await healthProbe();
    res.json({ ok: true, model: r.model, output: r.output });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.post('/research', async (req, res) => {
  const { query, options } = req.body || {};
  if (!query) return res.status(400).json({ error: 'query is required' });
  try {
    const result = await runResearch(query, options);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/research/:id', async (req, res) => {
  const db = await getDb();
  const doc = await db.collection('research_runs').findOne({ _id: req.params.id });
  if (!doc) return res.status(404).json({ error: 'not found' });
  res.json({ id: doc._id, status: doc.status, createdAt: doc.createdAt, updatedAt: doc.updatedAt });
});

app.get('/research/:id/report', async (req, res) => {
  const db = await getDb();
  const doc = await db.collection('research_runs').findOne({ _id: req.params.id });
  if (!doc) return res.status(404).json({ error: 'not found' });
  if (doc.status !== 'completed') return res.status(202).json({ status: doc.status });
  res.type('text/plain').send(doc.report || '');
});

app.get('/research/:id/sources', async (req, res) => {
  const db = await getDb();
  const cur = db
    .collection('documents')
    .find({ runId: req.params.id })
    .project({ _id: 0, url: 1, title: 1, length: 1, byline: 1, snippet: 1 });
  const items = await cur.toArray();
  if (!items.length) return res.json([]);
  res.json(items);
});

const port = Number(process.env.PORT || 4567);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
