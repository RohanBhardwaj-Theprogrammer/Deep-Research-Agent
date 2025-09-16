import fetch from 'cross-fetch';

const BASE_URL = process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1';
const MODEL = process.env.LMSTUDIO_MODEL || 'lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF';

export async function chat({ messages, temperature = 0.2, max_tokens = 1024, tools, tool_choice, stream = false }) {
  const body = {
    model: MODEL,
    messages,
    temperature,
    stream,
  };
  if (typeof max_tokens === 'number' && max_tokens >= 0) body.max_tokens = max_tokens;
  if (tools) body.tools = tools;
  if (tool_choice) body.tool_choice = tool_choice;

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LM Studio error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  return { content, raw: data };
}

export function system(text) {
  return { role: 'system', content: text };
}

export function user(text) {
  return { role: 'user', content: text };
}

export function assistant(text) {
  return { role: 'assistant', content: text };
}

export async function healthProbe() {
  // A minimal, deterministic prompt to validate LM Studio connectivity and model
  const { content, raw } = await chat({
    messages: [
      system('You are a helpful assistant.'),
      user('Reply with the single word: ready'),
    ],
    temperature: 0,
    max_tokens: 5,
  });
  return {
    ok: true,
    model: raw?.model || process.env.LMSTUDIO_MODEL,
    output: String(content || '').trim().slice(0, 64),
  };
}
