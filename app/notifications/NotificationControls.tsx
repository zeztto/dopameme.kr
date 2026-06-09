'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { markAllNotificationsRead, markNotificationRead } from './actions'

type NotificationControlsProps = {
  notificationId?: string
  mode: 'single' | 'all'
}

export default function NotificationControls({
  notificationId,
  mode,
}: NotificationControlsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClick = async () => {
    setLoading(true)
    setError('')

    try {
      const result = mode === 'all'
        ? await markAllNotificationsRead()
        : await markNotificationRead({ notificationId: notificationId || '' })

      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || '알림 처리 중 오류가 발생했습니다')
      }
    } catch {
      setError('알림 처리 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-dopameme-pill border-2 border-primary bg-white px-4 py-2 text-xs font-black text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? '처리 중' : mode === 'all' ? '모두 읽음' : '읽음'}
      </button>
      {error && (
        <div className="max-w-56 rounded-dopameme-md border-2 border-secondary bg-secondary/10 px-3 py-2 text-xs font-bold text-secondary">
          {error}
        </div>
      )}
    </div>
  )
}
