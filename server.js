import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import {
  CHAT_MODEL_ID,
  ALLOWED_MODELS,
  GEMINI_API_BASE,
  buildGeminiGenerateBody,
  geminiResponseToOpenAIChat,
  geminiFetchWithRetry,
  geminiRequestHeaders,
  pipeGeminiSseToOpenAI,
  staticModelsOpenAIFormat,
} from './lib/geminiChat.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// ─── Startup checks ───
const GEMINI_API_KEY = (
  process.env.NVIDIA_API_KEY ??
  process.env.OPENROUTER_API_KEY ??
  process.env.GEMINI_API_KEY ??
  ''
).trim();
if (!GEMINI_API_KEY) {
  console.error('[SuperWizard] NVIDIA_API_KEY is not set in .env — server cannot start.');
  process.exit(1);
}

const app = express();

// ─── Security headers ───
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // CSP managed by Vite for frontend
  })
);
app.disable('x-powered-by');

// ─── CORS — allow frontend origins ───
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
];
if (process.env.ORIGIN) {
  process.env.ORIGIN.split(',').forEach((o) => ALLOWED_ORIGINS.push(o.trim()));
}

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error('CORS: origin not allowed'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    maxAge: 86400,
  })
);

// ─── Body parser with size limit ───
app.use(express.json({ limit: '5mb' }));

// ─── Rate limiting ───
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Слишком много запросов. Подождите минуту.' } },
});

const authBruteforceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Слишком много попыток. Подождите 15 минут.' } },
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Превышен лимит запросов.' } },
});

app.use('/api', globalLimiter);
app.use('/api/chat', chatLimiter);

// ─── Request timeout middleware ───
function requestTimeout(ms) {
  return (_req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ error: { message: 'Тайм-аут запроса' } });
      }
    }, ms);
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    next();
  };
}

// ─── Input validation ───
const MAX_MESSAGE_LENGTH = 32000;
const MAX_MESSAGES = 100;

function validateChatBody(body) {
  if (!body || typeof body !== 'object') return 'Invalid request body';
  if (!body.model || !ALLOWED_MODELS.has(body.model))
    return `Неизвестная модель: ${body.model}`;
  if (
    body.use_google_search !== undefined &&
    typeof body.use_google_search !== 'boolean'
  )
    return 'use_google_search must be boolean';
  if (!Array.isArray(body.messages) || body.messages.length === 0)
    return 'Messages array is required';
  if (body.messages.length > MAX_MESSAGES)
    return `Максимум ${MAX_MESSAGES} сообщений в контексте`;

  for (const msg of body.messages) {
    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role))
      return 'Invalid message role';
    if (typeof msg.content === 'string') {
      if (msg.content.length > MAX_MESSAGE_LENGTH)
        return `Сообщение слишком длинное (макс. ${MAX_MESSAGE_LENGTH} символов)`;
    } else if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === 'text' && typeof part.text === 'string') {
          if (part.text.length > MAX_MESSAGE_LENGTH) return 'Message too long';
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

function sanitizeParams(body) {
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

// ─── Routes ───

app.post('/api/chat', requestTimeout(120000), async (req, res) => {
  const err = validateChatBody(req.body);
  if (err) return res.status(400).json({ error: { message: err } });

  try {
    const genBody = buildGeminiGenerateBody(sanitizeParams(req.body));
    const url = `${GEMINI_API_BASE}/chat/completions`;
    const response = await geminiFetchWithRetry(url, {
      method: 'POST',
      headers: geminiRequestHeaders(GEMINI_API_KEY),
      body: JSON.stringify(genBody),
    });
    const data = await response.json();
    if (!response.ok) {
      const msg = data?.error?.message || 'Gemini request failed';
      return res.status(response.status).json({ error: { message: msg } });
    }
    res.json(geminiResponseToOpenAIChat(data, CHAT_MODEL_ID));
  } catch (e) {
    console.error('[SuperWizard] Chat error:', e);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

app.post('/api/chat/stream', async (req, res) => {
  const err = validateChatBody(req.body);
  if (err) return res.status(400).json({ error: { message: err } });

  try {
    const genBody = buildGeminiGenerateBody(sanitizeParams(req.body));
    genBody.stream = true;
    const url = `${GEMINI_API_BASE}/chat/completions`;
    const response = await geminiFetchWithRetry(url, {
      method: 'POST',
      headers: geminiRequestHeaders(GEMINI_API_KEY),
      body: JSON.stringify(genBody),
    });

    if (!response.ok) {
      const data = await response.json();
      const msg = data?.error?.message || 'Gemini stream failed';
      return res.status(response.status).json({ error: { message: msg } });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await pipeGeminiSseToOpenAI(res, response.body, req);
  } catch (e) {
    console.error('[SuperWizard] Stream error:', e);
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'Internal server error' } });
    }
  }
});

app.get('/api/models', requestTimeout(10000), async (_req, res) => {
  res.json(staticModelsOpenAIFormat());
});

// ─── Serve built frontend (production) ───
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[SuperWizard] Running → http://localhost:${PORT}`);
});
