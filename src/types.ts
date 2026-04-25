export interface FileAttachment {
  id: string
  name: string
  type: 'image' | 'pdf'
  mimeType: string
  /** base64 data URL for images, extracted text for PDFs */
  data: string
  /** preview thumbnail (base64 data URL) for images */
  preview?: string
  /** OCR-extracted text from image or scanned PDF */
  ocrText?: string
  size: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  timestamp: string
  files?: FileAttachment[]
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  model: string
  createdAt: string
}

export interface UserBot {
  id: string
  userId?: string
  name: string
  slug: string
  authorName: string
  username: string
  description: string
  model: string
  systemPrompt: string
  isPublic: boolean
  avatarUrl: string
  mediaLinks: string[]
  useCount: number
  createdAt: string
  updatedAt: string
}

export interface UserBotStats {
  botsCount: number
  usersReach: number
  promptsCount: number
}

export interface ModelInfo {
  id: string
  name: string
  provider: string
  speed: string
  context: string
  vision?: boolean
}

/** Единственная модель — Gemma 4 (через OpenRouter). */
export const DEFAULT_MODEL_ID = 'google/gemma-4-26b-a4b-it:free'

export const MODELS: ModelInfo[] = [
  {
    id: DEFAULT_MODEL_ID,
    name: 'Gemma 4 26B A4B IT (Free)',
    provider: 'OpenRouter',
    speed: 'Legal',
    context: '1M+',
    vision: true,
  },
]

export const VISION_MODELS = new Set(
  MODELS.filter((m) => m.vision).map((m) => m.id)
)
