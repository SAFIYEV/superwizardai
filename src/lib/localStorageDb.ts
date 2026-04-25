import type { Conversation, FileAttachment, Message, UserBot, UserBotStats } from '../types'

const STORAGE_KEY = 'superwizard-local-v1'

type StoredMessage = Message

interface StoredConversation {
  id: string
  userId: string
  title: string
  model: string
  createdAt: string
  messages: StoredMessage[]
}

interface LocalStoreShape {
  conversations: StoredConversation[]
  bots: UserBot[]
}

function defaultStore(): LocalStoreShape {
  return { conversations: [], bots: [] }
}

function readStore(): LocalStoreShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultStore()
    const parsed = JSON.parse(raw) as LocalStoreShape
    if (!Array.isArray(parsed.conversations) || !Array.isArray(parsed.bots)) return defaultStore()
    return parsed
  } catch {
    return defaultStore()
  }
}

function writeStore(store: LocalStoreShape): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48)
}

export async function loadConversations(userId: string): Promise<Conversation[]> {
  const store = readStore()
  const list = store.conversations
    .filter((c) => c.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return list.map((conv) => ({
    id: conv.id,
    title: conv.title,
    model: conv.model,
    createdAt: conv.createdAt,
    messages: conv.messages.map((m) => ({ ...m })),
  }))
}

export async function createConversation(
  id: string,
  userId: string,
  title: string,
  model: string
): Promise<void> {
  const store = readStore()
  if (store.conversations.some((c) => c.id === id)) return
  store.conversations.push({
    id,
    userId,
    title,
    model,
    createdAt: new Date().toISOString(),
    messages: [],
  })
  writeStore(store)
}

export async function deleteConversation(id: string): Promise<void> {
  const store = readStore()
  store.conversations = store.conversations.filter((c) => c.id !== id)
  writeStore(store)
}

export async function addMessage(
  id: string,
  conversationId: string,
  role: string,
  content: string,
  model?: string,
  files?: FileAttachment[]
): Promise<void> {
  const store = readStore()
  const conv = store.conversations.find((c) => c.id === conversationId)
  if (!conv) return
  const ts = new Date().toISOString()
  const msg: StoredMessage = {
    id,
    role: role as Message['role'],
    content,
    model,
    timestamp: ts,
  }
  if (files?.length) msg.files = files
  conv.messages.push(msg)
  writeStore(store)
}

export async function updateMessageContent(id: string, content: string): Promise<void> {
  if (!id) return
  const store = readStore()
  for (const conv of store.conversations) {
    const msg = conv.messages.find((m) => m.id === id)
    if (msg) {
      msg.content = content
      writeStore(store)
      return
    }
  }
}

export async function loadBots(userId: string): Promise<UserBot[]> {
  const store = readStore()
  return store.bots
    .filter((b) => b.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((b) => ({ ...b, mediaLinks: [...(b.mediaLinks || [])] }))
}

export async function createBot(
  userId: string,
  payload: Pick<
    UserBot,
    | 'name'
    | 'description'
    | 'model'
    | 'systemPrompt'
    | 'authorName'
    | 'isPublic'
    | 'username'
    | 'avatarUrl'
    | 'mediaLinks'
  >
): Promise<UserBot> {
  const store = readStore()
  const baseSlug = slugify(payload.name) || `bot-${Math.floor(Date.now() / 1000)}`
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`
  const now = new Date().toISOString()
  const bot: UserBot = {
    id: crypto.randomUUID(),
    userId,
    name: payload.name,
    slug,
    authorName: payload.authorName,
    username: payload.username,
    description: payload.description,
    model: payload.model,
    systemPrompt: payload.systemPrompt,
    isPublic: payload.isPublic,
    avatarUrl: payload.avatarUrl,
    mediaLinks: payload.mediaLinks || [],
    useCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  store.bots.push(bot)
  writeStore(store)
  return { ...bot, mediaLinks: [...bot.mediaLinks] }
}

export async function updateBot(
  id: string,
  payload: Pick<
    UserBot,
    | 'name'
    | 'description'
    | 'model'
    | 'systemPrompt'
    | 'authorName'
    | 'isPublic'
    | 'avatarUrl'
    | 'mediaLinks'
  >
): Promise<UserBot> {
  const store = readStore()
  const idx = store.bots.findIndex((b) => b.id === id)
  if (idx < 0) throw new Error('Bot not found')
  const current = store.bots[idx]
  const updated: UserBot = {
    ...current,
    name: payload.name,
    authorName: payload.authorName,
    description: payload.description,
    model: payload.model,
    systemPrompt: payload.systemPrompt,
    isPublic: payload.isPublic,
    avatarUrl: payload.avatarUrl,
    mediaLinks: payload.mediaLinks || [],
    username: current.username,
    updatedAt: new Date().toISOString(),
  }
  store.bots[idx] = updated
  writeStore(store)
  return { ...updated, mediaLinks: [...updated.mediaLinks] }
}

export async function deleteBot(id: string): Promise<void> {
  const store = readStore()
  store.bots = store.bots.filter((b) => b.id !== id)
  writeStore(store)
}

export async function loadPublicBots(limit = 100): Promise<UserBot[]> {
  const store = readStore()
  return store.bots
    .filter((b) => b.isPublic)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
    .map((b) => ({ ...b, mediaLinks: [...(b.mediaLinks || [])] }))
}

export async function loadPublicBotBySlug(slug: string): Promise<UserBot | null> {
  const store = readStore()
  const b = store.bots.find((x) => x.slug === slug && x.isPublic)
  if (!b) return null
  return { ...b, mediaLinks: [...(b.mediaLinks || [])] }
}

export async function incrementBotUsage(id: string): Promise<void> {
  const store = readStore()
  const b = store.bots.find((x) => x.id === id)
  if (b) {
    b.useCount = (b.useCount || 0) + 1
    writeStore(store)
  }
}

export async function loadUserBotStats(userId: string): Promise<UserBotStats> {
  const store = readStore()
  const mine = store.bots.filter((b) => b.userId === userId)
  const botsCount = mine.length
  const usersReach = mine.reduce((s, b) => s + (b.useCount || 0), 0)
  const convIds = new Set(
    store.conversations.filter((c) => c.userId === userId).map((c) => c.id)
  )
  let promptsCount = 0
  for (const c of store.conversations) {
    if (!convIds.has(c.id)) continue
    promptsCount += c.messages.filter((m) => m.role === 'user').length
  }
  return { botsCount, usersReach, promptsCount }
}
