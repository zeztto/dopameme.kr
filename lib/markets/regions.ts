export const MARKET_CATEGORIES = ['경제', '정치', '스포츠', '연예', '기술', '국제', '기타'] as const

export const DEFAULT_MARKET_REGION = 'KR'
export const DEFAULT_MARKET_LANGUAGE = 'ko'
export const DEFAULT_MARKET_TIME_ZONE = 'Asia/Seoul'

export const MARKET_REGION_OPTIONS = [
  { code: 'KR', label: '한국', flag: '🇰🇷', languageCode: 'ko', timeZone: 'Asia/Seoul' },
  { code: 'US', label: '미국', flag: '🇺🇸', languageCode: 'en', timeZone: 'America/New_York' },
  { code: 'JP', label: '일본', flag: '🇯🇵', languageCode: 'ja', timeZone: 'Asia/Tokyo' },
  { code: 'EU', label: '유럽', flag: '🇪🇺', languageCode: 'en', timeZone: 'Europe/Brussels' },
  { code: 'GLOBAL', label: '글로벌', flag: '🌐', languageCode: 'en', timeZone: 'UTC' },
] as const

export const MARKET_TIME_ZONE_OPTIONS = [
  { value: 'Asia/Seoul', label: '서울', abbreviation: 'KST' },
  { value: 'America/New_York', label: '뉴욕', abbreviation: 'ET' },
  { value: 'America/Los_Angeles', label: '로스앤젤레스', abbreviation: 'PT' },
  { value: 'Asia/Tokyo', label: '도쿄', abbreviation: 'JST' },
  { value: 'Europe/Brussels', label: '브뤼셀', abbreviation: 'CET/CEST' },
  { value: 'Europe/London', label: '런던', abbreviation: 'GMT/BST' },
  { value: 'UTC', label: 'UTC', abbreviation: 'UTC' },
] as const

export const MARKET_LANGUAGE_OPTIONS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
] as const

export type MarketRegionCode = (typeof MARKET_REGION_OPTIONS)[number]['code']
export type MarketLanguageCode = (typeof MARKET_LANGUAGE_OPTIONS)[number]['code']
export type MarketTimeZone = (typeof MARKET_TIME_ZONE_OPTIONS)[number]['value']
export type MarketDisplayLocale = 'ko' | 'en' | 'ja'

const MARKET_REGION_LABELS: Record<MarketRegionCode, Record<MarketDisplayLocale, string>> = {
  KR: { ko: '한국', en: 'Korea', ja: '韓国' },
  US: { ko: '미국', en: 'United States', ja: '米国' },
  JP: { ko: '일본', en: 'Japan', ja: '日本' },
  EU: { ko: '유럽', en: 'Europe', ja: '欧州' },
  GLOBAL: { ko: '글로벌', en: 'Global', ja: 'グローバル' },
}

const MARKET_CATEGORY_LABELS: Record<string, Record<MarketDisplayLocale, string>> = {
  경제: { ko: '경제', en: 'Economy', ja: '経済' },
  정치: { ko: '정치', en: 'Politics', ja: '政治' },
  스포츠: { ko: '스포츠', en: 'Sports', ja: 'スポーツ' },
  연예: { ko: '연예', en: 'Entertainment', ja: 'エンタメ' },
  기술: { ko: '기술', en: 'Technology', ja: 'テクノロジー' },
  국제: { ko: '국제', en: 'International', ja: '国際' },
  기타: { ko: '기타', en: 'Other', ja: 'その他' },
}

function normalizeMarketDisplayLocale(value: string | null | undefined): MarketDisplayLocale {
  return value === 'en' || value === 'ja' ? value : 'ko'
}

export function normalizeMarketRegion(value: string | null | undefined): MarketRegionCode {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : ''
  return MARKET_REGION_OPTIONS.some((region) => region.code === normalized)
    ? normalized as MarketRegionCode
    : DEFAULT_MARKET_REGION
}

export function normalizeMarketLanguage(value: string | null | undefined): MarketLanguageCode {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return MARKET_LANGUAGE_OPTIONS.some((language) => language.code === normalized)
    ? normalized as MarketLanguageCode
    : DEFAULT_MARKET_LANGUAGE
}

export function normalizeMarketTimeZone(value: string | null | undefined): MarketTimeZone {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return MARKET_TIME_ZONE_OPTIONS.some((timeZone) => timeZone.value === normalized)
    ? normalized as MarketTimeZone
    : DEFAULT_MARKET_TIME_ZONE
}

export function getMarketRegionOption(value: string | null | undefined) {
  const region = normalizeMarketRegion(value)
  return MARKET_REGION_OPTIONS.find((option) => option.code === region) || MARKET_REGION_OPTIONS[0]
}

export function getMarketRegionLabel(
  value: string | null | undefined,
  locale: string | null | undefined = 'ko',
) {
  const region = normalizeMarketRegion(value)
  const displayLocale = normalizeMarketDisplayLocale(locale)
  return MARKET_REGION_LABELS[region][displayLocale]
}

export function getMarketCategoryLabel(
  value: string | null | undefined,
  locale: string | null | undefined = 'ko',
) {
  if (!value) return ''
  const displayLocale = normalizeMarketDisplayLocale(locale)
  return MARKET_CATEGORY_LABELS[value]?.[displayLocale] || value
}

export function getMarketTimeZoneOption(value: string | null | undefined) {
  const timeZone = normalizeMarketTimeZone(value)
  return MARKET_TIME_ZONE_OPTIONS.find((option) => option.value === timeZone) || MARKET_TIME_ZONE_OPTIONS[0]
}

export function getDefaultLanguageForRegion(value: string | null | undefined): MarketLanguageCode {
  return normalizeMarketLanguage(getMarketRegionOption(value).languageCode)
}

export function getDefaultTimeZoneForRegion(value: string | null | undefined): MarketTimeZone {
  return normalizeMarketTimeZone(getMarketRegionOption(value).timeZone)
}

export function isOverseasMarket(value: string | null | undefined) {
  return normalizeMarketRegion(value) !== DEFAULT_MARKET_REGION
}

export function formatMarketDateTime(
  date: Date | string,
  timeZone: string | null | undefined,
  locale = 'ko-KR',
) {
  const normalizedTimeZone = normalizeMarketTimeZone(timeZone)
  const timeZoneMeta = getMarketTimeZoneOption(normalizedTimeZone)
  const parsedDate = typeof date === 'string' ? new Date(date) : date

  return `${new Intl.DateTimeFormat(locale, {
    timeZone: normalizedTimeZone,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate)} ${timeZoneMeta.abbreviation}`
}

export function formatMarketLongDateTime(
  date: Date | string,
  timeZone: string | null | undefined,
  locale = 'ko-KR',
) {
  const normalizedTimeZone = normalizeMarketTimeZone(timeZone)
  const timeZoneMeta = getMarketTimeZoneOption(normalizedTimeZone)
  const parsedDate = typeof date === 'string' ? new Date(date) : date

  return `${new Intl.DateTimeFormat(locale, {
    timeZone: normalizedTimeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate)} ${timeZoneMeta.abbreviation}`
}

function getTimeZoneDateTimeParts(date: Date, timeZone: MarketTimeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const hour = Number(values.hour) === 24 ? 0 : Number(values.hour)

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour,
    minute: Number(values.minute),
    second: Number(values.second),
  }
}

function getTimeZoneOffsetMs(date: Date, timeZone: MarketTimeZone) {
  const values = getTimeZoneDateTimeParts(date, timeZone)

  return Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
  ) - date.getTime()
}

export function parseMarketLocalDateTime(value: string, timeZone: string | null | undefined) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return new Date(Number.NaN)

  const normalizedTimeZone = normalizeMarketTimeZone(timeZone)
  const [, rawYear, rawMonth, rawDay, rawHour, rawMinute] = match
  const year = Number(rawYear)
  const month = Number(rawMonth)
  const day = Number(rawDay)
  const hour = Number(rawHour)
  const minute = Number(rawMinute)

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    return new Date(Number.NaN)
  }

  const localAsUtc = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
  )
  const localCalendarDate = new Date(localAsUtc)

  if (
    localCalendarDate.getUTCFullYear() !== year ||
    localCalendarDate.getUTCMonth() !== month - 1 ||
    localCalendarDate.getUTCDate() !== day ||
    localCalendarDate.getUTCHours() !== hour ||
    localCalendarDate.getUTCMinutes() !== minute
  ) {
    return new Date(Number.NaN)
  }

  const firstOffset = getTimeZoneOffsetMs(new Date(localAsUtc), normalizedTimeZone)
  const firstUtc = localAsUtc - firstOffset
  const secondOffset = getTimeZoneOffsetMs(new Date(firstUtc), normalizedTimeZone)
  const parsedDate = new Date(localAsUtc - secondOffset)
  const parsedParts = getTimeZoneDateTimeParts(parsedDate, normalizedTimeZone)

  if (
    parsedParts.year !== year ||
    parsedParts.month !== month ||
    parsedParts.day !== day ||
    parsedParts.hour !== hour ||
    parsedParts.minute !== minute
  ) {
    return new Date(Number.NaN)
  }

  return parsedDate
}
