'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type PushNotificationSettingsProps = {
  publicKey: string | null
  enabledSubscriptionCount: number
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index)
  }

  return outputArray
}

function isPushSupported() {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
}

export default function PushNotificationSettings({
  publicKey,
  enabledSubscriptionCount,
}: PushNotificationSettingsProps) {
  const router = useRouter()
  const [supported, setSupported] = useState<boolean | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadSubscriptionState() {
      const canUsePush = isPushSupported()
      if (!active) return

      setSupported(canUsePush)

      if (!canUsePush) {
        return
      }

      setPermission(Notification.permission)

      try {
        const registration = await navigator.serviceWorker.getRegistration()
        const currentSubscription = await registration?.pushManager.getSubscription()

        if (active) {
          setSubscribed(Boolean(currentSubscription))
        }
      } catch {
        if (active) {
          setSubscribed(false)
        }
      }
    }

    void loadSubscriptionState()

    return () => {
      active = false
    }
  }, [])

  const subscribe = async () => {
    if (!publicKey || !isPushSupported()) {
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const nextPermission = await Notification.requestPermission()
      setPermission(nextPermission)

      if (nextPermission !== 'granted') {
        setError('브라우저 알림 권한이 필요합니다.')
        return
      }

      let registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js')
      }

      const existingSubscription = await registration.pushManager.getSubscription()
      const subscription = existingSubscription || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      const response = await fetch('/api/push/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription.toJSON()),
      })

      if (!response.ok) {
        throw new Error('push_subscription_failed')
      }

      setSubscribed(true)
      setMessage('이 브라우저에서 푸시 알림을 받습니다.')
      router.refresh()
    } catch {
      setError('푸시 알림을 설정하지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    if (!isPushSupported()) {
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      const subscription = await registration?.pushManager.getSubscription()
      const endpoint = subscription?.endpoint

      if (endpoint) {
        await fetch('/api/push/subscriptions', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint }),
        })
        await subscription.unsubscribe()
      }

      setSubscribed(false)
      setMessage('이 브라우저의 푸시 알림을 해제했습니다.')
      router.refresh()
    } catch {
      setError('푸시 알림을 해제하지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const unavailable = !publicKey || supported === false
  const denied = permission === 'denied'

  return (
    <section className="mb-8 rounded-dopameme-xl border-3 border-light-border bg-white p-5 shadow-token-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm font-black text-text-tertiary">푸시 알림</div>
          <h2 className="mt-2 text-xl font-black text-text-primary">
            브라우저 알림 설정
          </h2>
          <p className="mt-2 text-sm font-bold text-text-secondary">
            등록된 기기 {enabledSubscriptionCount.toLocaleString()}개
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <span className={`rounded-dopameme-pill px-4 py-2 text-center text-xs font-black ${
            subscribed
              ? 'bg-success/10 text-success'
              : 'bg-light-bg-alt text-text-tertiary'
          }`}>
            {subscribed ? '현재 브라우저 ON' : '현재 브라우저 OFF'}
          </span>
          {subscribed ? (
            <button
              type="button"
              onClick={unsubscribe}
              disabled={loading}
              className="rounded-dopameme-pill border-2 border-secondary bg-white px-5 py-2 text-sm font-black text-secondary transition hover:bg-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '처리 중' : '해제'}
            </button>
          ) : (
            <button
              type="button"
              onClick={subscribe}
              disabled={loading || unavailable || denied}
              className="rounded-dopameme-pill border-2 border-primary bg-primary px-5 py-2 text-sm font-black text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '처리 중' : '받기'}
            </button>
          )}
        </div>
      </div>

      {unavailable && (
        <p className="mt-4 rounded-dopameme-md bg-light-bg-alt px-4 py-3 text-sm font-bold text-text-secondary">
          현재 환경에서는 브라우저 푸시를 사용할 수 없습니다.
        </p>
      )}
      {denied && (
        <p className="mt-4 rounded-dopameme-md bg-secondary/10 px-4 py-3 text-sm font-bold text-secondary">
          브라우저 알림 권한이 차단되어 있습니다.
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-dopameme-md bg-success/10 px-4 py-3 text-sm font-bold text-success">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-dopameme-md bg-secondary/10 px-4 py-3 text-sm font-bold text-secondary">
          {error}
        </p>
      )}
    </section>
  )
}
