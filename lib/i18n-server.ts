import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, LOCALE_COOKIE, normalizeLocale, type Locale } from '@/lib/i18n'

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value || DEFAULT_LOCALE)
}
