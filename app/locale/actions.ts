'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LOCALE_COOKIE, normalizeLocale } from '@/lib/i18n'

function safeRedirectPath(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return '/'
  if (!value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

export async function setLocaleAction(formData: FormData) {
  const locale = normalizeLocale(formData.get('locale'))
  const redirectTo = safeRedirectPath(formData.get('redirectTo'))
  const cookieStore = await cookies()

  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  redirect(redirectTo)
}
