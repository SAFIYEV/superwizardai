/** Shared Gemini REST helpers (Express, Vite middleware, Cloudflare Worker). */

export const CHAT_MODEL_ID = 'google/gemma-4-26b-a4b-it:free';

export const ALLOWED_MODELS = new Set([CHAT_MODEL_ID]);

export const GEMINI_API_BASE = 'https://openrouter.ai/api/v1';

/**
 * Обязательный заголовок для Gemini API; одного `?key=` в URL иногда недостаточно (403 unregistered callers).
 * @param {string} apiKey
 */
export function geminiRequestHeaders(apiKey) {
  const k = typeof apiKey === 'string' ? apiKey.trim() : '';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${k}`,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseDataUrl(url) {
  const m = /^data:([^;]+);base64,(.+)$/i.exec(url || '');
  if (!m) return null;
  return { mime: m[1], data: m[2].replace(/\s/g, '') };
}

function flattenTextContent(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter((p) => p.type === 'text' && typeof p.text === 'string')
    .map((p) => p.text)
    .join('\n');
}

function mergeContent(a, b) {
  if (typeof a === 'string' && typeof b === 'string') {
    return [a, b].filter(Boolean).join('\n\n');
  }
  const partsA = Array.isArray(a) ? a : [{ type: 'text', text: String(a || '') }];
  const partsB = Array.isArray(b) ? b : [{ type: 'text', text: String(b || '') }];
  return [...partsA, ...partsB];
}

function coalesceMessages(messages) {
  const out = [];
  for (const m of messages) {
    if (m.role === 'system') {
      out.push(m);
      continue;
    }
    const last = out[out.length - 1];
    if (last && last.role === m.role) {
      last.content = mergeContent(last.content, m.content);
    } else {
      out.push({ role: m.role, content: m.content });
    }
  }
  return out;
}

function contentToGeminiParts(content) {
  if (typeof content === 'string') {
    const t = content.trim() ? content : ' ';
    return [{ text: t }];
  }
  const parts = [];
  for (const p of content) {
    if (p.type === 'text' && typeof p.text === 'string') {
      parts.push({ text: p.text || ' ' });
    } else if (p.type === 'image_url' && p.image_url?.url) {
      const inline = parseDataUrl(p.image_url.url);
      if (inline) {
        parts.push({ inline_data: { mime_type: inline.mime, data: inline.data } });
      }
    }
  }
  return parts.length ? parts : [{ text: ' ' }];
}

export function openaiMessagesToGemini(messages) {
  const merged = coalesceMessages(messages);
  return merged.map((m) => {
    if (typeof m.content === 'string') {
      return { role: m.role, content: m.content };
    }
    const textParts = m.content
      .filter((p) => p.type === 'text' && typeof p.text === 'string')
      .map((p) => ({ type: 'text', text: p.text || ' ' }));
    const imageParts = m.content
      .filter((p) => p.type === 'image_url' && p.image_url?.url)
      .map((p) => ({ type: 'image_url', image_url: { url: p.image_url.url } }));
    return { role: m.role, content: [...textParts, ...imageParts] };
  });
}

export function buildGeminiGenerateBody(sanitized) {
  const messages = openaiMessagesToGemini(sanitized.messages);
  if (!messages.length) {
    throw new Error('No valid messages for Gemini');
  }
  return {
    model: sanitized.model || CHAT_MODEL_ID,
    messages,
    temperature: sanitized.temperature,
    max_tokens: Math.min(sanitized.max_tokens, 16384),
    stream: false,
  };
}

export function geminiResponseToOpenAIChat(data, modelId = CHAT_MODEL_ID) {
  if (data?.choices) return data;
  const text = data?.output_text || '';
  return {
    id: 'chatcmpl-openrouter',
    object: 'chat.completion',
    model: modelId,
    choices: [{ index: 0, message: { role: 'assistant', content: text }, finish_reason: 'stop' }],
  };
}

function extractTextFromGeminiChunk(data) {
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') ?? '';
}

/**
 * Read Gemini SSE stream and write OpenAI-compatible SSE chunks to res (Node ServerResponse).
 * @param {import('http').IncomingMessage} [req] — if set, aborts read on client disconnect
 */
export async function pipeGeminiSseToOpenAI(res, geminiResponseBody, req) {
  const reader = geminiResponseBody.getReader();
  const decoder = new TextDecoder()
  const onClose = () => reader.cancel().catch(() => {});
  if (req) req.once('close', onClose);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } finally {
    if (req) req.off('close', onClose);
    res.end();
  }
}

/** Cloudflare Worker: Gemini SSE → OpenAI-style SSE as a web ReadableStream. */
export function openAiSseStreamFromGemini(geminiResponseBody) {
  const reader = geminiResponseBody.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(encoder.encode(decoder.decode(value, { stream: true })));
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });
}

export async function geminiFetchWithRetry(url, init, maxRetries = 5) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, init);
    if (res.ok) return res;
    if (res.status === 429) {
      const retryAfter = res.headers.get('retry-after');
      const wait = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : Math.min(1000 * 2 ** attempt + Math.random() * 500, 32000);
      await sleep(wait);
      continue;
    }
    return res;
  }
  return new Response(
    JSON.stringify({ error: { message: 'Rate limit exceeded after max retries' } }),
    { status: 429, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function transcribeWithGemini(apiKey, audioBase64, mimeType, language) {
  void apiKey;
  void audioBase64;
  void mimeType;
  void language;
  throw new Error('Transcription is not configured for OpenRouter in this project');
}

export function staticModelsOpenAIFormat() {
  return {
    object: 'list',
    data: [
      {
        id: CHAT_MODEL_ID,
        object: 'model',
        created: 0,
        owned_by: 'openrouter',
      },
    ],
  };
}
