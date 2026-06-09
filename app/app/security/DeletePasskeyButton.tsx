'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deletePasskey } from './actions'

type DeletePasskeyButtonProps = {
  credentialId: string
}

export default function DeletePasskeyButton({
  credentialId,
}: DeletePasskeyButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await deletePasskey({ credentialId })

      if (!result.success) {
        setError(result.error || '패스키를 삭제하지 못했습니다')
        return
      }

      router.refresh()
    } catch {
      setError('패스키를 삭제하지 못했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-dopameme-pill border-2 border-secondary px-4 py-2 text-xs font-black text-secondary transition hover:bg-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? '삭제 중' : '삭제'}
      </button>
      {error && (
        <p className="max-w-56 text-right text-xs font-bold text-secondary">
          {error}
        </p>
      )}
    </div>
  )
}
