import { useLang } from '../contexts/LangContext'
import type { JurisdictionId } from '../lib/jurisdictions'
import { getWelcomeSuggestions } from '../lib/welcomeSuggestions'

interface Props {
  jurisdiction: JurisdictionId
  onSuggestionClick: (text: string) => void
}

export default function WelcomeScreen({ jurisdiction, onSuggestionClick }: Props) {
  const { t, lang } = useLang()
  const suggestions = getWelcomeSuggestions(lang, jurisdiction)

  return (
    <div className="welcome">
      <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="SuperWizard" className="welcome__logo-img" />
      <h1 className="welcome__title">SuperWizard</h1>
      <p className="welcome__subtitle">{t('welcome.subtitle')}</p>
      <div className="welcome__suggestions">
        {suggestions.map((s, i) => (
          <button
            key={`${jurisdiction}-${i}`}
            className="welcome__suggestion"
            onClick={() => onSuggestionClick(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
