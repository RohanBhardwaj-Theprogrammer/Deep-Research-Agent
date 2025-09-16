import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/deepresearch';
let client;
let db;

export async function getDb() {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  await ensureIndexes(db);
  return db;
}

async function ensureIndexes(db) {
  await db.collection('research_runs').createIndex({ createdAt: -1 });
  await db.collection('documents').createIndex({ runId: 1 });
  await db.collection('documents').createIndex({ url: 1 }, { unique: false });
}

export async function closeDb() {
  if (client) await client.close();
  client = undefined;
  db = undefined;
}
