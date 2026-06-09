'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function OfflineStatusBanner() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const updateStatus = () => {
      setOnline(navigator.onLine)
    }

    updateStatus()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  if (online) {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-[70] mx-auto w-[calc(100%-2rem)] max-w-3xl rounded-dopameme-lg border-3 border-secondary bg-white px-4 py-3 shadow-token-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-black text-secondary">오프라인 상태</div>
          <p className="mt-1 text-sm font-bold text-text-secondary">
            연결이 복구되면 최신 데이터가 다시 동기화됩니다.
          </p>
        </div>
        <Link
          href="/offline"
          className="rounded-dopameme-pill bg-secondary px-4 py-2 text-center text-sm font-black text-white transition hover:bg-secondary-dark"
        >
          안내 보기
        </Link>
      </div>
    </div>
  )
}
