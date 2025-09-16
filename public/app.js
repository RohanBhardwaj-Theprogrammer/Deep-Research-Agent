async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function getText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const dbStatus = document.getElementById('dbStatus');
const llmStatus = document.getElementById('llmStatus');
const maxDocsEl = document.getElementById('maxDocs');

async function refreshHealth() {
  try {
    const db = await getJSON('/health');
    dbStatus.textContent = db.ok ? 'DB: ok' : 'DB: error';
    dbStatus.style.color = db.ok ? '#3fb950' : '#f85149';
  } catch (e) {
    dbStatus.textContent = 'DB: error';
    dbStatus.style.color = '#f85149';
  }
  try {
    const llm = await getJSON('/health/llm');
    llmStatus.textContent = llm.ok ? `LLM: ${llm.model || 'ok'}` : 'LLM: error';
    llmStatus.style.color = llm.ok ? '#3fb950' : '#f85149';
  } catch (e) {
    llmStatus.textContent = 'LLM: error';
    llmStatus.style.color = '#f85149';
  }
}
refreshHealth();

function pushMessage(role, text, meta) {
  const bubble = document.createElement('div');
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  messagesEl.appendChild(bubble);
  if (meta) {
    const m = document.createElement('div');
    m.className = 'meta';
    m.textContent = meta;
    messagesEl.appendChild(m);
  }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

let sending = false;

async function handleSend() {
  if (sending) return;
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = '';
  pushMessage('user', text);
  sending = true;
  sendBtn.disabled = true;

  const typing = document.createElement('div');
  typing.className = 'meta';
  typing.textContent = 'Researching...';
  messagesEl.appendChild(typing);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  const startedAt = Date.now();
  try {
    const maxDocs = Math.max(3, Math.min(20, Number(maxDocsEl.value) || 12));
    const start = await postJSON('/research', { query: text, options: { maxDocs } });
    const runId = start.runId;
    let attempts = 0;
    while (true) {
      await new Promise(r => setTimeout(r, 3000));
      attempts++;
      const s = await getJSON(`/research/${runId}`);
      if (s.status === 'completed') {
        const report = await getText(`/research/${runId}/report`);
        typing.remove();
        pushMessage('assistant', report, `Sources and citations included. (${attempts} polls, ${(Math.floor((Date.now()-startedAt)/1000))}s)`);
        try {
          const sources = await getJSON(`/research/${runId}/sources`);
          if (sources?.length) {
            const list = sources.map(s => `• ${s.title || s.url} (${s.url})`).join('\n');
            pushMessage('assistant', list, 'Sources');
          }
        } catch {}
        break;
      } else if (s.status === 'failed') {
        typing.remove();
        pushMessage('assistant', 'Run failed. Please check server logs.', `Attempts: ${attempts}`);
        break;
      } else {
        typing.textContent = `Researching... (${attempts})`;
      }
    }
  } catch (e) {
    typing.remove();
    pushMessage('assistant', `Error: ${e.message}`);
  } finally {
    sending = false;
    sendBtn.disabled = false;
  }
}

sendBtn.addEventListener('click', handleSend);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

// Seed a friendly greeting
pushMessage('assistant', 'Hi! Ask me a question and I\'ll research it, summarize the findings, and provide a report with citations.');
