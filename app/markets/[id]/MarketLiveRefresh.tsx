'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type MarketLiveRefreshProps = {
  enabled: boolean
  intervalMs?: number
}

export default function MarketLiveRefresh({
  enabled,
  intervalMs = 30_000,
}: MarketLiveRefreshProps) {
  const router = useRouter()

  useEffect(() => {
    if (!enabled) return

    const intervalId = window.setInterval(() => {
      router.refresh()
    }, intervalMs)

    return () => window.clearInterval(intervalId)
  }, [enabled, intervalMs, router])

  return null
}
