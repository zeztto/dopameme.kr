'use client'

import { startRegistration } from '@simplewebauthn/browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type PasskeyRegistrationCardProps = {
  credentialCount: number
}

export default function PasskeyRegistrationCard({
  credentialCount,
}: PasskeyRegistrationCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const registerPasskey = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const optionsResponse = await fetch('/api/webauthn/register/options', {
        method: 'POST',
      })
      const optionsJson = await optionsResponse.json()

      if (!optionsResponse.ok) {
        throw new Error(optionsJson?.error?.message || '패스키 등록을 시작하지 못했습니다')
      }

      const registrationResponse = await startRegistration(optionsJson.data)
      const verifyResponse = await fetch('/api/webauthn/register/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationResponse),
      })
      const verifyJson = await verifyResponse.json()

      if (!verifyResponse.ok) {
        throw new Error(verifyJson?.error?.message || '패스키 등록을 확인하지 못했습니다')
      }

      setMessage('패스키를 등록했습니다.')
      router.refresh()
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : '패스키 등록에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-dopameme-xl border-3 border-primary/20 bg-white p-6 shadow-token-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm font-black text-text-tertiary">Passkey</div>
          <h2 className="mt-2 text-2xl font-black text-text-primary">
            생체 인증 로그인
          </h2>
          <p className="mt-2 text-sm font-bold text-text-secondary">
            등록된 패스키 {credentialCount.toLocaleString()}개
          </p>
        </div>
        <button
          type="button"
          onClick={registerPasskey}
          disabled={loading || credentialCount >= 10}
          className="rounded-dopameme-pill bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? '등록 중' : '패스키 등록'}
        </button>
      </div>
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
