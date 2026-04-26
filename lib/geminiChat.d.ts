import type { IncomingMessage, ServerResponse } from 'http';

export const CHAT_MODEL_ID: string;
export const ALLOWED_MODELS: Set<string>;
export const GEMINI_API_BASE: string;

export function geminiRequestHeaders(apiKey: string): Record<string, string>;

export function buildGeminiGenerateBody(sanitized: {
  messages: unknown[];
  temperature: number;
  max_tokens: number;
  use_google_search?: boolean;
}): Record<string, unknown>;

export function geminiResponseToOpenAIChat(
  data: unknown,
  modelId?: string
): Record<string, unknown>;

export function pipeGeminiSseToOpenAI(
  res: ServerResponse,
  geminiResponseBody: ReadableStream<Uint8Array>,
  req?: IncomingMessage
): Promise<void>;

export function openAiSseStreamFromGemini(
  geminiResponseBody: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array>;

export function geminiFetchWithRetry(
  url: string,
  init: RequestInit,
  maxRetries?: number,
  timeoutMs?: number
): Promise<Response>;

export function transcribeWithGemini(
  apiKey: string,
  audioBase64: string,
  mimeType?: string,
  language?: string
): Promise<{ text: string }>;

export function staticModelsOpenAIFormat(): Record<string, unknown>;
