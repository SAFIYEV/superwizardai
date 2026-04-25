import { useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { marked } from 'marked'
import { X, FileDown, Eye, Pencil, FileType } from 'lucide-react'
import {
  exportToPdf,
  splitLawyerColumns,
  exportLawyerPdf,
  exportLawyerDocx,
} from '../lib/exportUtils'
import { useLang } from '../contexts/LangContext'

interface Props {
  content: string
  onClose: () => void
}

marked.setOptions({
  breaks: true,
  gfm: true,
})

export default function ExportPreview({ content, onClose }: Props) {
  const { t } = useLang()
  const [text, setText] = useState(content)
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [exporting, setExporting] = useState(false)
  const [lawyerMode, setLawyerMode] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const html = useMemo(() => marked.parse(text) as string, [text])

  const title = useMemo(() => {
    const first = text.split('\n').find((l) => l.trim())
    return first?.replace(/^#+\s*/, '').replace(/\*\*/g, '').slice(0, 80) || t('export.document')
  }, [text, t])

  const { answer: lawyerAnswer, sources: lawyerSources } = useMemo(
    () => splitLawyerColumns(text),
    [text]
  )

  const handleExportPdf = async () => {
    setExporting(true)
    try {
      if (lawyerMode) {
        await exportLawyerPdf(
          lawyerAnswer,
          lawyerSources,
          title,
          t('export.lawyerColAnswer'),
          t('export.lawyerColSources'),
          t('export.lawyerSubtitle')
        )
      } else {
        await exportToPdf(text, title)
      }
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleExportDocx = async () => {
    setExporting(true)
    try {
      await exportLawyerDocx(
        lawyerAnswer,
        lawyerSources,
        title,
        t('export.lawyerColAnswer'),
        t('export.lawyerColSources')
      )
    } catch (err) {
      console.error('Export DOCX error:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleQuickLegalReport = async () => {
    setExporting(true)
    try {
      await exportLawyerPdf(
        lawyerAnswer,
        lawyerSources,
        title,
        t('export.lawyerColAnswer'),
        t('export.lawyerColSources'),
        t('export.lawyerSubtitle')
      )
    } catch (err) {
      console.error('Quick legal export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return createPortal(
    <div className="export-overlay" onClick={handleOverlayClick}>
      <div className="export-modal">
        <div className="export-modal__header">
          <h2>{t('export.title')}</h2>
          <div className="export-modal__tabs">
            <button
              className={`export-modal__tab ${mode === 'preview' ? 'export-modal__tab--active' : ''}`}
              onClick={() => setMode('preview')}
            >
              <Eye size={14} />
              {t('export.preview')}
            </button>
            <button
              className={`export-modal__tab ${mode === 'edit' ? 'export-modal__tab--active' : ''}`}
              onClick={() => {
                setMode('edit')
                setTimeout(() => textareaRef.current?.focus(), 50)
              }}
            >
              <Pencil size={14} />
              {t('export.editor')}
            </button>
          </div>
          <button className="export-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="export-modal__lawyer-row">
          <label className="export-modal__lawyer-label">
            <input
              type="checkbox"
              checked={lawyerMode}
              onChange={(e) => setLawyerMode(e.target.checked)}
            />
            {t('export.lawyerMode')}
          </label>
          {lawyerMode && (
            <span className="export-modal__lawyer-hint">{t('export.lawyerHint')}</span>
          )}
        </div>

        <div className="export-modal__body">
          {mode === 'edit' ? (
            <div className="export-modal__editor-wrap">
              <textarea
                ref={textareaRef}
                className="export-modal__editor"
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
              />
              <div className="export-modal__hint">
                {t('export.hint')}
              </div>
            </div>
          ) : (
            <div
              className="export-modal__preview"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>

        <div className="export-modal__footer">
          <div className="export-modal__info">
            {text.length} {t('export.chars')} · {text.split('\n').length} {t('export.lines')}
          </div>
          <div className="export-modal__actions">
            <button
              className="export-modal__btn export-modal__btn--primary"
              onClick={handleQuickLegalReport}
              disabled={exporting || !text.trim()}
            >
              <FileDown size={15} />
              {exporting ? t('export.creating') : t('export.quickLegalReport')}
            </button>
            <button
              className="export-modal__btn export-modal__btn--secondary"
              onClick={onClose}
            >
              {t('export.cancel')}
            </button>
            {lawyerMode && (
              <button
                className="export-modal__btn export-modal__btn--primary"
                onClick={handleExportDocx}
                disabled={exporting || !text.trim()}
              >
                <FileType size={15} />
                {exporting ? t('export.creating') : t('export.downloadDocx')}
              </button>
            )}
            <button
              className="export-modal__btn export-modal__btn--primary"
              onClick={handleExportPdf}
              disabled={exporting || !text.trim()}
            >
              <FileDown size={15} />
              {exporting ? t('export.creating') : t('export.downloadPdf')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
