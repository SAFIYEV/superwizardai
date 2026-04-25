/**
 * Встроенные справочники по юрисдикциям: официальные порталы, иерархия НПА, ключевые акты.
 * Подмешиваются в системный промпт; не заменяют полные тексты законов и актуальную редакцию.
 */
import gb from '../data/legal/corpus/gb.md?raw'
import us from '../data/legal/corpus/us.md?raw'
import fr from '../data/legal/corpus/fr.md?raw'
import de from '../data/legal/corpus/de.md?raw'
import at from '../data/legal/corpus/at.md?raw'
import ru from '../data/legal/corpus/ru.md?raw'
import kz from '../data/legal/corpus/kz.md?raw'
import uz from '../data/legal/corpus/uz.md?raw'
import az from '../data/legal/corpus/az.md?raw'

const CORPUS = {
  gb,
  us,
  fr,
  de,
  at,
  ru,
  kz,
  uz,
  az,
} as const

export type CorpusJurisdictionId = keyof typeof CORPUS

export function getLegalCorpusForJurisdiction(id: string): string {
  const key = id as CorpusJurisdictionId
  return CORPUS[key] ?? CORPUS.ru
}
