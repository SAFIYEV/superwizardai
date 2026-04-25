/** Префикс в `Message.content` для сохранения ошибки стрима в БД. */
export const STREAM_ERROR_PREFIX = '__SW_STREAM_ERR__\n'

export function getStreamError(content: string): string | undefined {
  if (content.startsWith(STREAM_ERROR_PREFIX)) {
    return content.slice(STREAM_ERROR_PREFIX.length)
  }
  return undefined
}

export function formatStreamErrorContent(message: string): string {
  return STREAM_ERROR_PREFIX + message
}
