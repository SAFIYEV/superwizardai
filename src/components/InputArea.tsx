import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { ArrowUp, Square, Paperclip, Upload, Globe, Check, X, FileText, Image as ImageIcon } from 'lucide-react'
import type { FileAttachment } from '../types'
import { processFile, formatFileSize } from '../lib/fileProcessor'
import { useLang } from '../contexts/LangContext'

interface Props {
  onSend: (text: string, files?: FileAttachment[]) => void
  isStreaming: boolean
  onStop: () => void
  webSearch: boolean
  onWebSearchChange: (v: boolean) => void
}

const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,application/pdf'

export default function InputArea({
  onSend,
  isStreaming,
  onStop,
  webSearch,
  onWebSearchChange,
}: Props) {
  const { t } = useLang()
  const [text, setText] = useState('')
  const [files, setFiles] = useState<FileAttachment[]>([])
  const [fileError, setFileError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [text])

  const [progressMsg, setProgressMsg] = useState('')

  const addFiles = useCallback(async (fileList: File[]) => {
    setProcessing(true)
    setFileError('')
    setProgressMsg('')
    for (const file of fileList) {
      try {
        const attachment = await processFile(file, setProgressMsg)
        setFiles((prev) => [...prev, attachment])
      } catch (err: unknown) {
        setFileError(err instanceof Error ? err.message : t('file.error'))
      }
    }
    setProgressMsg('')
    setProcessing(false)
    textareaRef.current?.focus()
  }, [t])

  const openFilePicker = useCallback(() => {
    if (isStreaming || processing) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = ACCEPT
    input.multiple = true
    input.style.display = 'none'
    document.body.appendChild(input)
    input.addEventListener('change', () => {
      if (input.files?.length) {
        addFiles(Array.from(input.files))
      }
      document.body.removeChild(input)
    })
    input.click()
    setMenuOpen(false)
  }, [isStreaming, processing, addFiles])

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const handleSubmit = () => {
    if ((!text.trim() && !files.length) || isStreaming || processing) return
    onSend(text.trim(), files.length ? files : undefined)
    setText('')
    setFiles([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) addFiles([file])
        return
      }
    }
  }, [addFiles])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files)
    if (dropped.length) addFiles(dropped)
  }, [addFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const toggleWeb = () => {
    onWebSearchChange(!webSearch)
  }

  const uploadDisabled = isStreaming || processing

  return (
    <div className={`input-area ${dragOver ? 'input-area--dragover' : ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
      {files.length > 0 && (
        <div className="input-area__files">
          {files.map((f) => (
            <div key={f.id} className="file-chip">
              {f.type === 'image' && f.preview ? (
                <img src={f.preview} alt={f.name} className="file-chip__thumb" />
              ) : (
                <div className="file-chip__icon">
                  {f.type === 'pdf' ? <FileText size={16} /> : <ImageIcon size={16} />}
                </div>
              )}
              <div className="file-chip__info">
                <span className="file-chip__name">{f.name}</span>
                <span className="file-chip__size">{formatFileSize(f.size)}</span>
              </div>
              <button className="file-chip__remove" onClick={() => removeFile(f.id)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {fileError && (
        <div className="input-area__file-error-wrap" role="alert">
          <p className="input-area__file-error">{fileError}</p>
          <button
            type="button"
            className="input-area__file-retry"
            onClick={() => {
              setFileError('')
              openFilePicker()
            }}
          >
            {t('input.retryFile')}
          </button>
        </div>
      )}

      <div className="input-area__wrapper">
        <div
          ref={dropdownRef}
          className={`input-area__upload-dropdown ${menuOpen ? 'input-area__upload-dropdown--open' : ''}`}
        >
          <button
            type="button"
            className="input-area__upload-trigger"
            disabled={uploadDisabled}
            aria-label={t('input.uploadMenu')}
            aria-expanded={menuOpen}
            onClick={() => {
              if (!uploadDisabled) setMenuOpen((v) => !v)
            }}
          >
            <Upload size={18} aria-hidden />
          </button>
          <div className="input-area__upload-panel" role="menu">
            <button
              type="button"
              role="menuitem"
              className="input-area__upload-item"
              onClick={(e) => {
                e.stopPropagation()
                openFilePicker()
              }}
            >
              <Paperclip size={16} />
              <span>{t('input.menuAttachFile')}</span>
            </button>
            <button
              type="button"
              role="menuitem"
              className={`input-area__upload-item ${webSearch ? 'input-area__upload-item--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                toggleWeb()
              }}
              title={t('legal.webSearchHint')}
            >
              <Globe size={16} />
              <span className="input-area__upload-item-label">{t('legal.webSearch')}</span>
              {webSearch && <Check size={16} className="input-area__upload-check" aria-hidden />}
            </button>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          className="input-area__textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={files.length ? t('input.placeholderFiles') : t('input.placeholder')}
          rows={1}
          disabled={isStreaming}
        />

        {processing && (
          <div className="input-area__processing">
            {progressMsg || t('input.processing')}
          </div>
        )}

        {isStreaming ? (
          <button type="button" className="input-area__stop" onClick={onStop} aria-label={t('input.stop')}>
            <Square size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="input-area__send"
            onClick={handleSubmit}
            disabled={(!text.trim() && !files.length) || processing}
            aria-label={t('input.send')}
          >
            <ArrowUp size={18} />
          </button>
        )}
      </div>
      <div className="input-area__hint">
        {t('input.hint')}
      </div>
    </div>
  )
}
