import type { Plugin, Connect } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'
import { loadEnv } from 'vite'
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
} from './lib/geminiChat.js'

const MAX_MSG_LEN = 32000
const MAX_MSGS = 100

function validateBody(body: any): string | null {
  if (!body || typeof body !== 'object') return 'Invalid body'
  if (!body.model || !ALLOWED_MODELS.has(body.model)) return 'Unknown model'
  if (
    body.use_google_search !== undefined &&
    typeof body.use_google_search !== 'boolean'
  )
    return 'Invalid use_google_search'
  if (!Array.isArray(body.messages) || !body.messages.length) return 'No messages'
  if (body.messages.length > MAX_MSGS) return 'Too many messages'
  for (const m of body.messages) {
    if (!['user', 'assistant', 'system'].includes(m.role)) return 'Invalid role'
    if (typeof m.content === 'string') {
      if (m.content.length > MAX_MSG_LEN) return 'Message too long'
    } else if (Array.isArray(m.content)) {
      for (const part of m.content) {
        if (part.type === 'text' && typeof part.text === 'string') {
          if (part.text.length > MAX_MSG_LEN) return 'Message too long'
        } else if (part.type === 'image_url' && part.image_url?.url) {
          continue
        } else {
          return 'Invalid content part'
        }
      }
    } else {
      return 'Content must be string or array'
    }
  }
  return null
}

function sanitize(body: any) {
  return {
    model: body.model,
    use_google_search: Boolean(body.use_google_search),
    messages: body.messages.map((m: any) => {
      if (Array.isArray(m.content)) {
        return {
          role: m.role,
          content: m.content.map((p: any) => {
            if (p.type === 'image_url') return { type: 'image_url', image_url: { url: p.image_url.url } }
            return { type: 'text', text: p.text }
          }),
        }
      }
      return { role: m.role, content: m.content }
    }),
    temperature: Math.min(Math.max(Number(body.temperature) || 0.7, 0), 2),
    max_tokens: Math.min(Number(body.max_tokens) || 4096, 16384),
  }
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function pathnameOnly(url: string): string {
  const q = url.indexOf('?')
  const raw = q === -1 ? url : url.slice(0, q)
  if (raw.length > 1 && raw.endsWith('/')) {
    return raw.slice(0, -1)
  }
  return raw
}

async function geminiErrorMessage(res: Response, fallback: string): Promise<string> {
  const text = await res.text()
  try {
    const d = JSON.parse(text) as { error?: { message?: string } }
    return d?.error?.message || fallback
  } catch {
    return text?.trim()?.slice(0, 800) || fallback
  }
}

const MAX_BODY_SIZE = 25 * 1024 * 1024 // 25MB for base64 images

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let data = ''
    let size = 0
    req.on('data', (c: Buffer) => {
      size += c.length
      if (size > MAX_BODY_SIZE) {
        req.destroy()
        resolve(null)
        return
      }
      data += c.toString()
    })
    req.on('end', () => {
      try { resolve(JSON.parse(data)) }
      catch { resolve(null) }
    })
  })
}

const rateLimits = new Map<string, { count: number; reset: number }>()

function isLimited(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const e = rateLimits.get(ip)
  if (!e || now > e.reset) {
    rateLimits.set(ip, { count: 1, reset: now + windowMs })
    return false
  }
  e.count++
  return e.count > max
}

export function apiPlugin(): Plugin {
  /** Заполняется в configResolved через loadEnv — не читать process.env при импорте модуля. */
  let geminiApiKey = ''
  let envMode = 'development'
  let envDir = process.cwd()

  const refreshGeminiApiKey = () => {
    const fromFiles = loadEnv(envMode, envDir, '')
      geminiApiKey = (
        fromFiles.NVIDIA_API_KEY ||
        process.env.NVIDIA_API_KEY ||
        fromFiles.OPENROUTER_API_KEY ||
        process.env.OPENROUTER_API_KEY ||
        fromFiles.GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        ''
      ).trim()
    if (geminiApiKey) {
        process.env.NVIDIA_API_KEY = geminiApiKey
    }
    return geminiApiKey
  }

  return {
    name: 'superwizard-api',
    configResolved(config) {
      envMode = config.mode
      envDir = config.envDir || process.cwd()
      refreshGeminiApiKey()
    },
    configureServer(server) {
      if (!geminiApiKey) {
        console.warn(
          '[SuperWizard] NVIDIA_API_KEY пустой — добавьте NVIDIA_API_KEY в .env рядом с vite.config.ts и перезапустите npm run dev.'
        )
      }

      const handle: Connect.NextHandleFunction = async (req, res, next) => {
        const url = req.url || ''
        const pathOnly = pathnameOnly(url)

        if (!pathOnly.startsWith('/api')) return next()
        refreshGeminiApiKey()

        const ip = req.socket.remoteAddress || '0'

        if (pathOnly.startsWith('/api/chat') && isLimited(ip, 20, 60000)) {
          return sendJson(res as ServerResponse, 429, { error: { message: 'Слишком много запросов' } })
        }

        if (pathOnly === '/api' && req.method === 'GET') {
          return sendJson(res as ServerResponse, 200, {
            ok: true,
            service: 'superwizard-api',
            endpoints: ['/api/models', '/api/chat', '/api/chat/stream'],
          })
        }

        if (pathOnly === '/api/chat/stream' && req.method === 'POST') {
          const body = await readBody(req)
          const err = validateBody(body)
          if (err) return sendJson(res as ServerResponse, 400, { error: { message: err } })

          if (!geminiApiKey) {
            return sendJson(res as ServerResponse, 500, {
              error: {
                message:
                  'Сервер: не задан NVIDIA_API_KEY в .env (рядом с vite.config.ts). Перезапустите npm run dev.',
              },
            })
          }

          try {
            const genBody = buildGeminiGenerateBody(sanitize(body))
            genBody.stream = true
            const streamUrl = `${GEMINI_API_BASE}/chat/completions`
            const geminiRes = await geminiFetchWithRetry(streamUrl, {
              method: 'POST',
              headers: geminiRequestHeaders(geminiApiKey),
              body: JSON.stringify(genBody),
            })

            if (!geminiRes.ok) {
              const msg = await geminiErrorMessage(geminiRes, 'Gemini stream failed')
              return sendJson(res as ServerResponse, geminiRes.status, { error: { message: msg } })
            }

            res.writeHead!(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
            })

            await pipeGeminiSseToOpenAI(
              res as ServerResponse,
              geminiRes.body as ReadableStream<Uint8Array>,
              req as IncomingMessage
            )
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e)
            console.error('[SuperWizard] Stream error:', e)
            if (!(res as ServerResponse).headersSent) {
              sendJson(res as ServerResponse, 500, {
                error: { message: msg || 'Internal error' },
              })
            }
          }
          return
        }

        if (pathOnly === '/api/chat' && req.method === 'POST') {
          const body = await readBody(req)
          const err = validateBody(body)
          if (err) return sendJson(res as ServerResponse, 400, { error: { message: err } })

          if (!geminiApiKey) {
            return sendJson(res as ServerResponse, 500, {
              error: {
                message:
                  'Сервер: не задан NVIDIA_API_KEY в .env (рядом с vite.config.ts). Перезапустите npm run dev.',
              },
            })
          }

          try {
            const genBody = buildGeminiGenerateBody(sanitize(body))
            const urlGen = `${GEMINI_API_BASE}/chat/completions`
            const geminiRes = await geminiFetchWithRetry(urlGen, {
              method: 'POST',
              headers: geminiRequestHeaders(geminiApiKey),
              body: JSON.stringify(genBody),
            })
            if (!geminiRes.ok) {
              const msg = await geminiErrorMessage(geminiRes, 'Gemini request failed')
              return sendJson(res as ServerResponse, geminiRes.status, { error: { message: msg } })
            }
            const d = await geminiRes.json()
            sendJson(res as ServerResponse, 200, geminiResponseToOpenAIChat(d, CHAT_MODEL_ID))
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e)
            sendJson(res as ServerResponse, 500, { error: { message: msg || 'Internal error' } })
          }
          return
        }

        if (pathOnly === '/api/models' && req.method === 'GET') {
          sendJson(res as ServerResponse, 200, staticModelsOpenAIFormat())
          return
        }

        sendJson(res as ServerResponse, 404, {
          error: {
            message: `Not found: ${req.method || 'UNKNOWN'} ${pathOnly}`,
          },
        })
      }

      server.middlewares.use(handle)
    },
  }
}
