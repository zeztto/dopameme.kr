'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const isSecureOrigin = window.location.protocol === 'https:'
      || window.location.hostname === 'localhost'
      || window.location.hostname === '127.0.0.1'

    if (!isSecureOrigin) return

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed:', error)
    })
  }, [])

  return null
}
