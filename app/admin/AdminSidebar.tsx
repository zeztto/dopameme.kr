'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

type AdminSidebarProps = {
  userName: string
  userEmail: string
}

const navItems = [
  { href: '/admin', label: '대시보드', description: '운영 현황' },
  { href: '/admin/markets', label: '마켓 관리', description: '목업 및 운영 마켓' },
  { href: '/admin/markets/create', label: '마켓 생성', description: '신규 예측 등록' },
]

export default function AdminSidebar({ userName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex w-full flex-col border-r-3 border-primary/15 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-72">
      <div className="border-b-3 border-primary/15 px-6 py-6">
        <Link href="/admin" className="block">
          <div className="text-2xl font-black">
            <span className="text-primary">도</span>
            <span className="text-secondary">파</span>
            <span className="text-primary">밈</span>
          </div>
          <div className="mt-1 text-sm font-bold text-text-tertiary">
            Admin Backoffice
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {navItems.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-dopameme-md border-2 px-4 py-3 transition ${
                active
                  ? 'border-primary bg-primary text-white shadow-token-md'
                  : 'border-transparent bg-white text-text-secondary hover:border-primary/20 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              <div className="text-sm font-black">{item.label}</div>
              <div className={`mt-0.5 text-xs font-bold ${active ? 'text-white/80' : 'text-text-tertiary'}`}>
                {item.description}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="border-t-3 border-primary/15 p-4">
        <div className="rounded-dopameme-md border-2 border-light-border bg-light-bg-alt p-4">
          <div className="text-sm font-black text-text-primary">{userName}</div>
          <div className="mt-1 truncate text-xs font-semibold text-text-tertiary">
            {userEmail}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Link
            href="/markets"
            className="flex-1 rounded-dopameme-pill border-2 border-primary px-4 py-2.5 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
          >
            서비스
          </Link>
          <LogoutButton />
        </div>
      </div>
    </aside>
  )
}
