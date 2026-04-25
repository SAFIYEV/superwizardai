import type { JurisdictionId } from './jurisdictions'
import type { Lang } from './i18n'

type Four = [string, string, string, string]

const RU: Record<JurisdictionId, Four> = {
  gb: [
    'Как устроены источники права в Англии и Уэльсе (статуты и прецедент) — кратко',
    'Разбери этот пункт договора под право Англии и Уэльса: риски для сторон',
    'Сроки исковой давности по Limitation Act 1980: что учесть в типовых случаях',
    'Что проверить в договоре аренды (AST / коммерческая аренда) перед подписанием?',
  ],
  us: [
    'Какие ключевые гарантии даёт федеральная Конституция США для гражданских споров (обзор)',
    'Разбери условие контракта под UCC / общее право штата: риски для сторон',
    'Statute of limitations: что уточнить про федеральные и штатные сроки',
    'Чек-лист по коммерческому или жилому lease перед подписанием (США)',
  ],
  fr: [
    'Какие основные принципы закреплены в Конституции Франции (кратко)',
    'Разбери эту клаузу договора по праву Франции (Code civil) — риски',
    'Сроки исковой давности (prescription) во французском гражданском праве',
    'Что проверить в договоре аренды (bail) перед подписанием?',
  ],
  de: [
    'Какие основные права закрепляет Grundgesetz (Германия) — краткий обзор',
    'Разбери этот пункт договора по BGB: риски для сторон',
    'Сроки давности (Verjährung) по гражданскому праву ФРГ — что важно',
    'На что обратить внимание в Mietvertrag перед подписанием?',
  ],
  at: [
    'Основные права в австрийской правовой системе и ECHR — кратко',
    'Разбери условие договора по ABGB: риски для сторон',
    'Сроки давности по австрийскому гражданскому праву',
    'Что проверить в договоре найма (Miete) перед подписанием?',
  ],
  ru: [
    'Какие основные права закрепляет Конституция РФ?',
    'Разбери этот фрагмент договора на риски для сторон',
    'Срок исковой давности по ГК РФ для типовых требований',
    'Что проверить в договоре аренды перед подписанием?',
  ],
  kz: [
    'ҚР Конституциясы бойынша негізгі құқықтар қысқаша',
    'Осы шарттың бабын тараптар үшін тәуекелдер тұрғысынан талда',
    'Азаматтық кодекс бойынша өндірілу мерзімдері (типтік талаптар)',
    'Жалға алу шартын қол қою алдында нені тексеру керек?',
  ],
  uz: [
    'O‘zbekiston Konstitutsiyasi asosiy huquqlari (qisqa)',
    'Ushbu shartnoma bandini tomonlar uchun tahlil qil (tavakkal)',
    'Fuqarolik kodeksi bo‘yicha da’vo muddati (odatiy holatlar)',
    'Ijara shartnomasida nimani tekshirish kerak?',
  ],
  az: [
    'Azərbaycan Konstitusiyasının əsas hüquqları (qısa)',
    'Bu müqavilə bəndini tərəflər üçün risklər üzrə təhlil et',
    'Mülki Məcəllə üzrə iddia müddətləri (tipik tələblər)',
    'İcarə müqaviləsində əvvəlcədən nələri yoxlamaq lazımdır?',
  ],
}

const EN: Record<JurisdictionId, Four> = {
  gb: [
    'How do statutes and case law work together in England & Wales — short overview',
    'Review this contract clause under English law: risks for the parties',
    'Limitation periods under the Limitation Act 1980 — what to watch for',
    'What to check in an AST or commercial lease before signing?',
  ],
  us: [
    'Key civil-law guarantees in the US Constitution — short overview',
    'Review this contract clause under UCC / state law: party risks',
    'Statute of limitations: federal vs state — what to clarify',
    'Checklist for a commercial or residential lease before signing',
  ],
  fr: [
    'Main constitutional principles in France — short overview',
    'Analyse this clause under the French Civil Code: risks',
    'Prescription (limitation) periods in French civil law',
    'What to verify in a lease (bail) before signing?',
  ],
  de: [
    'Fundamental rights under the German Basic Law (GG) — short overview',
    'Review this BGB contract clause: risks for the parties',
    'Limitation (Verjährung) in German civil law — essentials',
    'What to check in a Mietvertrag before signing?',
  ],
  at: [
    'Fundamental rights in Austrian law and ECHR — short overview',
    'Review this ABGB contract clause: risks for the parties',
    'Limitation periods under Austrian civil law',
    'What to check in a rental agreement before signing?',
  ],
  ru: [
    'What fundamental rights does the Russian Constitution guarantee?',
    'Review this contract excerpt for legal risks to the parties',
    'Limitation periods under the Russian Civil Code — typical claims',
    'What to check in a lease agreement before signing?',
  ],
  kz: [
    'Main rights under the Constitution of Kazakhstan — short overview',
    'Analyse this contract clause for risks to the parties',
    'Limitation periods under the Civil Code of Kazakhstan',
    'What to verify in a lease before signing?',
  ],
  uz: [
    'Main rights under the Constitution of Uzbekistan — short overview',
    'Analyse this contract clause for party risks',
    'Limitation periods under Uzbek civil legislation',
    'What to check in a lease agreement before signing?',
  ],
  az: [
    'Main rights under the Constitution of Azerbaijan — short overview',
    'Analyse this contract clause for party risks',
    'Limitation periods under the Civil Code of Azerbaijan',
    'What to check in a lease before signing?',
  ],
}

/** Қазақ тіліндегі UI: KZ — қазақша, қалғаны — орыс тіліндегі заң терминдерімен (түсінікті) */
const KZ: Record<JurisdictionId, Four> = {
  gb: RU.gb,
  us: RU.us,
  fr: RU.fr,
  de: RU.de,
  at: RU.at,
  ru: RU.ru,
  kz: RU.kz,
  uz: RU.uz,
  az: RU.az,
}

const BY_LANG: Record<Lang, Record<JurisdictionId, Four>> = {
  ru: RU,
  en: EN,
  kz: KZ,
}

export function getWelcomeSuggestions(lang: Lang, jurisdictionId: JurisdictionId): string[] {
  const row = BY_LANG[lang]?.[jurisdictionId] ?? BY_LANG.ru[jurisdictionId] ?? BY_LANG.ru.ru
  return [...row]
}
