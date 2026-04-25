import { useState, useRef, useEffect } from 'react'
import { Scale, ChevronDown } from 'lucide-react'
import { useLang } from '../contexts/LangContext'
import type { JurisdictionId } from '../lib/jurisdictions'
import { JURISDICTIONS } from '../lib/jurisdictions'

interface Props {
  jurisdiction: JurisdictionId
  onJurisdictionChange: (id: JurisdictionId) => void
}

export default function LegalToolbar({
  jurisdiction,
  onJurisdictionChange,
}: Props) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const current =
    JURISDICTIONS.find((j) => j.id === jurisdiction) ?? JURISDICTIONS[0]

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="legal-toolbar" ref={rootRef}>
      <div className="legal-toolbar__jurisdiction">
        <Scale size={16} className="legal-toolbar__icon" aria-hidden />
        <div className="legal-toolbar__dropdown">
          <span className="sr-only">{t('legal.jurisdiction')}</span>
          <button
            type="button"
            className={`legal-toolbar__trigger ${open ? 'legal-toolbar__trigger--open' : ''}`}
            aria-expanded={open}
            aria-haspopup="listbox"
            id="jurisdiction-select"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="legal-toolbar__flag" aria-hidden>
              {current.flag}
            </span>
            <span className="legal-toolbar__label">{current.name}</span>
            <ChevronDown
              className="legal-toolbar__chevron"
              size={16}
              aria-hidden
            />
          </button>
          <div
            className={`legal-toolbar__panel ${open ? 'legal-toolbar__panel--open' : ''}`}
            role="listbox"
            aria-labelledby="jurisdiction-select"
          >
            <ul className="legal-toolbar__list">
              {JURISDICTIONS.map((j) => (
                <li key={j.id} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={j.id === jurisdiction}
                    className={`legal-toolbar__option ${j.id === jurisdiction ? 'legal-toolbar__option--active' : ''}`}
                    onClick={() => {
                      onJurisdictionChange(j.id)
                      setOpen(false)
                    }}
                  >
                    <span className="legal-toolbar__flag" aria-hidden>
                      {j.flag}
                    </span>
                    <span>{j.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
