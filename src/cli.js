import 'dotenv/config';
import { runResearch } from './agent.js';
import { getDb } from './db.js';

async function main() {
  const args = process.argv.slice(2);
  const query = args.join(' ').trim();
  if (!query) {
    console.error('Usage: npm run cli -- <your research question>');
    process.exit(1);
  }
  console.log('Starting research...');
  const { runId } = await runResearch(query, {});
  console.log('Run ID:', runId);
  const db = await getDb();
  process.stdout.write('Waiting for completion');
  while (true) {
    const doc = await db.collection('research_runs').findOne({ _id: runId });
    if (doc?.status === 'completed') {
      console.log('\n\n=== REPORT ===\n');
      console.log(doc.report);
      break;
    }
    if (doc?.status === 'failed') {
      console.error('\nRun failed:', doc.error);
      process.exit(1);
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, 3000));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
