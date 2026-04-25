import { createPortal } from 'react-dom'
import { X, ExternalLink } from 'lucide-react'
import type { ParsedCitation } from '../lib/citationParse'
import { useLang } from '../contexts/LangContext'

interface Props {
  citation: ParsedCitation
  onClose: () => void
}

export default function CitationModal({ citation, onClose }: Props) {
  const { t } = useLang()

  return createPortal(
    <div className="citation-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="citation-modal" role="dialog" aria-modal="true" aria-labelledby="citation-modal-title">
        <div className="citation-modal__header">
          <h2 id="citation-modal-title" className="citation-modal__title">
            {citation.label || citation.url}
          </h2>
          <button type="button" className="citation-modal__close" onClick={onClose} aria-label={t('export.cancel')}>
            <X size={20} />
          </button>
        </div>
        <div className="citation-modal__body">
          {citation.fullText ? (
            <pre className="citation-modal__text">{citation.fullText}</pre>
          ) : (
            <p className="citation-modal__empty">{t('citation.noFullText')}</p>
          )}
        </div>
        <div className="citation-modal__footer">
          <a
            className="citation-modal__official"
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} aria-hidden />
            {t('citation.openOfficial')}
          </a>
        </div>
      </div>
    </div>,
    document.body
  )
}
