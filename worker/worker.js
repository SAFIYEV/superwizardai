import {
  CHAT_MODEL_ID,
  ALLOWED_MODELS,
  GEMINI_API_BASE,
  buildGeminiGenerateBody,
  geminiResponseToOpenAIChat,
  geminiFetchWithRetry,
  geminiRequestHeaders,
  openAiSseStreamFromGemini,
  staticModelsOpenAIFormat,
} from '../lib/geminiChat.js';

const MAX_MSG_LEN = 32000;
const MAX_MSGS = 100;

function getAllowedOrigins(env) {
  const defaults = [
    'https://safiyev.github.io',
    'http://localhost:5173',
    'http://localhost:4173',
  ];
  const fromEnv = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  return new Set([...defaults, ...fromEnv]);
}

function resolveOrigin(request, env) {
  const origin = request.headers.get('Origin') || '';
  if (!origin) return '';
  const allowed = getAllowedOrigins(env);
  return allowed.has(origin) ? origin : '';
}

function corsHeaders(origin) {
  if (!origin) {
    return {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store',
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin), ...securityHeaders() },
  });
}

function validateBody(body) {
  if (!body || typeof body !== 'object') return 'Invalid body';
  if (!body.model || !ALLOWED_MODELS.has(body.model)) return 'Unknown model';
  if (
    body.use_google_search !== undefined &&
    typeof body.use_google_search !== 'boolean'
  )
    return 'Invalid use_google_search';
  if (!Array.isArray(body.messages) || !body.messages.length) return 'No messages';
  if (body.messages.length > MAX_MSGS) return 'Too many messages';
  for (const m of body.messages) {
    if (!['user', 'assistant', 'system'].includes(m.role)) return 'Invalid role';
    if (typeof m.content === 'string') {
      if (m.content.length > MAX_MSG_LEN) return 'Message too long';
    } else if (Array.isArray(m.content)) {
      for (const part of m.content) {
        if (part.type === 'text' && typeof part.text === 'string') {
          if (part.text.length > MAX_MSG_LEN) return 'Message too long';
        } else if (part.type === 'image_url' && part.image_url?.url) {
          continue;
        } else {
          return 'Invalid content part';
        }
      }
    } else {
      return 'Content must be string or array';
    }
  }
  return null;
}

function sanitize(body) {
  return {
    model: body.model,
    use_google_search: Boolean(body.use_google_search),
    messages: body.messages.map((m) => {
      if (Array.isArray(m.content)) {
        return {
          role: m.role,
          content: m.content.map((p) => {
            if (p.type === 'image_url') return { type: 'image_url', image_url: { url: p.image_url.url } };
            return { type: 'text', text: p.text };
          }),
        };
      }
      return { role: m.role, content: m.content };
    }),
    temperature: Math.min(Math.max(Number(body.temperature) || 0.7, 0), 2),
    max_tokens: Math.min(Number(body.max_tokens) || 4096, 16384),
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = resolveOrigin(request, env);
    const hasOriginHeader = Boolean(request.headers.get('Origin'));

    if (request.method === 'OPTIONS') {
      if (hasOriginHeader && !origin) {
        return new Response(null, { status: 403, headers: { ...corsHeaders(''), ...securityHeaders() } });
      }
      return new Response(null, { status: 204, headers: { ...corsHeaders(origin), ...securityHeaders() } });
    }

    if (hasOriginHeader && !origin) {
      return json({ error: { message: 'Origin not allowed' } }, 403, '');
    }

    const apiKey = (env.NVIDIA_API_KEY ?? env.OPENROUTER_API_KEY ?? env.GEMINI_API_KEY ?? '').trim();
    if (!apiKey) {
      return json({ error: { message: 'Server misconfigured' } }, 500, origin);
    }

    if (url.pathname === '/api/chat/stream' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      const err = validateBody(body);
      if (err) return json({ error: { message: err } }, 400, origin);

      const genBody = buildGeminiGenerateBody(sanitize(body));
      genBody.stream = true;
      const streamUrl = `${GEMINI_API_BASE}/chat/completions`;
      const geminiRes = await geminiFetchWithRetry(streamUrl, {
        method: 'POST',
        headers: geminiRequestHeaders(apiKey),
        body: JSON.stringify(genBody),
      });

      if (!geminiRes.ok) {
        const d = await geminiRes.json();
        const msg = d?.error?.message || 'Gemini stream failed';
        return json({ error: { message: msg } }, geminiRes.status, origin);
      }

      return new Response(openAiSseStreamFromGemini(geminiRes.body), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          ...corsHeaders(origin),
          ...securityHeaders(),
        },
      });
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      const err = validateBody(body);
      if (err) return json({ error: { message: err } }, 400, origin);

      const genBody = buildGeminiGenerateBody(sanitize(body));
      const urlGen = `${GEMINI_API_BASE}/chat/completions`;
      const geminiRes = await geminiFetchWithRetry(urlGen, {
        method: 'POST',
        headers: geminiRequestHeaders(apiKey),
        body: JSON.stringify(genBody),
      });
      const d = await geminiRes.json();
      if (!geminiRes.ok) {
        const msg = d?.error?.message || 'Gemini request failed';
        return json({ error: { message: msg } }, geminiRes.status, origin);
      }
      return json(geminiResponseToOpenAIChat(d, CHAT_MODEL_ID), 200, origin);
    }

    if (url.pathname === '/api/models' && request.method === 'GET') {
      return json(staticModelsOpenAIFormat(), 200, origin);
    }

    return json({ error: { message: 'Not found' } }, 404, origin);
  },
};
