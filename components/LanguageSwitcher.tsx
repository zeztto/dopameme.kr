'use client'

import { usePathname } from 'next/navigation'
import { setLocaleAction } from '@/app/locale/actions'
import { LOCALE_LABELS, LOCALE_SHORT_LABELS, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n'

type LanguageSwitcherProps = {
  currentLocale: Locale
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname() || '/'

  return (
    <form action={setLocaleAction} className="flex items-center gap-1 rounded-dopameme-pill border-2 border-light-border bg-white p-1">
      <input type="hidden" name="redirectTo" value={pathname} />
      {SUPPORTED_LOCALES.map((locale) => {
        const active = locale === currentLocale

        return (
          <button
            key={locale}
            type="submit"
            name="locale"
            value={locale}
            aria-label={LOCALE_LABELS[locale]}
            aria-current={active ? 'true' : undefined}
            className={`rounded-dopameme-pill px-2.5 py-1.5 text-xs font-black transition ${
              active
                ? 'bg-primary text-white'
                : 'text-text-tertiary hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {LOCALE_SHORT_LABELS[locale]}
          </button>
        )
      })}
    </form>
  )
}
